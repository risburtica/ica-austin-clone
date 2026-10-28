import { createServerFn } from "@tanstack/react-start";
import { useSession, getRequestHeader } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { z } from "zod";
import { formatCentral } from "./rsvp.functions";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password: process.env["ADMIN_SESSION_SECRET"]!,
    name: "ica-admin",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

async function sha(s: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
}
async function passcodeMatches(input: string, expected: string) {
  const [a, b] = await Promise.all([sha(input), sha(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

async function requireAdmin() {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.admin) throw redirect({ to: "/admin" });
}

export const isAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return { admin: !!session.data.admin };
});

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

function clientIp() {
  const cf = getRequestHeader("cf-connecting-ip");
  const xff = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
  return (cf || xff || getRequestHeader("x-real-ip") || "unknown").slice(0, 100);
}

type LoginResult =
  | { ok: true }
  | { ok: false; locked: true; minutes: number }
  | { ok: false; locked: false; remaining: number };

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ passcode: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }): Promise<LoginResult> => {
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected) throw new Error("Admin passcode not configured");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("admin_login_attempts")
      .delete()
      .lt("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    const ip = clientIp();
    const now = Date.now();
    const { data: row } = await supabaseAdmin.from("admin_login_attempts").select("*").eq("ip", ip).maybeSingle();

    if (row?.locked_until && new Date(row.locked_until).getTime() > now) {
      return { ok: false, locked: true, minutes: Math.ceil((new Date(row.locked_until).getTime() - now) / 60000) };
    }

    if (await passcodeMatches(data.passcode, expected)) {
      if (row) await supabaseAdmin.from("admin_login_attempts").delete().eq("ip", ip);
      const session = await useSession<AdminSession>(sessionConfig());
      await session.update({ admin: true });
      return { ok: true };
    }

    await new Promise((r) => setTimeout(r, 750));
    const windowExpired = !row || now - new Date(row.window_start).getTime() > LOCK_MS || !!row.locked_until;
    const count = windowExpired ? 1 : row!.failed_count + 1;
    const lockedUntil = count >= MAX_ATTEMPTS ? new Date(now + LOCK_MS).toISOString() : null;
    await supabaseAdmin.from("admin_login_attempts").upsert({
      ip,
      failed_count: count,
      window_start: windowExpired ? new Date(now).toISOString() : row!.window_start,
      locked_until: lockedUntil,
      updated_at: new Date(now).toISOString(),
    });
    if (lockedUntil) return { ok: false, locked: true, minutes: 15 };
    return { ok: false, locked: false, remaining: MAX_ATTEMPTS - count };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

// Convert Central-time "YYYY-MM-DDTHH:mm" to a UTC ISO string.
function centralToIso(local: string) {
  const asUtc = new Date(`${local}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(asUtc);
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const shown = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"));
  return new Date(asUtc.getTime() + (asUtc.getTime() - shown)).toISOString();
}
// UTC ISO → Central "YYYY-MM-DDTHH:mm" for datetime-local inputs.
function isoToCentral(iso: string | null) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago", hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

export const listRsvpEvents = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: events } = await supabaseAdmin
    .from("events")
    .select("id, slug, title, description, event_date, rsvp_deadline, location, members_only, is_active")
    .order("event_date", { ascending: false });
  const { data: rsvps } = await supabaseAdmin.from("event_rsvps").select("event_id, attending, adults, children");
  return (events ?? []).map((e) => {
    const rows = (rsvps ?? []).filter((r) => r.event_id === e.id);
    const adults = rows.reduce((s, r) => s + r.adults, 0);
    const children = rows.reduce((s, r) => s + r.children, 0);
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      description: e.description ?? "",
      eventDateLocal: isoToCentral(e.event_date),
      deadlineLocal: isoToCentral(e.rsvp_deadline),
      membersOnly: e.members_only,
      isActive: e.is_active,
      date: formatCentral(e.event_date),
      location: e.location,
      responses: rows.length,
      attending: rows.filter((r) => r.attending).length,
      regrets: rows.filter((r) => !r.attending).length,
      adults,
      children,
      total: adults + children,
    };
  });
});

const eventInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers, dashes"),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  location: z.string().trim().max(300).optional().default(""),
  eventDateLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  deadlineLocal: z.string().regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})?$/).optional().default(""),
  membersOnly: z.boolean(),
  isActive: z.boolean(),
});

export const saveRsvpEvent = createServerFn({ method: "POST" })
  .inputValidator((d) => eventInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; slug: string } | { ok: false; error: string }> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: clash } = await supabaseAdmin.from("events").select("id").eq("slug", data.slug).maybeSingle();
    if (clash && clash.id !== data.id) return { ok: false, error: "That URL slug is already used by another event." };
    const row = {
      slug: data.slug,
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      event_date: centralToIso(data.eventDateLocal),
      rsvp_deadline: data.deadlineLocal ? centralToIso(data.deadlineLocal) : null,
      members_only: data.membersOnly,
      is_active: data.isActive,
    };
    const res = data.id
      ? await supabaseAdmin.from("events").update(row).eq("id", data.id)
      : await supabaseAdmin.from("events").insert(row);
    if (res.error) return { ok: false, error: "Could not save the event. Please try again." };
    return { ok: true, slug: data.slug };
  });

function cell(v: string | number | null | undefined) {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const exportRsvpCsv = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ev } = await supabaseAdmin.from("events").select("id, title").eq("slug", data.slug).maybeSingle();
    if (!ev) throw new Error("Event not found");
    const { data: rows } = await supabaseAdmin
      .from("event_rsvps")
      .select("full_name, email, attending, adults, children, message, created_at")
      .eq("event_id", ev.id)
      .order("created_at");
    const list = rows ?? [];
    const adults = list.reduce((s, r) => s + r.adults, 0);
    const children = list.reduce((s, r) => s + r.children, 0);
    const lines = [
      ["Full Name", "Email", "Status", "Adults", "Children", "Total", "Notes", "Submitted (Central)"],
      ...list.map((r) => [
        r.full_name,
        r.email,
        r.attending ? "Attending" : "Not Attending",
        r.adults,
        r.children,
        r.adults + r.children,
        r.message,
        formatCentral(r.created_at),
      ]),
      [],
      ["TOTALS", "", `${list.filter((r) => r.attending).length} attending / ${list.filter((r) => !r.attending).length} not attending`, adults, children, adults + children, "", ""],
      [],
      ["Total Adults", adults],
      ["Total Children", children],
      ["Total Attendees (Adults + Children)", adults + children],
    ];
    const csv = "\uFEFF" + lines.map((l) => l.map(cell).join(",")).join("\r\n");
    return { csv, filename: `${data.slug}-rsvps.csv`, title: ev.title };
  });
