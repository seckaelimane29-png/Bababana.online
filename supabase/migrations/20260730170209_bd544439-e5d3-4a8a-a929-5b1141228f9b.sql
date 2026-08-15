CREATE TABLE public.book_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (book_id, lang)
);
GRANT SELECT ON public.book_translations TO anon;
GRANT SELECT ON public.book_translations TO authenticated;
GRANT ALL ON public.book_translations TO service_role;
ALTER TABLE public.book_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations are public to read" ON public.book_translations FOR SELECT TO anon, authenticated USING (true);