# Recreate ICA Austin at icarisburt.org

## Goal
Rebuild the complete public website at `https://icaaustin.org` as a faithful, responsive copy, preserving its content and behavior while preparing the finished site to use `icarisburt.org`.

## Pages
- Home
- About
- Events
- Membership
- Renew Membership
- Contact
- Taste of India: About
- Taste of India: Past Events
- Taste of India: 2027
- Taste of India: Funds Disbursement

## What will be built
- Recreate the shared header, desktop navigation, mobile menu, dropdowns, footer, sponsor area, and donation actions.
- Match the source typography, warm cream/red/orange/green palette, spacing, borders, shadows, image treatment, and responsive behavior.
- Download and bundle the publicly displayed logo, photography, portraits, event artwork, and sponsor marks so the copy does not depend on source-site image hosting.
- Reproduce every page's visible copy, headings, lists, imagery, event information, links, calls to action, and metadata.
- Recreate the home photo carousel and upcoming-event cards.
- Recreate the event calendar, selected-date details, upcoming events, and past-event listings.
- Recreate membership, renewal, contact, and Taste of India forms with matching fields, validation, success, and error states.
- Preserve the current PayPal donation destination, Google map, social links, email link, and sponsor destinations unless a destination only works on the old domain.
- Replace source-domain internal links and canonical references with `icarisburt.org`; external organization details and page wording remain unchanged.

## Technical approach
- Use the existing TanStack application and create one route for each source URL.
- Build reusable site-shell, event, carousel, form, people, sponsor, and Taste of India sections for visual consistency.
- Define the full semantic color, typography, spacing, shadow, and animation system centrally.
- Use Lovable Cloud only where needed to make the source site's contact and membership submissions functional; no accounts or database-backed member portal were detected.
- Add unique page titles, descriptions, Open Graph metadata, and social-card metadata to every route.
- Retain accessibility details such as semantic headings, image descriptions, keyboard controls, focus states, and reduced-motion behavior.

## Verification
- Compare representative pages against the source at desktop and mobile widths.
- Test navigation, dropdowns, carousel controls, calendar selection, forms, donation links, map, social links, and all internal routes.
- Confirm there are no broken images, clipped text, overlapping elements, console errors, or build errors.
- Review the final route and capability ledger before declaring the migration complete.

## Domain handoff
After the site is verified, publish it and connect both `icarisburt.org` and `www.icarisburt.org`, choosing one as the primary address. Domain connection requires access to the domain's DNS settings and is completed after the build.
