/* ETS MM SAMB — backend settings (Supabase project "ets-mm-samb").
   The anon key is public by design: the database's security rules decide what
   it can do (anyone may read visible bales; only admins may add or edit). */
window.MMS_CONFIG = {
  SUPABASE_URL: 'https://glrujmmuqqddymsfmlil.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscnVqbW11cXFkZHltc2ZtbGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NDQ2NTQsImV4cCI6MjEwNzIyMDY1NH0.45J8BFIrX7JPf75L5-wLDGOK9Dt3l3TnmuTR0jcmo_0',
  PHOTO_BUCKET: 'products',
  HERO_PHOTO: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/hero.jpg'
};
