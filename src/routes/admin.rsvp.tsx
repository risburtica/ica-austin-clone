import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminBar } from "@/components/admin-bar";
import { exportRsvpCsv, listRsvpEvents } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/rsvp")({
  loader: () => listRsvpEvents(),
  head: () => ({
    meta: [
      { title: "RSVP Events · ICA Admin" },
      { name: "description", content: "Download RSVP responses per event." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RsvpEvents,
});

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

function RsvpEvents() {
  const events = Route.useLoaderData();
  const exportCsv = useServerFn(exportRsvpCsv);
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <section className="site-container py-12">
      <AdminBar title="RSVP Events">
        <Link to="/admin/dashboard" className="mt-1 inline-block text-sm text-muted-foreground hover:text-primary">
          ← Dashboard
        </Link>
      </AdminBar>
      <p className="mt-6 text-sm text-muted-foreground">Click an event to download its responses as a spreadsheet (opens in Excel).</p>
      <ul className="mt-4 grid gap-4">
        {events.map((e) => (
          <li key={e.slug}>
            <button
              type="button"
              disabled={busy === e.slug}
              onClick={async () => {
                setBusy(e.slug);
                try {
                  const res = await exportCsv({ data: { slug: e.slug } });
                  download(res.csv, res.filename);
                } finally {
                  setBusy(null);
                }
              }}
              className="warm-card flex w-full flex-wrap items-center justify-between gap-4 p-6 text-left transition hover:-translate-y-0.5"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-primary">{e.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {e.date}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                <p className="mt-2 text-sm">
                  {e.attending} attending · {e.regrets} not attending · {e.adults} adults · {e.children} children ·{" "}
                  <strong>{e.total} total</strong>
                </p>
              </div>
              <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                {busy === e.slug ? "Preparing…" : "Download CSV ↓"}
              </span>
            </button>
          </li>
        ))}
        {events.length === 0 && <li className="text-muted-foreground">No events yet.</li>}
      </ul>
    </section>
  );
}
