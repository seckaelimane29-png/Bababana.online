/* Loads the product list from Supabase (edited on the admin page).
   Falls back to the built-in sample list if the database can't be reached. */
import { SUPABASE_URL, SUPABASE_ANON_KEY, PHOTO_BUCKET } from './config.js';
import { PRODUCTS as SAMPLE_PRODUCTS } from './products.js';

export const photoUrl = path =>
  `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;

// Database row → the shape the storefront uses
export function fromRow(r) {
  return {
    id: r.id,
    name: r.name,
    cat: r.category,
    type: r.art_type,
    c: r.color,
    c2: r.color2,
    price: r.price,
    old: r.old_price || null,
    tag: r.tag || null,
    sizes: r.sizes && r.sizes.length ? r.sizes : ['One size'],
    description: r.description || '',
    img: r.image_path ? photoUrl(r.image_path) : null,
  };
}

export async function loadProducts({ timeoutMs = 8000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&visible=eq.true&order=sort_order.asc,id.asc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { products: (await res.json()).map(fromRow), source: 'live' };
  } catch (err) {
    console.warn('Almakhtoum: using built-in products, database unavailable:', err.message);
    return { products: SAMPLE_PRODUCTS.map(p => ({ ...p, rating: undefined, reviews: undefined })), source: 'sample' };
  } finally {
    clearTimeout(timer);
  }
}
