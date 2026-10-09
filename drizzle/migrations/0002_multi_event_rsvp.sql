CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  rsvp_deadline timestamptz,
  location text,
  members_only boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active events" ON public.events FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE TABLE public.membership_roster (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  full_name text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.membership_roster TO service_role;
ALTER TABLE public.membership_roster ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 160),
  email text NOT NULL CHECK (email = lower(email) AND char_length(email) BETWEEN 3 AND 320),
  attending boolean NOT NULL DEFAULT true,
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  message text CHECK (message IS NULL OR char_length(message) <= 5000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_rsvps_headcount CHECK (
    (attending AND adults BETWEEN 1 AND 50 AND children BETWEEN 0 AND 50)
    OR (NOT attending AND adults = 0 AND children = 0)
  ),
  UNIQUE (event_id, email)
);
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

INSERT INTO public.events (slug, title, description, event_date, location, members_only, is_active)
SELECT 'annual-meeting', 'Annual Membership Meeting',
  'Join us for the Annual Membership Meeting. Review the year, discuss upcoming community initiatives, and connect with fellow members. Meeting followed by lunch.',
  '2026-11-07 11:00:00-06', 'Blackhawk Community', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE slug = 'annual-meeting');

DROP POLICY IF EXISTS "Anyone can RSVP" ON public.rsvp_submissions;
COMMENT ON TABLE public.rsvp_submissions IS 'DEPRECATED: replaced by event_rsvps';