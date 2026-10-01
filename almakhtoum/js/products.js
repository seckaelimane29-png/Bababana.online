/* Sunu Waxal — catalogue data and product illustrations.
   Prices are in Gambian Dalasi (GMD, symbol "D"). */

export const CURRENCY = { code: 'GMD', symbol: 'D', name: 'Dalasi' };

export function formatPrice(n) {
  return CURRENCY.symbol + '\u202F' + Math.round(n).toLocaleString('en-GB');
}

export const CATEGORIES = [
  { id: 'all',         label: 'All',         blurb: 'Everything new',        art: 'kaftan',  color: '#C9A24B' },
  { id: 'women',       label: 'Women',       blurb: 'Dresses & kaftans',     art: 'dress',   color: '#C8553D' },
  { id: 'men',         label: 'Men',         blurb: 'Shirts & grand boubou', art: 'shirt',   color: '#2F5D62' },
  { id: 'kids',        label: 'Kids',        blurb: 'Little icons',          art: 'tshirt',  color: '#E0A526' },
  { id: 'bags',        label: 'Bags',        blurb: 'Totes to clutches',     art: 'handbag', color: '#7A3E48' },
  { id: 'shoes',       label: 'Shoes',       blurb: 'Heels, kicks & sandals', art: 'sneaker', color: '#3B4A6B' },
  { id: 'accessories', label: 'Accessories', blurb: 'The finishing touch',   art: 'glasses', color: '#5B6B3A' },
];

// type = illustration, c = main colour, c2 = detail colour
// img = optional photo, e.g. img: 'images/sanyang-wrap-dress.jpg' (see images/README.md).
//       When set, the photo replaces the illustration everywhere; if the file is
//       missing the illustration is shown instead.
export const PRODUCTS = [
  { id: 1,  name: 'Sanyang Wrap Dress',       cat: 'women', type: 'dress',    c: '#C8553D', c2: '#F4D9B0', price: 2450, old: 3100, rating: 4.8, reviews: 126, tag: 'Sale', sizes: ['S','M','L','XL'] },
  { id: 2,  name: 'Kombo Embroidered Kaftan', cat: 'women', type: 'kaftan',   c: '#1F4E5A', c2: '#C9A24B', price: 3800, rating: 4.9, reviews: 88,  tag: 'New',  sizes: ['M','L','XL'] },
  { id: 3,  name: 'Atlantic Linen Shirt',     cat: 'men',   type: 'shirt',    c: '#E9E2D0', c2: '#8E6A24', price: 1650, rating: 4.6, reviews: 64,  sizes: ['S','M','L','XL','XXL'] },
  { id: 4,  name: 'Banjul Grand Boubou',      cat: 'men',   type: 'kaftan',   c: '#F3EEE3', c2: '#2F5D62', price: 5200, rating: 5.0, reviews: 41,  tag: 'Hot',  sizes: ['M','L','XL','XXL'] },
  { id: 5,  name: 'Gold Seal Leather Tote',   cat: 'bags',  type: 'tote',     c: '#7A3E48', c2: '#C9A24B', price: 4600, rating: 4.9, reviews: 210, tag: 'Hot',  sizes: ['One size'] },
  { id: 6,  name: 'Serrekunda Top Handle',    cat: 'bags',  type: 'handbag',  c: '#141019', c2: '#C9A24B', price: 3500, old: 4200, rating: 4.7, reviews: 97, tag: 'Sale', sizes: ['One size'] },
  { id: 7,  name: 'Cloud Runner Sneaker',     cat: 'shoes', type: 'sneaker',  c: '#F5F2EC', c2: '#C8553D', price: 4200, rating: 4.8, reviews: 305, tag: 'New',  sizes: ['38','39','40','41','42','43','44'] },
  { id: 8,  name: 'Velvet Night Stiletto',    cat: 'shoes', type: 'heel',     c: '#7A1F3D', c2: '#C9A24B', price: 3900, rating: 4.6, reviews: 72,  sizes: ['36','37','38','39','40'] },
  { id: 9,  name: 'River Gambia Sandal',      cat: 'shoes', type: 'sandal',   c: '#B07A4A', c2: '#F4D9B0', price: 1450, old: 1900, rating: 4.5, reviews: 58, tag: 'Sale', sizes: ['37','38','39','40','41','42'] },
  { id: 10, name: 'Desert Chelsea Boot',      cat: 'shoes', type: 'boot',     c: '#6B4A2F', c2: '#2A2016', price: 5600, rating: 4.9, reviews: 44,  sizes: ['40','41','42','43','44','45'] },
  { id: 11, name: 'Little Star Tee',          cat: 'kids',  type: 'tshirt',   c: '#E0A526', c2: '#FFFFFF', price: 450,  rating: 4.7, reviews: 133, sizes: ['2Y','4Y','6Y','8Y'] },
  { id: 12, name: 'Mini Wax-Print Dress',     cat: 'kids',  type: 'dress',    c: '#2E7D6B', c2: '#F2C14E', price: 950,  rating: 4.9, reviews: 61,  tag: 'New',  sizes: ['2Y','4Y','6Y','8Y','10Y'] },
  { id: 13, name: 'Tiny Trainers',            cat: 'kids',  type: 'sneaker',  c: '#3B82C4', c2: '#FFFFFF', price: 1200, rating: 4.6, reviews: 49,  sizes: ['24','26','28','30','32'] },
  { id: 14, name: 'Evening Pearl Clutch',     cat: 'bags',  type: 'clutch',   c: '#EDE3D1', c2: '#C9A24B', price: 2100, rating: 4.8, reviews: 36,  sizes: ['One size'] },
  { id: 15, name: 'Commuter Backpack',        cat: 'bags',  type: 'backpack', c: '#2F3A48', c2: '#C8553D', price: 2800, old: 3300, rating: 4.7, reviews: 142, tag: 'Sale', sizes: ['One size'] },
  { id: 16, name: 'Tailored Chino Trouser',   cat: 'men',   type: 'trouser',  c: '#C2A77D', c2: '#6B5536', price: 1850, rating: 4.5, reviews: 77,  sizes: ['30','32','34','36','38'] },
  { id: 17, name: 'Harmattan Bomber',         cat: 'men',   type: 'jacket',   c: '#3E4A3A', c2: '#E0A526', price: 4400, rating: 4.8, reviews: 53,  tag: 'New',  sizes: ['M','L','XL'] },
  { id: 18, name: 'Sunset Midi Dress',        cat: 'women', type: 'dress',    c: '#E0A526', c2: '#7A3E48', price: 2750, rating: 4.7, reviews: 95,  sizes: ['XS','S','M','L'] },
  { id: 19, name: 'Soft Cotton Tee',          cat: 'women', type: 'tshirt',   c: '#F1C6B8', c2: '#7A3E48', price: 650,  old: 850, rating: 4.4, reviews: 188, tag: 'Sale', sizes: ['XS','S','M','L','XL'] },
  { id: 20, name: 'Aviator Sunglasses',       cat: 'accessories', type: 'glasses', c: '#C9A24B', c2: '#2A2016', price: 1300, rating: 4.6, reviews: 120, sizes: ['One size'] },
  { id: 21, name: 'Signature Gold Watch',     cat: 'accessories', type: 'watch',   c: '#C9A24B', c2: '#141019', price: 6500, rating: 4.9, reviews: 67, tag: 'Hot', sizes: ['One size'] },
  { id: 22, name: 'Kente Silk Scarf',         cat: 'accessories', type: 'scarf',   c: '#C8553D', c2: '#E0A526', price: 900,  rating: 4.7, reviews: 39, sizes: ['One size'] },
  { id: 23, name: 'Nude Block Heel',          cat: 'shoes', type: 'heel',     c: '#D8B596', c2: '#8E6A24', price: 2950, rating: 4.5, reviews: 51,  sizes: ['36','37','38','39','40','41'] },
  { id: 24, name: 'Market Day Straw Tote',    cat: 'bags',  type: 'tote',     c: '#D9B86A', c2: '#6B4A2F', price: 1600, rating: 4.6, reviews: 84,  tag: 'New',  sizes: ['One size'] },
  { id: 25, name: 'Boys Denim Jacket',        cat: 'kids',  type: 'jacket',   c: '#4A6FA5', c2: '#F3EEE3', price: 1400, rating: 4.8, reviews: 28,  sizes: ['4Y','6Y','8Y','10Y'] },
  { id: 26, name: 'Oxford Cotton Shirt',      cat: 'men',   type: 'shirt',    c: '#9DB6CF', c2: '#1F2A3A', price: 1550, old: 1950, rating: 4.6, reviews: 102, tag: 'Sale', sizes: ['S','M','L','XL'] },
  { id: 27, name: 'Emerald Satin Kaftan',     cat: 'women', type: 'kaftan',   c: '#1E6B52', c2: '#E9CF8A', price: 4100, rating: 4.9, reviews: 57,  sizes: ['S','M','L','XL'] },
  { id: 28, name: 'Canvas Cap',               cat: 'accessories', type: 'cap',     c: '#141019', c2: '#C9A24B', price: 550,  rating: 4.4, reviews: 91, sizes: ['One size'] },
];

/* ---------- Illustrations (viewBox 0 0 200 200) ---------- */

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

const ART = {
  dress: (c, d) => `
    <path d="M84 34 L88 50 M116 34 L112 50" stroke="${shade(c,-40)}" stroke-width="4" stroke-linecap="round"/>
    <path d="M82 48 Q100 58 118 48 L122 78 Q114 84 118 94 L152 168 Q100 184 48 168 L82 94 Q86 84 78 78 Z" fill="${c}"/>
    <path d="M80 86 Q100 94 120 86 L120 94 Q100 102 80 94 Z" fill="${d}"/>
    <path d="M100 98 L92 172 M100 98 L120 170" stroke="${shade(c,-25)}" stroke-width="2" opacity=".5" fill="none"/>`,
  kaftan: (c, d) => `
    <path d="M76 36 Q100 50 124 36 L172 92 L152 108 L134 92 L140 176 L60 176 L66 92 L48 108 L28 92 Z" fill="${c}"/>
    <path d="M86 40 Q100 70 114 40" fill="none" stroke="${d}" stroke-width="4"/>
    <path d="M100 62 V120" stroke="${d}" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round"/>
    <path d="M86 74 q14 10 28 0 M88 88 q12 8 24 0" fill="none" stroke="${d}" stroke-width="2.5"/>
    <path d="M60 164 H140" stroke="${d}" stroke-width="3" stroke-dasharray="6 4"/>`,
  tshirt: (c, d) => `
    <path d="M70 46 L86 38 Q100 52 114 38 L130 46 L160 72 L142 92 L130 82 L130 166 L70 166 L70 82 L58 92 L40 72 Z" fill="${c}"/>
    <path d="M86 38 Q100 52 114 38" fill="none" stroke="${shade(c,-35)}" stroke-width="3"/>
    <path d="M100 96 l5 10 11 1 -8 7 3 11 -11 -6 -11 6 3 -11 -8 -7 11 -1 Z" fill="${d}"/>`,
  shirt: (c, d) => `
    <path d="M70 44 L86 36 L100 50 L114 36 L130 44 L150 70 L164 150 L146 154 L132 90 L132 170 L68 170 L68 90 L54 154 L36 150 L50 70 Z" fill="${c}"/>
    <path d="M86 36 L100 50 L92 60 L80 44 Z M114 36 L100 50 L108 60 L120 44 Z" fill="${shade(c,-22)}"/>
    <path d="M100 52 V168" stroke="${shade(c,-30)}" stroke-width="2"/>
    ${[70, 92, 114, 136, 158].map(y => `<circle cx="104" cy="${y}" r="2.4" fill="${d}"/>`).join('')}
    <rect x="76" y="80" width="16" height="14" rx="2" fill="none" stroke="${shade(c,-30)}" stroke-width="2"/>`,
  jacket: (c, d) => `
    <path d="M70 44 L88 36 L100 48 L112 36 L130 44 L152 72 L164 156 L144 158 L132 96 L132 168 L68 168 L68 96 L56 158 L36 156 L48 72 Z" fill="${c}"/>
    <path d="M88 36 L100 48 L100 168 L68 168 L68 96 Z" fill="${shade(c,12)}" opacity=".35"/>
    <path d="M100 48 V168" stroke="${d}" stroke-width="3"/>
    <path d="M68 160 H132 M40 150 l18 2 M160 150 l-18 2" stroke="${d}" stroke-width="5"/>
    <path d="M88 36 Q100 44 112 36" fill="none" stroke="${d}" stroke-width="5"/>`,
  trouser: (c, d) => `
    <path d="M68 34 H132 L140 172 H108 L100 84 L92 172 H60 Z" fill="${c}"/>
    <rect x="68" y="34" width="64" height="12" fill="${d}"/>
    <path d="M100 46 V80 M80 52 q6 14 -2 22 M120 52 q-6 14 2 22" stroke="${shade(c,-30)}" stroke-width="2" fill="none"/>`,
  handbag: (c, d) => `
    <path d="M74 84 Q74 42 100 42 Q126 42 126 84" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
    <rect x="46" y="80" width="108" height="86" rx="16" fill="${c}"/>
    <path d="M46 96 Q46 80 62 80 H138 Q154 80 154 96 L154 110 Q100 132 46 110 Z" fill="${shade(c,25)}"/>
    <rect x="92" y="108" width="16" height="14" rx="3" fill="${d}"/>
    <path d="M58 156 H142" stroke="${d}" stroke-width="1.5" stroke-dasharray="3 3" opacity=".7"/>`,
  tote: (c, d) => `
    <path d="M76 80 Q76 50 100 50 Q124 50 124 80" fill="none" stroke="${shade(d,-40)}" stroke-width="5" stroke-linecap="round"/>
    <path d="M66 80 Q66 38 100 38 Q134 38 134 80" fill="none" stroke="${d}" stroke-width="6" stroke-linecap="round"/>
    <path d="M50 76 H150 L140 170 H60 Z" fill="${c}"/>
    <path d="M50 76 H150 L149 88 H51 Z" fill="${shade(c,-25)}"/>
    <circle cx="100" cy="122" r="14" fill="none" stroke="${d}" stroke-width="3"/>
    <path d="M94 128 L100 114 L106 128 M96 124 H104" stroke="${d}" stroke-width="2" fill="none"/>`,
  clutch: (c, d) => `
    <rect x="36" y="74" width="128" height="72" rx="10" fill="${c}"/>
    <path d="M36 84 Q36 74 46 74 H154 Q164 74 164 84 L100 122 Z" fill="${shade(c,-18)}"/>
    <circle cx="100" cy="118" r="7" fill="${d}"/>
    <path d="M44 150 Q100 180 156 150" fill="none" stroke="${d}" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>`,
  backpack: (c, d) => `
    <path d="M82 50 Q82 30 100 30 Q118 30 118 50" fill="none" stroke="${shade(c,-30)}" stroke-width="7"/>
    <rect x="56" y="46" width="88" height="126" rx="30" fill="${c}"/>
    <rect x="70" y="112" width="60" height="44" rx="10" fill="${shade(c,18)}"/>
    <path d="M70 124 H130" stroke="${d}" stroke-width="3"/>
    <path d="M60 80 Q100 96 140 80" fill="none" stroke="${d}" stroke-width="3"/>`,
  sneaker: (c, d) => `
    <path d="M26 132 Q28 98 54 96 L82 100 Q98 78 120 88 L162 114 Q178 122 176 138 L26 140 Z" fill="${c}"/>
    <path d="M24 138 H178 Q180 152 166 154 H34 Q22 152 24 138 Z" fill="#FFFFFF" stroke="#DDD5C8" stroke-width="2"/>
    <path d="M60 120 Q96 100 132 126" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
    <path d="M92 94 l10 12 M102 90 l10 12 M112 94 l8 11" stroke="${shade(c,-45)}" stroke-width="3" stroke-linecap="round"/>`,
  heel: (c, d) => `
    <path d="M36 138 Q44 106 76 110 Q112 116 146 84 Q160 76 166 88 Q168 98 158 104 L150 108 Q128 138 96 142 L44 144 Q34 144 36 138 Z" fill="${c}"/>
    <path d="M150 104 L160 104 L156 170 L152 170 Z" fill="${shade(c,-30)}"/>
    <path d="M36 140 Q70 146 110 138" fill="none" stroke="${d}" stroke-width="3"/>
    <path d="M72 112 Q84 96 100 116" fill="none" stroke="${d}" stroke-width="3"/>`,
  sandal: (c, d) => `
    <path d="M30 140 Q30 128 48 128 H158 Q176 128 176 140 Q176 150 158 150 H48 Q30 150 30 140 Z" fill="${shade(c,-25)}"/>
    <path d="M60 130 Q70 94 100 94 Q130 94 138 130" fill="none" stroke="${c}" stroke-width="12"/>
    <path d="M86 130 Q96 110 116 130" fill="none" stroke="${d}" stroke-width="6"/>
    <circle cx="100" cy="96" r="6" fill="${d}"/>`,
  boot: (c, d) => `
    <path d="M70 36 H116 L118 118 Q150 122 166 138 L166 150 H70 Z" fill="${c}"/>
    <rect x="96" y="58" width="22" height="46" rx="4" fill="${d}" opacity=".85"/>
    <path d="M66 150 H170 V162 H66 Z" fill="${d}"/>
    <path d="M70 44 H116" stroke="${shade(c,-30)}" stroke-width="4"/>`,
  glasses: (c, d) => `
    <path d="M40 88 H160" stroke="${c}" stroke-width="5"/>
    <path d="M48 88 Q48 128 74 128 Q96 128 96 96 L96 88 Z M104 88 L104 96 Q104 128 126 128 Q152 128 152 88 Z" fill="${d}" stroke="${c}" stroke-width="5"/>
    <path d="M60 98 L70 92 M116 98 L126 92" stroke="#FFFFFF" stroke-width="4" opacity=".5" stroke-linecap="round"/>
    <path d="M40 88 L28 80 M160 88 L172 80" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
  watch: (c, d) => `
    <rect x="84" y="28" width="32" height="46" rx="6" fill="${d}"/>
    <rect x="84" y="126" width="32" height="46" rx="6" fill="${d}"/>
    <circle cx="100" cy="100" r="36" fill="${c}"/>
    <circle cx="100" cy="100" r="28" fill="#FBF7EE"/>
    <path d="M100 100 V80 M100 100 L114 108" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="136" y="96" width="8" height="8" rx="2" fill="${c}"/>`,
  scarf: (c, d) => `
    <path d="M58 40 Q100 70 142 40 L150 60 Q118 88 118 110 L130 176 L104 176 L100 118 L84 164 L60 156 L86 104 Q70 80 50 60 Z" fill="${c}"/>
    <path d="M62 48 Q100 78 138 48 M104 176 V160 M130 176 L126 160 M84 164 L90 150 M60 156 L68 142" stroke="${d}" stroke-width="4" fill="none"/>
    <path d="M110 128 H124 M108 144 H126" stroke="${d}" stroke-width="3"/>`,
  cap: (c, d) => `
    <path d="M44 120 Q44 64 100 64 Q156 64 156 120 Z" fill="${c}"/>
    <path d="M40 120 H180 Q176 136 150 136 H40 Z" fill="${shade(c,20)}"/>
    <circle cx="100" cy="62" r="5" fill="${d}"/>
    <path d="M100 66 V120 M72 72 Q80 96 76 120 M128 72 Q120 96 124 120" stroke="${shade(c,30)}" stroke-width="1.6" fill="none"/>
    <path d="M86 100 L100 88 L114 100" stroke="${d}" stroke-width="3" fill="none"/>`,
};

export function productArt(type, c, c2, bg = true) {
  const body = (ART[type] || ART.tshirt)(c, c2);
  const tint = shade(c, c === '#141019' ? 210 : 150);
  const id = 'bg' + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${bg ? `<defs><radialGradient id="${id}" cx="50%" cy="46%" r="50%"><stop offset="0" stop-color="${tint}" stop-opacity=".55"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/></radialGradient></defs>
    <rect width="200" height="200" fill="url(#${id})"/>` : ''}
    <ellipse cx="100" cy="184" rx="58" ry="6" fill="#141019" opacity=".08"/>
    <g class="art-body">${body}</g>
  </svg>`;
}

/* Photo when the product has one, illustration otherwise */
export function productMedia(p) {
  if (!p.img) return productArt(p.type, p.c, p.c2);
  const alt = p.name.replace(/"/g, '&quot;');
  return `<img class="photo" src="${p.img}" alt="${alt}" loading="lazy" decoding="async" data-id="${p.id}">`;
}

export const ART_TYPES = Object.keys(ART);
