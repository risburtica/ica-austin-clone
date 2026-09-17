import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageIntro, SectionTitle } from "@/components/page-parts";
import { assets } from "@/lib/site-assets";
import { pageHead } from "@/lib/site-data";

export const Route = createFileRoute("/taste-of-india/past")({
  head: () => pageHead("Past Taste of India", "Highlights and beneficiaries from the 2026 Taste of India fundraiser.", "/taste-of-india/past"),
  component: PastTaste,
});

const captions = ["Welcome remarks", "Dining together", "An Evening of Union", "Cultural dance", "Community on stage", "Silent auction", "Traditional dance", "Celebration"];

function PastTaste() {
  return <>
    <PageIntro eyebrow="Looking back" title="Past Taste of India"><p>2026 · An Evening of Union</p></PageIntro>
    <section className="site-container py-16">
      <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <div className="warm-card self-start p-7"><p className="eyebrow">Event details</p><dl className="mt-5 grid gap-5"><div><dt className="text-xs font-bold uppercase text-muted-foreground">Date</dt><dd className="mt-1 font-display text-lg text-primary">Saturday, April 25, 2026</dd></div><div><dt className="text-xs font-bold uppercase text-muted-foreground">Time</dt><dd className="mt-1 font-display text-lg text-primary">6:00 PM – 10:00 PM</dd></div><div><dt className="text-xs font-bold uppercase text-muted-foreground">Venue</dt><dd className="mt-1 font-display text-lg text-primary">Dell JCC, Austin</dd></div></dl></div>
        <div className="prose-copy"><h2>Taste of India Fundraiser 2026</h2><p>ICA's signature fundraiser of the year — a celebration that brought together community, culture, and cuisine in the spirit of unity. The evening featured festive Indian wedding traditions, authentic cuisine, and vibrant cultural performances of music and dance.</p><h3>2026 Beneficiaries</h3><ul><li><strong>Vimukti Charitable Trust</strong> — Renovation of 14 Mission Centers and empowerment of families, women, and children in Karnataka, India.</li><li><strong>St. Joseph Hospital</strong> — Medical support for St. Joseph Hospital, Agartala, Tripura, India.</li><li>Local charities — <strong>Mobile Loaves & Fishes</strong> and <strong>Catholic Charities of Central Texas</strong>.</li></ul><h3>What guests experienced</h3><ul><li>Festive Indian wedding celebrations and traditions</li><li>Authentic Indian cuisine prepared with love</li><li>Vibrant cultural performances — music, dance, and entertainment</li></ul></div>
      </div>
    </section>
    <section className="bg-muted/55 py-20"><div className="site-container"><SectionTitle title="2026 Gallery" description="Highlights from An Evening of Union on April 25, 2026."/><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{assets.gallery.map((src,i)=><figure key={src} className="overflow-hidden rounded-lg bg-card shadow-md"><img src={src} alt={captions[i]} className="aspect-[4/3] w-full object-cover"/><figcaption className="p-3 font-display text-primary">{captions[i]}</figcaption></figure>)}</div><div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link to="/taste-of-india/2027">Taste of India 2027</Link></Button><Button asChild variant="outline"><Link to="/events">See All Events</Link></Button></div></div></section>
  </>;
}