/* Sunu Waxal — admin page: sign in, then add / edit / hide / delete products and photos.
   Security is enforced by the database (only emails in public.admins can write);
   this page only decides what to show. */
import { SUPABASE_URL, SUPABASE_ANON_KEY, PHOTO_BUCKET } from './config.js';
import { CATEGORIES, ART_TYPES, formatPrice, productArt } from './products.js';
import { photoUrl } from './catalog.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CATS = CATEGORIES.filter(c => c.id !== 'all');
const catLabel = id => CATS.find(c => c.id === id)?.label || id;

const db = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const state = {
  products: [],
  query: '',
  cat: 'all',
  editing: null,     // product row being edited, or {} for a new one
  sizes: [],
  photo: { path: null, blob: null, previewUrl: null, removed: false },
  authMode: 'login',
};

/* ---------- Screens ---------- */
function show(id) {
  $$('.a-screen').forEach(s => { s.hidden = s.id !== id; });
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function formMsg(el, text, ok = false) {
  el.hidden = !text;
  el.textContent = text || '';
  el.classList.toggle('ok', ok);
}

/* ---------- Auth ---------- */
async function route() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return show('authScreen');
  const { data: isAdmin, error } = await db.rpc('is_admin');
  if (error) {
    show('authScreen');
    return formMsg($('#authMsg'), 'Could not check your access. Check your connection and try again.');
  }
  if (!isAdmin) {
    $('#deniedEmail').textContent = session.user.email;
    return show('deniedScreen');
  }
  show('appScreen');
  loadProducts();
}

function setAuthMode(mode) {
  state.authMode = mode;
  $$('.seg-btn').forEach(b => {
    const on = b.dataset.mode === mode;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on);
  });
  $('#authSubmit').textContent = mode === 'login' ? 'Log in' : 'Create account';
  $('#pwHint').hidden = mode === 'login';
  $('#authForm').password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  formMsg($('#authMsg'), '');
}

async function submitAuth(e) {
  e.preventDefault();
  const f = e.target;
  const email = f.email.value.trim().toLowerCase();
  const password = f.password.value;
  const msg = $('#authMsg');
  if (!/^\S+@\S+\.\S+$/.test(email)) return formMsg(msg, 'Enter a valid email address.');
  if (password.length < 8) return formMsg(msg, 'Password must be at least 8 characters.');

  const btn = $('#authSubmit');
  btn.disabled = true;
  formMsg(msg, '');
  try {
    if (state.authMode === 'login') {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) {
        const text = /confirm/i.test(error.message)
          ? 'Please confirm your email first: open the link we sent you, then log in here.'
          : 'Wrong email or password.';
        return formMsg(msg, text);
      }
      f.password.value = '';
      await route();
    } else {
      const { data, error } = await db.auth.signUp({ email, password, options: { emailRedirectTo: location.href.split('#')[0] } });
      if (error) return formMsg(msg, error.message);
      if (data.session) return route();
      setAuthMode('login');
      formMsg(msg, `Account created. We sent a confirmation link to ${email}. Open it, then come back here and log in. (If the link opens a page that doesn't load, that's fine: your email is still confirmed.)`, true);
    }
  } catch {
    formMsg(msg, 'No connection. Check your internet and try again.');
  } finally {
    btn.disabled = false;
  }
}

async function forgotPassword() {
  const email = $('#authForm').email.value.trim().toLowerCase();
  const msg = $('#authMsg');
  if (!/^\S+@\S+\.\S+$/.test(email)) return formMsg(msg, 'Type your email above first, then tap "Forgot password?".');
  const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: location.href.split('#')[0] });
  formMsg(msg, error ? error.message : `If ${email} has an account, a reset link is on its way.`, !error);
}

/* ---------- Product list ---------- */
async function loadProducts() {
  $('#list').innerHTML = Array.from({ length: 6 }, () => '<div class="sk sk-item"></div>').join('');
  const { data, error } = await db.from('products').select('*').order('sort_order').order('id');
  if (error) {
    $('#list').innerHTML = '';
    return toast('Could not load products: ' + error.message);
  }
  state.products = data;
  renderStats();
  renderList();
}

function renderStats() {
  const p = state.products;
  const stat = (n, label) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`;
  $('#stats').innerHTML =
    stat(p.length, 'Products') +
    stat(p.filter(x => x.visible).length, 'In the shop') +
    stat(p.filter(x => !x.visible).length, 'Hidden') +
    stat(p.filter(x => x.image_path).length, 'With photo');
}

function thumb(p) {
  return p.image_path
    ? `<img class="photo" src="${esc(photoUrl(p.image_path))}" alt="" loading="lazy">`
    : productArt(p.art_type, p.color, p.color2);
}

function renderList() {
  const q = state.query.trim().toLowerCase();
  const list = state.products.filter(p =>
    (state.cat === 'all' || p.category === state.cat) &&
    (!q || p.name.toLowerCase().includes(q)));
  $('#listEmpty').hidden = list.length > 0;
  $('#list').innerHTML = list.map((p, i) => `
    <button class="item ${p.visible ? '' : 'hidden-item'}" data-id="${p.id}" style="animation-delay:${Math.min(i, 12) * 30}ms">
      <div class="item-thumb">${thumb(p)}</div>
      <div class="item-info">
        <h3>${esc(p.name)}</h3>
        <div class="item-meta">${esc(catLabel(p.category))} · ${p.sizes.length ? esc(p.sizes.join(', ')) : 'No sizes'}</div>
        <div class="item-price">${formatPrice(p.price)}${p.old_price ? `<s>${formatPrice(p.old_price)}</s>` : ''}</div>
        <div class="badges">
          ${p.visible ? '' : '<span class="badge-sm off">Hidden</span>'}
          ${p.tag ? `<span class="badge-sm ${esc(p.tag)}">${esc(p.tag)}</span>` : ''}
          ${p.image_path ? '' : '<span class="badge-sm">No photo</span>'}
        </div>
      </div>
      <span class="item-edit" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg></span>
    </button>`).join('');
}

/* ---------- Editor ---------- */
let lastFocus = null;
function openModal(el) {
  lastFocus = document.activeElement;
  $('#overlay').hidden = false;
  el.hidden = false;
  document.body.classList.add('is-locked');
}
function closeModal(el) {
  el.hidden = true;
  if ($$('.modal').every(m => m.hidden)) {
    $('#overlay').hidden = true;
    document.body.classList.remove('is-locked');
  }
  lastFocus?.focus?.();
}

function openEditor(p) {
  const isNew = !p.id;
  state.editing = p;
  state.sizes = [...(p.sizes || [])];
  resetPhoto(p.image_path || null);
  const f = $('#edForm');
  $('#edTitle').textContent = isNew ? 'Add product' : 'Edit product';
  f.name.value = p.name || '';
  f.category.value = p.category || (state.cat !== 'all' ? state.cat : 'women');
  f.tag.value = p.tag || '';
  f.price.value = p.price ?? '';
  f.old_price.value = p.old_price ?? '';
  f.description.value = p.description || '';
  f.visible.checked = p.visible ?? true;
  f.sort_order.value = p.sort_order ?? nextSortOrder();
  f.art_type.value = p.art_type || defaultArt(f.category.value);
  f.color.value = p.color || '#C9A24B';
  f.color2.value = p.color2 || '#E9CF8A';
  $('#deleteBtn').hidden = isNew;
  formMsg($('#edMsg'), '');
  renderSizes();
  renderPhoto();
  openModal($('#editor'));
  setTimeout(() => f.name.focus(), 50);
}

const nextSortOrder = () => state.products.reduce((m, p) => Math.max(m, p.sort_order || 0), 0) + 1;
const defaultArt = cat => CATEGORIES.find(c => c.id === cat)?.art || 'tshirt';

function renderSizes() {
  $('#sizeChips').innerHTML = state.sizes.length
    ? state.sizes.map((s, i) => `<span class="chip-x">${esc(s)}<button type="button" data-rm-size="${i}" aria-label="Remove size ${esc(s)}">✕</button></span>`).join('')
    : '<span class="a-muted tiny">No sizes yet. Customers will see "One size".</span>';
}
function addSizes(text) {
  text.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
    if (!state.sizes.some(x => x.toLowerCase() === s.toLowerCase())) state.sizes.push(s.slice(0, 12));
  });
  renderSizes();
}

/* Photo handling: resize on the phone before upload */
function resetPhoto(path) {
  if (state.photo.previewUrl) URL.revokeObjectURL(state.photo.previewUrl);
  state.photo = { path, blob: null, previewUrl: null, removed: false };
  $('#photoInput').value = '';
}

function renderPhoto() {
  const { path, previewUrl, removed } = state.photo;
  const f = $('#edForm');
  const src = previewUrl || (!removed && path ? photoUrl(path) : null);
  $('#photoPreview').innerHTML = src
    ? `<img src="${esc(src)}" alt="Product photo preview">`
    : productArt(f.art_type.value, f.color.value, f.color2.value, false);
  $('#photoBtnText').textContent = src ? 'Change photo' : 'Add photo';
  $('#photoRemove').hidden = !src;
}

async function resizeImage(file, maxSide = 1400, quality = 0.82) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    bitmap = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('This file is not an image the browser can read.'));
      img.src = URL.createObjectURL(file);
    });
  }
  const w = bitmap.width, h = bitmap.height;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // flatten transparent PNGs onto white
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not process this photo.'))), 'image/jpeg', quality));
}

async function pickPhoto(file) {
  if (!file) return;
  $('#photoBusy').hidden = false;
  try {
    const blob = await resizeImage(file);
    if (state.photo.previewUrl) URL.revokeObjectURL(state.photo.previewUrl);
    state.photo.blob = blob;
    state.photo.previewUrl = URL.createObjectURL(blob);
    state.photo.removed = false;
    renderPhoto();
  } catch (err) {
    formMsg($('#edMsg'), err.message);
  } finally {
    $('#photoBusy').hidden = true;
  }
}

function readForm() {
  const f = $('#edForm');
  const num = v => (v === '' ? null : Number(v));
  return {
    name: f.name.value.trim(),
    category: f.category.value,
    tag: f.tag.value || null,
    price: num(f.price.value),
    old_price: num(f.old_price.value),
    sizes: state.sizes,
    description: f.description.value.trim() || null,
    visible: f.visible.checked,
    sort_order: num(f.sort_order.value) ?? 0,
    art_type: f.art_type.value,
    color: f.color.value,
    color2: f.color2.value,
  };
}

function validate(row) {
  if (!row.name) return 'Please enter a product name.';
  if (row.price == null || !Number.isInteger(row.price) || row.price < 0) return 'Price must be a whole number of dalasi (for example 2450).';
  if (row.old_price != null && (!Number.isInteger(row.old_price) || row.old_price <= row.price))
    return 'The old price must be a whole number higher than the price, or left empty.';
  if (!Number.isInteger(row.sort_order)) return 'Position must be a whole number.';
  return null;
}

async function save(e) {
  e.preventDefault();
  const row = readForm();
  const problem = validate(row);
  if (problem) return formMsg($('#edMsg'), problem);

  const btn = $('#saveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  formMsg($('#edMsg'), '');
  const oldPath = state.editing.image_path || null;
  let uploadedPath = null;
  try {
    if (state.photo.blob) {
      uploadedPath = `${crypto.randomUUID()}.jpg`;
      const { error } = await db.storage.from(PHOTO_BUCKET).upload(uploadedPath, state.photo.blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (error) throw new Error('Photo upload failed: ' + error.message);
      row.image_path = uploadedPath;
    } else if (state.photo.removed) {
      row.image_path = null;
    }

    const query = state.editing.id
      ? db.from('products').update(row).eq('id', state.editing.id).select().single()
      : db.from('products').insert(row).select().single();
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Old photo is no longer used
    if (oldPath && ('image_path' in row) && row.image_path !== oldPath) {
      await db.storage.from(PHOTO_BUCKET).remove([oldPath]);
    }
    const i = state.products.findIndex(p => p.id === data.id);
    if (i >= 0) state.products[i] = data; else state.products.push(data);
    state.products.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    renderStats();
    renderList();
    closeModal($('#editor'));
    toast(state.editing.id ? 'Saved. The shop is updated.' : 'Product added to the shop.');
  } catch (err) {
    if (uploadedPath) await db.storage.from(PHOTO_BUCKET).remove([uploadedPath]); // don't leave an orphan
    formMsg($('#edMsg'), /row-level security|permission/i.test(err.message)
      ? "You don't have permission to change products. Try logging out and back in."
      : err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save';
  }
}

function askDelete() {
  const p = state.editing;
  $('#cfText').textContent = `"${p.name}" will be removed from the shop and deleted for good. To take it off the shop for now, turn off "Show in the shop" instead.`;
  openModal($('#confirm'));
}

async function doDelete() {
  const p = state.editing;
  const btn = $('#cfYes');
  btn.disabled = true;
  try {
    const { error } = await db.from('products').delete().eq('id', p.id);
    if (error) throw new Error(error.message);
    if (p.image_path) await db.storage.from(PHOTO_BUCKET).remove([p.image_path]);
    state.products = state.products.filter(x => x.id !== p.id);
    renderStats();
    renderList();
    closeModal($('#confirm'));
    closeModal($('#editor'));
    toast('Product deleted.');
  } catch (err) {
    closeModal($('#confirm'));
    formMsg($('#edMsg'), 'Could not delete: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

/* ---------- Wiring ---------- */
function bind() {
  $$('.seg-btn').forEach(b => b.onclick = () => setAuthMode(b.dataset.mode));
  $('#authForm').onsubmit = submitAuth;
  $('#forgotBtn').onclick = forgotPassword;
  $$('[data-signout]').forEach(b => b.onclick = async () => { await db.auth.signOut(); location.reload(); });

  $('#catFilter').innerHTML = '<option value="all">All categories</option>' + CATS.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  $('#catFilter').onchange = e => { state.cat = e.target.value; renderList(); };
  $('#q').oninput = e => { state.query = e.target.value; renderList(); };
  $('#addBtn').onclick = () => openEditor({});
  $('#list').onclick = e => {
    const item = e.target.closest('.item');
    if (item) openEditor(state.products.find(p => p.id === +item.dataset.id));
  };

  const f = $('#edForm');
  f.category.innerHTML = CATS.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  f.art_type.innerHTML = ART_TYPES.map(t => `<option value="${t}">${t[0].toUpperCase() + t.slice(1)}</option>`).join('');
  f.onsubmit = save;
  [f.art_type, f.color, f.color2].forEach(el => el.addEventListener('input', renderPhoto));
  f.category.addEventListener('change', () => { if (!state.editing.id) { f.art_type.value = defaultArt(f.category.value); renderPhoto(); } });
  $('#photoInput').onchange = e => pickPhoto(e.target.files[0]);
  $('#photoRemove').onclick = () => {
    if (state.photo.previewUrl) URL.revokeObjectURL(state.photo.previewUrl);
    state.photo.blob = null;
    state.photo.previewUrl = null;
    state.photo.removed = true;
    $('#photoInput').value = '';
    renderPhoto();
  };
  $('#sizeAddBtn').onclick = () => { addSizes($('#sizeInput').value); $('#sizeInput').value = ''; $('#sizeInput').focus(); };
  $('#sizeInput').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('#sizeAddBtn').click(); } };
  $('#sizeChips').onclick = e => {
    const b = e.target.closest('[data-rm-size]');
    if (b) { state.sizes.splice(+b.dataset.rmSize, 1); renderSizes(); }
  };
  $$('.preset').forEach(b => b.onclick = () => { state.sizes = []; addSizes(b.dataset.preset); });
  $('#deleteBtn').onclick = askDelete;
  $('#cfYes').onclick = doDelete;

  document.addEventListener('click', e => {
    const closer = e.target.closest('[data-close]');
    if (closer) closeModal(closer.closest('.modal'));
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = $$('.modal').filter(m => !m.hidden).pop();
    if (open) closeModal(open);
  });
  db.auth.onAuthStateChange(evt => {
    if (evt === 'SIGNED_OUT') show('authScreen');
    if (evt === 'PASSWORD_RECOVERY') setTimeout(promptNewPassword, 0);
  });
}

// Arriving from a "reset password" email link
async function promptNewPassword() {
  const pw = prompt('Choose a new password (at least 8 characters):');
  if (!pw) return;
  if (pw.length < 8) return alert('Password must be at least 8 characters.');
  const { error } = await db.auth.updateUser({ password: pw });
  alert(error ? 'Could not change password: ' + error.message : 'Password changed.');
  route();
}

// Stop the loading shimmer once a thumbnail arrives
document.addEventListener('load', e => { if (e.target.matches?.('img.photo')) e.target.classList.add('loaded'); }, true);

if (!db) {
  show('authScreen');
  formMsg($('#authMsg'), 'Could not load the login system. Check your internet connection and reload.');
} else {
  bind();
  route().catch(() => {
    show('authScreen');
    formMsg($('#authMsg'), 'No connection. Check your internet and reload.');
  });
}
