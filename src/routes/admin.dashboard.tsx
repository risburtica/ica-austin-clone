import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminBar } from "@/components/admin-bar";
import { listRsvpEvents } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/dashboard")({
  loader: () => listRsvpEvents(),
  head: () => ({
    meta: [
      { title: "Admin Dashboard · ICA" },
      { name: "description", content: "ICA organizer tools." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const events = Route.useLoaderData();
  const responses = events.reduce((s, e) => s + e.responses, 0);
  return (
    <section className="site-container py-12">
      <AdminBar title="Dashboard" />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <Link to="/admin/rsvp" className="warm-card block p-6 transition hover:-translate-y-0.5">
            <h2 className="font-display text-2xl font-semibold text-primary">RSVPs</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {events.length} event{events.length === 1 ? "" : "s"} · {responses} response{responses === 1 ? "" : "s"}
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-primary">Open →</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
