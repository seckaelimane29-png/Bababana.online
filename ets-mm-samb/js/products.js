/* ETS MM SAMB — catalogue.
   Each bale has text in three languages (fr / en / wo) and an `art` block
   that drives the generated picture used when a bale has no photo (js/art.js).
   This list is only the offline fallback: the live catalogue comes from the
   database and is edited on the admin page (admin.html). */
window.MMS_CATEGORIES = [
  { id: 'all',      fr: 'Tout',          en: 'All',          wo: 'Lépp' },
  { id: 'femmes',   fr: 'Femmes',        en: 'Women',        wo: 'Jigéen' },
  { id: 'hommes',   fr: 'Hommes',        en: 'Men',          wo: 'Góor' },
  { id: 'enfants',  fr: 'Enfants',       en: 'Kids',         wo: 'Xale' },
  { id: 'mixte',    fr: 'Mixte',         en: 'Mixed',        wo: 'Jaxase' },
  { id: 'chaussures', fr: 'Chaussures',  en: 'Shoes',        wo: 'Dàll' },
  { id: 'maison',   fr: 'Maison & Draps', en: 'Home & Bedding', wo: 'Kër ak lal' },
  { id: 'sacs',     fr: 'Sacs',          en: 'Bags',         wo: 'Mbuus' }
];

window.MMS_PRODUCTS = [
  {
    id: 'robes-ete-uk', photo: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/robes-ete-uk.jpg',
    cat: 'femmes', weight: 45, pieces: '180–220', grade: 'A', origin: 'UK',
    badge: 'hot',
    name: { fr: 'Robes d’été femme', en: 'Women’s summer dresses', wo: 'Robu jigéen (nawet)' },
    desc: {
      fr: 'Robes légères, coton et viscose, motifs et couleurs vives. Triées à la main, sans trous ni taches.',
      en: 'Light cotton and viscose dresses, prints and bright colours. Hand-sorted, no holes or stains.',
      wo: 'Robu woyof, koton ak wiskos, ay kulóor yu leer. Ñu tànn ko ak loxo, amul pënd walla tach.'
    },
    art: { tarp: 'clear', palette: ['#e94f64', '#f6c445', '#5aa9e6', '#ffffff', '#7bc47f', '#f08a5d'] }
  },
  {
    id: 'jeans-homme-ca', photo: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/jeans-homme-ca.jpg',
    cat: 'hommes', weight: 55, pieces: '90–110', grade: 'A', origin: 'Canada',
    badge: 'new',
    name: { fr: 'Jeans homme', en: 'Men’s jeans', wo: 'Jiin góor' },
    desc: {
      fr: 'Jeans denim toutes tailles (28–44), coupes droites et slim. Marques variées.',
      en: 'Denim jeans in all sizes (28–44), straight and slim cuts. Mixed brands.',
      wo: 'Jiin yépp ci taille yi (28–44), yu jub ak yu sew. Marku yu bari.'
    },
    art: { tarp: 'clear', palette: ['#1f3b63', '#2e5a88', '#4a78a8', '#6b93bf', '#18304f', '#8fb0d4'] }
  },
  {
    id: 'tshirts-mixte-us', photo: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/tshirts-mixte-us.jpg',
    cat: 'mixte', weight: 45, pieces: '250–300', grade: 'A', origin: 'USA',
    name: { fr: 'T-shirts mixte', en: 'Mixed T-shirts', wo: 'Mbubb T-shirt (jaxase)' },
    desc: {
      fr: 'T-shirts coton homme et femme, unis et imprimés. Idéal pour la revente en détail.',
      en: 'Cotton T-shirts for men and women, plain and printed. Great for retail resale.',
      wo: 'T-shirt koton góor ak jigéen. Baax na lool ngir jaay ci détail.'
    },
    art: { tarp: 'orange', palette: ['#ffffff', '#222222', '#c0392b', '#2980b9', '#f1c40f', '#7f8c8d'] }
  },
  {
    id: 'enfants-ete', photo: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/enfants-ete.jpg',
    cat: 'enfants', weight: 45, pieces: '300–350', grade: 'A', origin: 'Korea',
    badge: 'hot',
    name: { fr: 'Vêtements enfants été', en: 'Kids’ summer clothes', wo: 'Yére xale (nawet)' },
    desc: {
      fr: 'Mélange enfants 2–12 ans : t-shirts, shorts, robes. Couleurs gaies, très bon état.',
      en: 'Kids mix ages 2–12: T-shirts, shorts, dresses. Cheerful colours, very good condition.',
      wo: 'Yére xale 2–12 at: T-shirt, short, robu. Kulóor yu neex, baax na lool.'
    },
    art: { tarp: 'yellow', palette: ['#ff6f91', '#ffc75f', '#00c9a7', '#845ec2', '#4d8af0', '#ffffff'] }
  },
  {
    id: 'chemises-homme', cat: 'hommes', weight: 45, pieces: '160–190', grade: 'A', origin: 'UK',
    name: { fr: 'Chemises homme', en: 'Men’s shirts', wo: 'Simis góor' },
    desc: {
      fr: 'Chemises manches longues et courtes, carreaux, rayures et unies. Repassées et pliées.',
      en: 'Long and short sleeve shirts, checks, stripes and plain. Pressed and folded.',
      wo: 'Simis yu njool ak yu gàtt, karo ak raay. Ñu ko repase, laxas ko.'
    },
    art: { tarp: 'clear', palette: ['#dfe6ee', '#9bb7d4', '#c94c4c', '#ffffff', '#3b5b7a', '#b8a07e'] }
  },
  {
    id: 'chaussures-sport', photo: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/chaussures-sport.jpg',
    cat: 'chaussures', weight: 25, pieces: '25–30 paires', grade: 'A', origin: 'USA',
    badge: 'new',
    name: { fr: 'Baskets de sport', en: 'Sports sneakers', wo: 'Dàll espoor' },
    desc: {
      fr: 'Baskets homme et femme, pointures 36–46, nettoyées et appairées.',
      en: 'Men’s and women’s sneakers, sizes 36–46, cleaned and paired.',
      wo: 'Dàll góor ak jigéen, 36–46, ñu setal leen te ñu ànd.'
    },
    art: { tarp: 'green', palette: ['#ffffff', '#111111', '#e74c3c', '#3498db', '#bdc3c7', '#f39c12'] }
  },
  {
    id: 'draps-couvertures', photo: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/draps-couvertures.jpg',
    cat: 'maison', weight: 55, pieces: '60–80', grade: 'A', origin: 'Canada',
    name: { fr: 'Draps & couvertures', en: 'Sheets & blankets', wo: 'Lal ak mbaj' },
    desc: {
      fr: 'Draps, housses de couette et couvertures polaires. Grandes tailles, propres.',
      en: 'Sheets, duvet covers and fleece blankets. Large sizes, clean.',
      wo: 'Lal, mbaj ak kuwertiir. Yu mag, set nañu.'
    },
    art: { tarp: 'orange', palette: ['#f4efe6', '#c9b79c', '#8e6c8a', '#6aa5a9', '#d98e73', '#ffffff'] }
  },
  {
    id: 'sacs-main', photo: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/sacs-main.jpg',
    cat: 'sacs', weight: 30, pieces: '70–90', grade: 'A', origin: 'UK',
    name: { fr: 'Sacs à main', en: 'Handbags', wo: 'Mbuusu loxo' },
    desc: {
      fr: 'Sacs à main, bandoulières et sacs à dos. Cuir et synthétique, bon état.',
      en: 'Handbags, crossbody and backpacks. Leather and synthetic, good condition.',
      wo: 'Mbuusu loxo ak mbuusu ginnaaw. Der ak sintetik, baax na.'
    },
    art: { tarp: 'yellow', palette: ['#7b4b2a', '#111111', '#c49a6c', '#8b1e3f', '#e8d5b7', '#3d3d3d'] }
  },
  {
    id: 'pulls-hiver', cat: 'mixte', weight: 50, pieces: '120–150', grade: 'B', origin: 'Korea',
    name: { fr: 'Pulls & sweats', en: 'Sweaters & hoodies', wo: 'Pull ak swet' },
    desc: {
      fr: 'Pulls, sweats et vestes légères. Parfait pour la saison fraîche.',
      en: 'Sweaters, hoodies and light jackets. Perfect for the cool season.',
      wo: 'Pull, swet ak vest yu woyof. Baax na ci jamono sedd gi.'
    },
    art: { tarp: 'clear', palette: ['#5b6770', '#a33b3b', '#2d4739', '#d9c5a0', '#1d1d1d', '#6d5ba3'] }
  },
  {
    id: 'pantalons-femme', cat: 'femmes', weight: 45, pieces: '130–160', grade: 'A', origin: 'Canada',
    name: { fr: 'Pantalons & leggings femme', en: 'Women’s trousers & leggings', wo: 'Tubay jigéen' },
    desc: {
      fr: 'Pantalons, leggings et jupes. Tailles S à XXL.',
      en: 'Trousers, leggings and skirts. Sizes S to XXL.',
      wo: 'Tubay, leggings ak sip. S ba XXL.'
    },
    art: { tarp: 'green', palette: ['#222222', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4', '#22577a'] }
  },
  {
    id: 'bebe-mix', cat: 'enfants', weight: 30, pieces: '350–400', grade: 'A', origin: 'UK',
    name: { fr: 'Mix bébé 0–2 ans', en: 'Baby mix 0–2 yrs', wo: 'Yére liir 0–2 at' },
    desc: {
      fr: 'Bodies, pyjamas et petits ensembles. Doux et propres.',
      en: 'Bodysuits, pyjamas and small sets. Soft and clean.',
      wo: 'Body, pijama ak yére yu ndaw. Yu lew te set.'
    },
    art: { tarp: 'yellow', palette: ['#ffd6e0', '#c1e1ff', '#fff3b0', '#d4f4dd', '#ffffff', '#e2c2ff'] }
  },
  {
    id: 'creme-premium', photo: 'https://glrujmmuqqddymsfmlil.supabase.co/storage/v1/object/public/products/demo/creme-premium.jpg',
    cat: 'mixte', weight: 100, pieces: '400+', grade: 'Crème', origin: 'UK',
    badge: 'premium',
    name: { fr: 'Balle Crème premium', en: 'Premium “Crème” bale', wo: 'Bal Krem (premium)' },
    desc: {
      fr: 'Premier choix : pièces quasi neuves, marques, tri le plus strict. Grosse balle 100 kg.',
      en: 'First choice: near-new pieces, brands, strictest sorting. Large 100 kg bale.',
      wo: 'Tànn bu njëkk: yére yu bees, mark yu am solo. Bal bu mag 100 kg.'
    },
    art: { tarp: 'clear', palette: ['#f6c445', '#e94f64', '#2e5a88', '#ffffff', '#111111', '#00a37a'] }
  }
];
