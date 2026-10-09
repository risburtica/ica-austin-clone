import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, Check, Users } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { PageIntro } from "@/components/page-parts";
import { Button } from "@/components/ui/button";
import { getRsvpEvent, submitRsvp } from "@/lib/rsvp.functions";
import { pageHead } from "@/lib/site-data";

export const Route = createFileRoute("/rsvp/$slug")({
  loader: async ({ params }) => {
    const event = await getRsvpEvent({ data: { slug: params.slug } });
    if (!event) throw notFound();
    return event;
  },
  head: ({ loaderData, params }) =>
    pageHead(
      `RSVP: ${loaderData?.title ?? "Event"}`,
      `RSVP for ${loaderData?.title ?? "this event"} with the India Catholic Association of Central Texas.`,
      `/rsvp/${params.slug}`,
    ),
  notFoundComponent: () => (
    <section className="site-container max-w-2xl py-20 text-center">
      <h1 className="font-display text-3xl font-semibold text-primary">Event not found</h1>
      <p className="mt-3 text-muted-foreground">This RSVP link doesn't match any event.</p>
      <Button asChild className="mt-6"><Link to="/events">View upcoming events</Link></Button>
    </section>
  ),
  component: Rsvp,
});

type Done = { name: string; attending: boolean; total: number };

function Rsvp() {
  const event = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [attending, setAttending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [closed, setClosed] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const fullName = String(f.get("name") ?? "");
    const adults = attending ? Number(f.get("adults") ?? 1) : 0;
    const children = attending ? Number(f.get("children") ?? 0) : 0;
    try {
      const res = await submitRsvp({
        data: {
          eventSlug: slug,
          fullName,
          email: String(f.get("email") ?? ""),
          attending,
          adults,
          children,
          message: String(f.get("message") ?? "") || undefined,
        },
      });
      if (res.ok) setDone({ name: fullName.split(" ")[0] || fullName, attending, total: adults + children });
      else if (res.code === "closed") setClosed(res.message);
      else setError(res);
    } catch {
      setError({ code: "invalid", message: "Please check your details and try again." });
    } finally {
      setSaving(false);
    }
  }

  const isClosed = !event.isOpen || closed;

  return (
    <>
      <PageIntro eyebrow="RSVP" title={`RSVP: ${event.title}`}>
        <p>{event.eventDate}{event.location ? ` · ${event.location}` : ""}</p>
        {event.description && <p className="mt-2">{event.description}</p>}
      </PageIntro>
      <section className="site-container max-w-2xl py-14">
        {isClosed ? (
          <div className="warm-card p-6 sm:p-8 text-center">
            <h2 className="font-display text-2xl font-semibold text-primary">RSVP Closed</h2>
            <p className="mt-2 text-muted-foreground">
              {closed ?? `Registration for this event ended on ${event.deadline}.`}
            </p>
            <Button asChild className="mt-6"><Link to="/events">View upcoming events →</Link></Button>
          </div>
        ) : done ? (
          <div className="warm-card p-6 sm:p-8">
            <div className="flex items-start gap-3 text-primary">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Check size={18} /></span>
              <div>
                <h2 className="font-display text-2xl font-semibold">{done.attending ? "You're on the list!" : "Thank you for letting us know"}</h2>
                <p className="mt-2 text-muted-foreground">
                  {done.attending
                    ? `Thank you, ${done.name} — your RSVP has been recorded for ${done.total} guest${done.total === 1 ? "" : "s"}. We look forward to seeing you!`
                    : `Thank you for letting us know, ${done.name}. We'll miss you, and hope to see you at our next event!`}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link to="/events">← Back to Events</Link></Button>
              <Button asChild><Link to="/">Go to Home</Link></Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="warm-card grid gap-5 p-6 sm:p-8">
            <div className="flex items-center gap-3 text-primary"><Users size={20} /><h2 className="font-display text-2xl font-semibold">Who's coming?</h2></div>
            <label className="form-label">Full name<span>*</span><input className="form-input" name="name" required maxLength={160} /></label>
            <label className="form-label">Email<span>*</span><input className="form-input" name="email" type="email" required maxLength={320} /></label>
            <fieldset className="grid gap-2">
              <legend className="form-label mb-2">Will you attend?<span>*</span></legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { v: true, label: "Yes, I will attend" },
                  { v: false, label: "Regretfully, I cannot attend" },
                ].map((o) => (
                  <label
                    key={o.label}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${attending === o.v ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
                  >
                    <input type="radio" name="attending" checked={attending === o.v} onChange={() => setAttending(o.v)} className="accent-[var(--primary)]" />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {attending && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="form-label">Number of adults<span>*</span><input className="form-input" name="adults" type="number" min="1" max="50" defaultValue="1" required /></label>
                <label className="form-label">Number of children<input className="form-input" name="children" type="number" min="0" max="50" defaultValue="0" /></label>
              </div>
            )}
            <label className="form-label">
              {attending ? "Anything we should know? (dietary needs, accessibility, etc.)" : "Send a note to the board/organizers (optional)"}
              <textarea className="form-input min-h-28 resize-y" name="message" maxLength={5000} />
            </label>
            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                <p className="flex gap-2"><AlertTriangle size={18} className="shrink-0" />{error.message}</p>
                {error.code === "not_member" && (
                  <Button asChild size="sm" className="mt-3"><Link to="/renew-membership">Renew Membership →</Link></Button>
                )}
              </div>
            )}
            <Button type="submit" disabled={saving}>{saving ? "Sending…" : attending ? "Confirm RSVP" : "Send Regrets"}</Button>
            <p className="text-center text-xs text-muted-foreground">Your response is stored privately and visible only to the organizers.</p>
          </form>
        )}
        <p className="mt-6 text-center text-sm"><Link to="/events" className="font-medium text-primary underline-offset-4 hover:underline">← Back to events</Link></p>
      </section>
    </>
  );
}
