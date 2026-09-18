import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Users } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageIntro } from "@/components/page-parts";
import { Button } from "@/components/ui/button";
import { events, pageHead } from "@/lib/site-data";

export const Route = createFileRoute("/rsvp")({
  head: () => pageHead("Annual Membership Meeting RSVP", "RSVP for the Annual Membership Meeting — let us know how many adults and children are attending.", "/rsvp"),
  component: Rsvp,
});

function Rsvp() {
  const meeting = events[0]!;
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    const data = new FormData(e.currentTarget);
    const { error } = await supabase.from("rsvp_submissions").insert({
      event_title: meeting.title,
      full_name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? "") || null,
      adults: Number(data.get("adults")),
      children: Number(data.get("children") ?? 0),
      message: String(data.get("message") ?? "") || null,
    });
    setState(error ? "error" : "done");
  }

  return (
    <>
      <PageIntro eyebrow="RSVP" title="Annual Membership Meeting">
        <p>{meeting.date} · {meeting.time} · {meeting.place}. {meeting.detail}</p>
      </PageIntro>
      <section className="site-container max-w-2xl py-14">
        {state === "done" ? (
          <div className="warm-card flex items-center gap-3 p-6 text-primary">
            <span className="grid size-9 place-items-center rounded-full bg-accent"><Check size={18} /></span>
            <div>
              <h3 className="font-display text-xl font-semibold">You're on the list</h3>
              <p className="text-sm text-muted-foreground">Thank you — your RSVP has been recorded. We look forward to seeing you there.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="warm-card grid gap-5 p-6 sm:p-8">
            <div className="flex items-center gap-3 text-primary"><Users size={20} /><h2 className="font-display text-2xl font-semibold">Who's coming?</h2></div>
            <label className="form-label">Full name<span>*</span><input className="form-input" name="name" required maxLength={160} /></label>
            <label className="form-label">Email (for a reminder)<input className="form-input" name="email" type="email" maxLength={320} /></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="form-label">Number of adults<span>*</span><input className="form-input" name="adults" type="number" min="1" max="50" defaultValue="1" required /></label>
              <label className="form-label">Number of children<span>*</span><input className="form-input" name="children" type="number" min="0" max="50" defaultValue="0" required /></label>
            </div>
            <label className="form-label">Anything we should know? (dietary needs, etc.)<textarea className="form-input min-h-28 resize-y" name="message" maxLength={5000} /></label>
            {state === "error" && <p className="text-sm text-destructive">We couldn't save your RSVP right now. Please try again.</p>}
            <Button type="submit" disabled={state === "saving"}>{state === "saving" ? "Sending…" : "Submit RSVP"}</Button>
            <p className="text-center text-xs text-muted-foreground">Your response is stored privately and visible only to the organizers.</p>
          </form>
        )}
        <p className="mt-6 text-center text-sm"><Link to="/events" className="font-medium text-primary underline-offset-4 hover:underline">← Back to events</Link></p>
      </section>
    </>
  );
}
