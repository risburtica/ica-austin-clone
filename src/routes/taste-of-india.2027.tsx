import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { PageIntro } from "@/components/page-parts";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/site-data";
export const Route=createFileRoute("/taste-of-india/2027")({head:()=>pageHead("Taste of India 2027","Save the date for Taste of India 2027.","/taste-of-india/2027"),component:Page});
function Page(){return <PageIntro eyebrow="Save the date" title="Taste of India 2027"><p className="flex items-center justify-center gap-2 font-semibold text-primary"><CalendarDays/>Saturday, April 24, 2027</p><p className="mt-4">Details for our 2027 evening are being planned. Sign up for our newsletter or follow along for venue, sponsorship, and ticket announcements.</p><div className="mt-7 flex justify-center gap-3"><Button asChild><Link to="/membership">Get Involved</Link></Button><Button asChild variant="outline"><Link to="/contact">Sponsor Inquiry</Link></Button></div></PageIntro>}