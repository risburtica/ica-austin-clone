import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export function formatCentral(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })
    .format(new Date(iso))
    .replace(/, (\d{1,2}:\d{2})/, " at $1");
}

async function loadEvent(slug: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("events").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export const getRsvpEvent = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const ev = await loadEvent(data.slug);
    if (!ev) return null;
    const deadline = ev.rsvp_deadline ?? ev.event_date;
    return {
      title: ev.title,
      description: ev.description,
      location: ev.location,
      membersOnly: ev.members_only,
      eventDate: formatCentral(ev.event_date),
      deadline: formatCentral(deadline),
      isOpen: ev.is_active && Date.now() <= new Date(deadline).getTime(),
    };
  });

const input = z.object({
  eventSlug: z.string().min(1).max(120),
  fullName: z.string().trim().min(1).max(160),
  email: z.string().trim().toLowerCase().email().max(320),
  attending: z.boolean(),
  adults: z.number().int().min(0).max(50),
  children: z.number().int().min(0).max(50),
  message: z.string().trim().max(5000).optional(),
});

export type RsvpResult = { ok: true } | { ok: false; code: "closed" | "not_member" | "invalid"; message: string };

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data }): Promise<RsvpResult> => {
    const ev = await loadEvent(data.eventSlug);
    if (!ev) return { ok: false, code: "invalid", message: "This event could not be found." };
    if (!ev.is_active)
      return { ok: false, code: "closed", message: "RSVPs for this event are closed (capacity reached or registration ended)." };
    const deadline = ev.rsvp_deadline ?? ev.event_date;
    if (Date.now() > new Date(deadline).getTime())
      return {
        ok: false,
        code: "closed",
        message: `RSVPs for this event closed on ${formatCentral(deadline)}. Registration is no longer open.`,
      };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (ev.members_only) {
      const { data: member } = await supabaseAdmin
        .from("membership_roster")
        .select("id")
        .eq("email", data.email)
        .eq("status", "active")
        .maybeSingle();
      if (!member)
        return {
          ok: false,
          code: "not_member",
          message:
            "This email was not found on the active ICA membership roster. Please use your registered membership email, or renew your membership to continue.",
        };
    }

    if (data.attending && data.adults < 1)
      return { ok: false, code: "invalid", message: "Please include at least one adult." };

    const { error } = await supabaseAdmin.from("event_rsvps").upsert(
      {
        event_id: ev.id,
        full_name: data.fullName,
        email: data.email,
        attending: data.attending,
        adults: data.attending ? data.adults : 0,
        children: data.attending ? data.children : 0,
        message: data.message || null,
      },
      { onConflict: "event_id,email" },
    );
    if (error) {
      console.error(error);
      return { ok: false, code: "invalid", message: "We couldn't save your RSVP right now. Please try again." };
    }
    return { ok: true };
  });
