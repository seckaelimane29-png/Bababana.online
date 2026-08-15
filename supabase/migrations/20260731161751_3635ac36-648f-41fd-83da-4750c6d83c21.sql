CREATE TABLE public.proverbs (
  id text PRIMARY KEY,
  wolof text,
  translation text,
  category text,
  origin text,
  flag text,
  en_translation text,
  fr_translation text,
  it_translation text,
  es_translation text,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.proverbs TO anon, authenticated;
GRANT ALL ON public.proverbs TO service_role;
ALTER TABLE public.proverbs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Proverbs are publicly readable" ON public.proverbs FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.books (
  id text PRIMARY KEY,
  title text NOT NULL,
  author text,
  category text,
  emoji text,
  color_from text,
  color_to text,
  read_minutes integer,
  is_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.books TO anon, authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are publicly readable" ON public.books FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.book_insights (
  id serial PRIMARY KEY,
  book_id text NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  insight_order integer NOT NULL,
  title text,
  body text,
  wolof_wisdom text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, insight_order)
);
GRANT SELECT ON public.book_insights TO anon, authenticated;
GRANT ALL ON public.book_insights TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.book_insights_id_seq TO service_role;
ALTER TABLE public.book_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Book insights are publicly readable" ON public.book_insights FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.quotes (
  id text PRIMARY KEY,
  text text NOT NULL,
  author text,
  region text,
  flag text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quotes TO anon, authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quotes are publicly readable" ON public.quotes FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_proverbs_updated_at BEFORE UPDATE ON public.proverbs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_book_insights_updated_at BEFORE UPDATE ON public.book_insights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();