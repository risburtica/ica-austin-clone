import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
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

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ passcode: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected) throw new Error("Admin passcode not configured");
    if (!(await passcodeMatches(data.passcode, expected))) return { ok: false as const };
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const listRsvpEvents = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: events } = await supabaseAdmin
    .from("events")
    .select("id, slug, title, event_date, location, is_active")
    .order("event_date", { ascending: false });
  const { data: rsvps } = await supabaseAdmin.from("event_rsvps").select("event_id, attending, adults, children");
  return (events ?? []).map((e) => {
    const rows = (rsvps ?? []).filter((r) => r.event_id === e.id);
    const adults = rows.reduce((s, r) => s + r.adults, 0);
    const children = rows.reduce((s, r) => s + r.children, 0);
    return {
      slug: e.slug,
      title: e.title,
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
