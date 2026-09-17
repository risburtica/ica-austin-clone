CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT NOT NULL CHECK (form_type IN ('membership', 'contact')),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 160),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  family_size INTEGER CHECK (family_size IS NULL OR family_size BETWEEN 1 AND 50),
  message TEXT CHECK (message IS NULL OR char_length(message) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.form_submissions TO anon, authenticated;
GRANT ALL ON public.form_submissions TO service_role;

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit public forms"
ON public.form_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  form_type IN ('membership', 'contact')
  AND char_length(full_name) BETWEEN 1 AND 160
  AND char_length(email) BETWEEN 3 AND 320
  AND (family_size IS NULL OR family_size BETWEEN 1 AND 50)
  AND (message IS NULL OR char_length(message) <= 5000)
);