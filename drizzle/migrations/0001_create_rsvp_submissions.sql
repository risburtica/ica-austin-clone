CREATE TABLE public.rsvp_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_title text NOT NULL,
  full_name text NOT NULL,
  email text,
  adults integer NOT NULL,
  children integer NOT NULL DEFAULT 0,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT INSERT ON public.rsvp_submissions TO anon, authenticated;
GRANT ALL ON public.rsvp_submissions TO service_role;
ALTER TABLE public.rsvp_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can RSVP" ON public.rsvp_submissions FOR INSERT TO anon, authenticated
WITH CHECK (char_length(full_name) >= 1 AND char_length(full_name) <= 160
  AND (email IS NULL OR (char_length(email) >= 3 AND char_length(email) <= 320))
  AND adults >= 1 AND adults <= 50
  AND children >= 0 AND children <= 50
  AND (message IS NULL OR char_length(message) <= 5000));