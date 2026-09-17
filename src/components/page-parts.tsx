import { CalendarDays, Check, MapPin } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <section className="site-container pt-14 text-center md:pt-20"><p className="eyebrow">{eyebrow}</p><h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.06] text-primary sm:text-5xl md:text-6xl">{title}</h1>{children && <div className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{children}</div>}</section>;
}

export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="mt-2 font-display text-3xl font-semibold text-primary md:text-4xl">{title}</h2>{description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}</div>;
}

export function EventCard({ title, date, place, tags }: { title: string; date: string; place: string; tags?: string[] }) {
  return <article className="warm-card p-5"><div className="flex flex-wrap gap-2">{tags?.map(t => <span key={t} className="tag">{t}</span>)}</div><h3 className="mt-3 font-display text-xl font-semibold text-primary">{title}</h3><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={15}/>{date}</p><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={15}/>{place}</p></article>;
}

export function PublicForm({ type }: { type: "membership" | "contact" }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState("saving"); const data = new FormData(e.currentTarget);
    const { error } = await supabase.from("form_submissions").insert({ form_type: type, full_name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), family_size: type === "membership" ? Number(data.get("familySize")) : null, message: String(data.get("message") ?? "") || null });
    setState(error ? "error" : "done"); if (!error) e.currentTarget.reset();
  }
  if (state === "done") return <div className="warm-card flex items-center gap-3 p-6 text-primary"><span className="grid size-9 place-items-center rounded-full bg-accent"><Check size={18}/></span><div><h3 className="font-display text-xl font-semibold">Thank you</h3><p className="text-sm text-muted-foreground">Your message has been received. We’ll follow up personally.</p></div></div>;
  return <form onSubmit={submit} className="warm-card grid gap-5 p-6 sm:p-8"><label className="form-label">Full name<span>*</span><input className="form-input" name="name" required maxLength={160}/></label><label className="form-label">Email<span>*</span><input className="form-input" name="email" type="email" required maxLength={320}/></label>{type === "membership" && <label className="form-label">Family size<input className="form-input" name="familySize" type="number" min="1" max="50" defaultValue="1"/></label>}<label className="form-label">{type === "contact" ? "Message" : "Anything you'd like to share?"}<textarea className="form-input min-h-32 resize-y" name="message" maxLength={5000} required={type === "contact"}/></label>{state === "error" && <p className="text-sm text-destructive">We couldn’t send this right now. Please try again.</p>}<Button type="submit" disabled={state === "saving"}>{state === "saving" ? "Sending…" : type === "membership" ? "Join ICA" : "Send message"}</Button></form>;
}