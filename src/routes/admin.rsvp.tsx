import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminBar } from "@/components/admin-bar";
import { exportRsvpCsv, listRsvpEvents, saveRsvpEvent } from "@/lib/admin.functions";
import { events as siteEvents } from "@/lib/site-data";

export const Route = createFileRoute("/admin/rsvp")({
  loader: () => listRsvpEvents(),
  head: () => ({
    meta: [
      { title: "RSVP Events · ICA Admin" },
      { name: "description", content: "Create, edit and download RSVP forms per event." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RsvpEvents,
});

type Form = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  eventDateLocal: string;
  deadlineLocal: string;
  membersOnly: boolean;
  isActive: boolean;
};

const empty: Form = {
  slug: "", title: "", description: "", location: "", eventDateLocal: "", deadlineLocal: "", membersOnly: true, isActive: true,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function presetDate(date: string, time: string) {
  const d = new Date(`${date.replace(/^\w+,\s*/, "")} ${time}`);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function download(csv: string, filename: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

const input = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function EventEditor({ initial, onClose }: { initial: Form; onClose: () => void }) {
  const router = useRouter();
  const save = useServerFn(saveRsvpEvent);
  const [f, setF] = useState<Form>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4">
      <form
        className="warm-card my-8 w-full max-w-xl bg-background p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          setSaving(true);
          try {
            const res = await save({ data: f });
            if (!res.ok) return setErr(res.error);
            await router.invalidate();
            onClose();
          } catch (e2) {
            setErr(e2 instanceof Error ? e2.message : "Could not save.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <h2 className="font-display text-2xl font-semibold text-primary">{f.id ? "Edit RSVP Form" : "Create New RSVP Form"}</h2>

        {!f.id && (
          <label className="mt-4 block text-sm font-medium">
            Start from an upcoming event
            <select
              className={input}
              defaultValue=""
              onChange={(e) => {
                const ev = siteEvents[Number(e.target.value)];
                if (!ev) return setF(empty);
                const dt = presetDate(ev.date, ev.time);
                setF((p) => ({ ...p, title: ev.title, location: ev.place, eventDateLocal: dt, description: ev.detail ?? "", slug: slugify(ev.title) }));
                setSlugTouched(false);
              }}
            >
              <option value="">Custom (blank)</option>
              {siteEvents.map((ev, i) => (
                <option key={ev.title} value={i}>{ev.title} — {ev.date}</option>
              ))}
            </select>
          </label>
        )}

        <label className="mt-4 block text-sm font-medium">
          Event name
          <input required className={input} value={f.title}
            onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Date & time (Central)
            <input required type="datetime-local" className={input} value={f.eventDateLocal} onChange={(e) => set("eventDateLocal", e.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            RSVP deadline (optional)
            <input type="datetime-local" className={input} value={f.deadlineLocal} onChange={(e) => set("deadlineLocal", e.target.value)} />
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium">
          Venue
          <input className={input} value={f.location} onChange={(e) => set("location", e.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Description / note
          <textarea rows={3} className={input} value={f.description} onChange={(e) => set("description", e.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Link address: /rsvp/<strong>{f.slug || "…"}</strong>
          <input required className={input} value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
        </label>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.membersOnly} onChange={(e) => set("membersOnly", e.target.checked)} />
            Members only
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Accepting RSVPs
          </label>
        </div>
        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            {saving ? "Saving…" : f.id ? "Save Changes" : "Create RSVP Form"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RsvpEvents() {
  const events = Route.useLoaderData();
  const exportCsv = useServerFn(exportRsvpCsv);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<Form | null>(null);

  return (
    <section className="site-container py-12">
      <AdminBar title="RSVP Events">
        <Link to="/admin/dashboard" className="mt-1 inline-block text-sm text-muted-foreground hover:text-primary">
          ← Dashboard
        </Link>
      </AdminBar>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Create or edit RSVP forms, and download responses (opens in Excel).</p>
        <button type="button" onClick={() => setEditing(empty)}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          + Create New RSVP Form
        </button>
      </div>
      <ul className="mt-4 grid gap-4">
        {events.map((e) => (
          <li key={e.slug} className="warm-card flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-primary">
                {e.title}
                {!e.isActive && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Closed</span>}
                {!e.membersOnly && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Open to all</span>}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {e.date}
                {e.location ? ` · ${e.location}` : ""}
              </p>
              <p className="mt-2 text-sm">
                {e.attending} attending · {e.regrets} not attending · {e.adults} adults · {e.children} children ·{" "}
                <strong>{e.total} total</strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/rsvp/${e.slug}`} target="_blank" rel="noreferrer"
                className="rounded-full border border-border px-4 py-2 text-sm">View Public Form ↗</a>
              <button type="button" className="rounded-full border border-border px-4 py-2 text-sm"
                onClick={() => setEditing({
                  id: e.id, slug: e.slug, title: e.title, description: e.description, location: e.location ?? "",
                  eventDateLocal: e.eventDateLocal, deadlineLocal: e.deadlineLocal, membersOnly: e.membersOnly, isActive: e.isActive,
                })}>
                Edit Details ✎
              </button>
              <button type="button" disabled={busy === e.slug}
                onClick={async () => {
                  setBusy(e.slug);
                  try {
                    const res = await exportCsv({ data: { slug: e.slug } });
                    download(res.csv, res.filename);
                  } finally {
                    setBusy(null);
                  }
                }}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                {busy === e.slug ? "Preparing…" : "Download CSV ↓"}
              </button>
            </div>
          </li>
        ))}
        {events.length === 0 && <li className="text-muted-foreground">No events yet.</li>}
      </ul>
      {editing && <EventEditor key={editing.id ?? "new"} initial={editing} onClose={() => setEditing(null)} />}
    </section>
  );
}
