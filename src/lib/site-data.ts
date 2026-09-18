export const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=T25BFNFTCSUM6";

export const events = [
  { title: "Annual Membership Meeting", date: "Sat, Nov 7, 2026", time: "12:00 PM", place: "Blackhawk Community", tags: ["membership", "community"], detail: "11:00 AM–1:00 PM CST. Meeting followed by lunch.", day: 7 },
  { title: "ICA Annual Christmas Party 2026", date: "Sat, Dec 12, 2026", time: "7:30 PM", place: "The Gathering Place at Shepherd of the Hills", tags: ["christmas", "celebration"] },
  { title: "Taste of India Fundraiser 2027", date: "Sat, Apr 24, 2027", time: "2:00 PM", place: "Dell JCC, 7300 Hart Lane, Austin", tags: ["fundraiser", "taste-of-india", "culture"] },
];

export const pastEvents: { title: string; date: string; place: string; tags: string }[] = [
  { title: "Virtual “Tranquil Flow” Yoga", date: "Sat, Jul 11, 2026 · 10:00 AM", place: "Virtual", tags: "wellness · virtual" },
  { title: "Community Care at St. Vincent de Paul", date: "Sat, Jun 27, 2026 · 10:00 AM", place: "901 W Braker Ln, Austin", tags: "service" },
  { title: "Annual Parent's Day Picnic 2026", date: "Sun, Jun 7, 2026 · 12:00 PM", place: "Emma Long Metropolitan Park, Austin", tags: "family · picnic" },
  { title: "Taste of India Fundraiser 2026", date: "Sat, Apr 25, 2026 · 7:00 PM", place: "Dell JCC, 7300 Hart Lane, Austin", tags: "fundraiser · signature" },
  { title: "ICA Easter Party 2026", date: "Sun, Apr 5, 2026 · 5:00 PM", place: "Blackhawk Amenity Center, Pflugerville", tags: "faith · family" },
  { title: "ICA Annual Christmas Party 2025", date: "Sat, Dec 6, 2025 · 7:00 PM", place: "The Gathering Place, Austin", tags: "faith · family" },
  { title: "ICA Annual Meeting & Game Night", date: "Sat, Nov 1, 2025 · 7:00 PM", place: "Blackhawk Amenity Center, Pflugerville", tags: "community" },
  { title: "ICA Grandparents Lunch", date: "Sat, May 10, 2025 · 1:00 PM", place: "Private residence", tags: "family" },
  { title: "ICA Easter Party 2025", date: "Sun, Apr 20, 2025 · 5:00 PM", place: "Blackhawk Amenity Center, Pflugerville", tags: "faith · family" },
];

export function pageHead(title: string, description: string, path: string) {
  const fullTitle = `${title} — India Catholic Association of Central Texas`;
  return {
    meta: [
      { title: fullTitle }, { name: "description", content: description },
      { property: "og:title", content: fullTitle }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { property: "og:url", content: path },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}