import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { adminLogin, isAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const { admin } = await isAdmin();
    if (admin) throw redirect({ to: "/admin/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Admin Login · ICA" },
      { name: "description", content: "Organizer sign-in for ICA administrators." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const router = useRouter();
  const login = useServerFn(adminLogin);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const passcode = String(new FormData(e.currentTarget).get("passcode") ?? "");
    const res = await login({ data: { passcode } });
    setBusy(false);
    if (res.ok) await router.navigate({ to: "/admin/dashboard" });
    else if (res.locked)
      setError(`Too many failed attempts. Locked out for ${res.minutes} more minute${res.minutes === 1 ? "" : "s"}.`);
    else
      setError(`Incorrect passcode. You have ${res.remaining} attempt${res.remaining === 1 ? "" : "s"} remaining.`);
  }

  return (
    <section className="site-container flex min-h-[60vh] items-center justify-center py-16">
      <form onSubmit={onSubmit} className="warm-card w-full max-w-sm p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-foreground/70">Organizers</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-primary">Admin Login</h1>
        <label className="form-label mt-6">
          Admin Passcode
          <input name="passcode" type="password" required autoComplete="current-password" className="form-input" />
        </label>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </section>
  );
}
