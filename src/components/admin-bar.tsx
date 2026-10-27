import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/admin.functions";

export function AdminBar({ title, children }: { title: string; children?: React.ReactNode }) {
  const router = useRouter();
  const logout = useServerFn(adminLogout);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
        <h1 className="font-display text-3xl font-semibold text-primary">{title}</h1>
        {children}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await logout();
          await router.navigate({ to: "/admin", replace: true });
        }}
      >
        Log Out
      </Button>
    </div>
  );
}
