import { Link } from "@tanstack/react-router";
import { ChevronDown, Facebook, Heart, Mail, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { assets } from "@/lib/site-assets";
import { donateUrl } from "@/lib/site-data";
import { Button } from "@/components/ui/button";

const primary = [{ to: "/", label: "Home" }, { to: "/about", label: "About" }, { to: "/events", label: "Events" }, { to: "/contact", label: "Contact" }] as const;
const membership = [{ to: "/membership", label: "Join ICA" }, { to: "/renew-membership", label: "Renew Membership" }] as const;
const taste = [{ to: "/taste-of-india/about", label: "About Taste of India" }, { to: "/taste-of-india/2027", label: "Taste of India 2027" }, { to: "/taste-of-india/past", label: "Past Events" }, { to: "/taste-of-india/funds-disbursement", label: "Funds Disbursement" }] as const;

function Dropdown({ label, items }: { label: string; items: readonly { to: string; label: string }[] }) {
  return <div className="group relative"><button className="nav-link gap-1" type="button">{label}<ChevronDown size={14} /></button><div className="invisible absolute left-0 top-full z-50 w-56 translate-y-2 rounded-lg border border-border bg-popover p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">{items.map(i => <Link key={i.to} to={i.to} className="block rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-muted hover:text-primary">{i.label}</Link>)}</div></div>;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl"><div className="site-container flex h-[72px] items-center justify-between">
      <Link to="/" aria-label="ICA home"><img src={assets.logo} alt="India Catholic Association of Central Texas" className="h-11 w-auto sm:h-12" /></Link>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
        {primary.slice(0,3).map(i => <Link key={i.to} to={i.to} className="nav-link" activeProps={{ className: "text-primary" }}>{i.label}</Link>)}
        <Dropdown label="Membership" items={membership} /><Dropdown label="Taste of India" items={taste} />
        <Link to="/contact" className="nav-link">Contact</Link><Button asChild variant="accent"><a href={donateUrl} target="_blank" rel="noreferrer"><Heart size={16} />Donate</a></Button>
      </nav>
      <Button variant="outline" className="size-11 px-0 lg:hidden" onClick={() => setOpen(v => !v)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</Button>
    </div>{open && <nav className="site-container grid gap-1 border-t border-border py-4 lg:hidden" aria-label="Mobile navigation">{primary.map(i => <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 font-medium hover:bg-muted">{i.label}</Link>)}<p className="px-3 pt-2 text-xs font-bold uppercase text-muted-foreground">Membership</p>{membership.map(i => <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 hover:bg-muted">{i.label}</Link>)}<p className="px-3 pt-2 text-xs font-bold uppercase text-muted-foreground">Taste of India</p>{taste.map(i => <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 hover:bg-muted">{i.label}</Link>)}</nav>}</header>
    <main>{children}</main>
    <footer className="mt-24 bg-footer text-footer-foreground"><div className="site-container grid gap-10 py-14 md:grid-cols-4"><div className="md:col-span-2"><img src={assets.logo} alt="ICA emblem" className="h-14 rounded-md bg-cream p-1"/><p className="mt-5 max-w-md text-sm leading-relaxed text-footer-foreground/70">A faith-and-culture home for Indian Catholics in Austin & Central Texas.</p><Button asChild variant="accent" className="mt-5"><a href={donateUrl} target="_blank" rel="noreferrer"><Heart size={16}/>Donate</a></Button></div><div><h2 className="font-display text-lg">Quick Links</h2><div className="mt-4 grid gap-2 text-sm text-footer-foreground/70"><Link to="/about">About Us</Link><Link to="/events">Events</Link><Link to="/membership">Membership</Link><Link to="/taste-of-india/about">Taste of India</Link></div></div><div><h2 className="font-display text-lg">Get in Touch</h2><div className="mt-4 grid gap-3 text-sm text-footer-foreground/70"><a href="mailto:austinica@gmail.com" className="flex items-center gap-2"><Mail size={15}/>austinica@gmail.com</a><span className="flex items-center gap-2"><MapPin size={15}/>Austin, Texas</span><a href="https://www.facebook.com/austinica" target="_blank" rel="noreferrer" className="flex items-center gap-2"><Facebook size={15}/>Facebook</a></div></div></div><div className="border-t border-footer-foreground/10"><div className="site-container py-5 text-xs text-footer-foreground/55">© 2026 India Catholic Association of Central Texas. All rights reserved.</div></div></footer>
  </div>;
}