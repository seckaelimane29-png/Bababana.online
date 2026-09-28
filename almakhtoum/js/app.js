import { PRODUCTS, CATEGORIES, formatPrice, productArt } from './products.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const FREE_SHIP = 5000;
const WHATSAPP = '2202048100'; // +220 204 8100 — all orders go here
const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Persisted state (per browser) ---------- */
const store = {
  get(k, fallback) { try { return JSON.parse(localStorage.getItem('alm:' + k)) ?? fallback; } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem('alm:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

const state = {
  cat: 'all',
  tag: null,
  query: '',
  maxPrice: 7000,
  sort: 'featured',
  cart: store.get('cart', []).filter(l => byId[l.id]),
  wish: store.get('wish', []).filter(id => byId[id]),
};

const icons = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  wa: '<svg class="wa-ico" viewBox="0 0 24 24"><path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.9L2.2 21.8l4.8-1.3A9.8 9.8 0 1 0 12 2.2z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.6 7.3c.3-.3.8-.2 1 .1l.9 1.7c.2.3.1.7-.2 1l-.5.5a6.3 6.3 0 0 0 3.6 3.6l.5-.5c.3-.3.7-.4 1-.2l1.7.9c.3.2.4.7.1 1l-.8.8c-.6.6-1.5.8-2.3.4a10.5 10.5 0 0 1-5.4-5.4c-.4-.8-.2-1.7.4-2.3z" fill="currentColor"/></svg>',
};

/* ---------- WhatsApp orders ---------- */
function productMessage(p, size) {
  return `Hello Almakhtoum! I'd like to buy:\n\n` +
    `• ${p.name} (#${p.id})\n  Size: ${size}\n  Price: ${formatPrice(p.price)}\n\n` +
    `Is it available? Thank you.`;
}
function cartMessage({ name, phone, area, pay } = {}) {
  const lines = state.cart.map(l => {
    const p = byId[l.id];
    return `• ${p.name} (#${p.id}) — Size ${l.size} × ${l.qty} = ${formatPrice(p.price * l.qty)}`;
  });
  let msg = `Hello Almakhtoum! I'd like to order:\n\n${lines.join('\n')}\n\nSubtotal: ${formatPrice(cartTotal())}`;
  if (name) msg += `\n\nName: ${name}\nPhone: ${phone}\nDelivery: ${area}\nPayment: ${pay}`;
  return msg;
}
function buyNow(id, size) {
  const p = byId[id];
  size = size || p.sizes[Math.min(1, p.sizes.length - 1)];
  window.open(waLink(productMessage(p, size)), '_blank', 'noopener');
}

/* ---------- Skeletons ---------- */
const skeletonCard = () => `
  <div class="sk-card" aria-hidden="true">
    <div class="sk sk-media"></div>
    <div class="sk sk-line w40"></div>
    <div class="sk sk-line w70"></div>
    <div class="sk-row"><div class="sk sk-line w30"></div><div class="sk sk-line w30"></div></div>
  </div>`;
const skeletonCat = () => `
  <div class="sk-cat" aria-hidden="true">
    <div class="sk sk-square"></div>
    <div class="sk sk-line w70"></div>
    <div class="sk sk-line w40"></div>
  </div>`;
const skeletonLine = () => `
  <div class="line-item" aria-hidden="true">
    <div class="sk sk-thumb"></div>
    <div class="li-info"><div class="sk sk-line w70" style="margin-top:4px"></div><div class="sk sk-line w40"></div><div class="sk sk-line w30"></div></div>
  </div>`;

/* ---------- Categories ---------- */
function renderCategories() {
  $('#catGrid').innerHTML = CATEGORIES.filter(c => c.id !== 'all').map((c, i) => {
    const n = PRODUCTS.filter(p => p.cat === c.id).length;
    return `<button class="cat" style="--i:${i};--c:${c.color}" data-cat="${c.id}">
      <span class="count">${n}</span>
      <div class="cat-art">${productArt(c.art, c.color, '#E9CF8A', false)}</div>
      <h3>${c.label}</h3><p>${c.blurb}</p>
    </button>`;
  }).join('');
}

function renderChips() {
  $('#chips').innerHTML = CATEGORIES.map(c => {
    const n = c.id === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c.id).length;
    const active = c.id === state.cat && !state.tag;
    return `<button class="chip ${active ? 'active' : ''}" role="tab" aria-selected="${active}" data-cat="${c.id}">${c.label}<small>${n}</small></button>`;
  }).join('') + `<button class="chip ${state.tag === 'Sale' ? 'active' : ''}" role="tab" aria-selected="${state.tag === 'Sale'}" data-tag="Sale">On sale</button>`;
  $$('.nav a').forEach(a => a.classList.toggle('active', a.dataset.cat === state.cat));
}

/* ---------- Products ---------- */
function filtered() {
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter(p =>
    (state.cat === 'all' || p.cat === state.cat) &&
    (!state.tag || p.tag === state.tag) &&
    p.price <= state.maxPrice &&
    (!q || (p.name + ' ' + p.cat + ' ' + p.type).toLowerCase().includes(q)));
  const sorters = {
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    new: (a, b) => (b.tag === 'New') - (a.tag === 'New') || b.id - a.id,
  };
  if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
  return list;
}

function cardHTML(p, i) {
  const catLabel = CATEGORIES.find(c => c.id === p.cat).label;
  const wished = state.wish.includes(p.id);
  return `<article class="card" style="--i:${i}" data-id="${p.id}">
    <div class="card-media" data-quick>
      ${p.tag ? `<span class="tag ${p.tag}">${p.tag === 'Sale' ? '−' + Math.round((1 - p.price / p.old) * 100) + '%' : p.tag}</span>` : ''}
      <button class="wish-toggle ${wished ? 'on' : ''}" data-wish aria-label="${wished ? 'Remove from' : 'Add to'} wishlist" aria-pressed="${wished}">${icons.heart}</button>
      ${productArt(p.type, p.c, p.c2)}
      <div class="card-actions">
        <button class="btn btn-wa" data-buy aria-label="Buy ${p.name} on WhatsApp">${icons.wa}<span>Buy</span></button>
        <button class="btn qv" data-add aria-label="Add to bag">${icons.bag}</button>
        <button class="btn qv" data-quick aria-label="Quick view">${icons.eye}</button>
      </div>
    </div>
    <div class="card-body">
      <div class="card-cat">${catLabel}</div>
      <h3 class="card-name" data-quick>${p.name}</h3>
      <div class="card-meta">
        <span class="price">${formatPrice(p.price)}${p.old ? `<s>${formatPrice(p.old)}</s>` : ''}</span>
        <span class="stars">${p.rating.toFixed(1)} (${p.reviews})</span>
      </div>
      <div class="swatches"><i style="background:${p.c}"></i><i style="background:${p.c2}"></i></div>
    </div>
  </article>`;
}

let renderTimer;
function renderGrid(delay = 550) {
  const grid = $('#grid');
  const list = filtered();
  clearTimeout(renderTimer);
  grid.setAttribute('aria-busy', 'true');
  $('#empty').hidden = true;
  grid.innerHTML = Array.from({ length: Math.min(8, Math.max(4, list.length)) }, skeletonCard).join('');
  $('#resultCount').textContent = 'Loading…';
  renderTimer = setTimeout(() => {
    grid.removeAttribute('aria-busy');
    grid.innerHTML = list.map(cardHTML).join('');
    $('#empty').hidden = list.length > 0;
    $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'}`;
    attachTilt();
  }, delay);
}

function setFilter({ cat, tag = null }) {
  if (cat) state.cat = cat;
  state.tag = tag;
  if (tag) state.cat = 'all';
  renderChips();
  renderGrid();
}

/* 3D tilt on product cards (pointer devices only) */
function attachTilt() {
  if (reduceMotion || !matchMedia('(hover: hover)').matches) return;
  $$('.card-media').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Cart ---------- */
const cartTotal = () => state.cart.reduce((s, l) => s + byId[l.id].price * l.qty, 0);
const cartQty = () => state.cart.reduce((s, l) => s + l.qty, 0);

function addToCart(id, size, originEl) {
  const p = byId[id];
  size = size || p.sizes[Math.min(1, p.sizes.length - 1)];
  const line = state.cart.find(l => l.id === id && l.size === size);
  if (line) line.qty++; else state.cart.push({ id, size, qty: 1 });
  store.set('cart', state.cart);
  if (originEl) flyToCart(originEl, p);
  setTimeout(() => updateBadges(true), originEl && !reduceMotion ? 650 : 0);
  toast(`${p.name} added to your bag`);
}

function flyToCart(fromEl, p) {
  if (reduceMotion) return;
  const from = fromEl.getBoundingClientRect();
  const to = $('#cartBtn').getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'flyer';
  f.innerHTML = productArt(p.type, p.c, p.c2);
  document.body.appendChild(f);
  const sx = from.left + from.width / 2 - 35, sy = from.top + from.height / 2 - 35;
  const ex = to.left + to.width / 2 - 35, ey = to.top + to.height / 2 - 35;
  f.animate([
    { transform: `translate(${sx}px, ${sy}px) scale(1.2)`, opacity: 1 },
    { transform: `translate(${(sx + ex) / 2}px, ${Math.min(sy, ey) - 120}px) scale(.9)`, opacity: 1, offset: .5 },
    { transform: `translate(${ex}px, ${ey}px) scale(.2)`, opacity: .4 },
  ], { duration: 700, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => f.remove();
}

function renderCart() {
  const body = $('#cartItems');
  const total = cartTotal();
  $('#cartHeadCount').textContent = cartQty() ? `(${cartQty()})` : '';
  if (!state.cart.length) {
    body.innerHTML = `<div class="drawer-empty"><svg><use href="#seal"/></svg><h4>Your bag is empty</h4><p>Find something you love.</p></div>`;
  } else {
    body.innerHTML = state.cart.map((l, i) => {
      const p = byId[l.id];
      return `<div class="line-item" data-i="${i}" style="animation-delay:${i * 50}ms">
        <div class="li-thumb">${productArt(p.type, p.c, p.c2)}</div>
        <div class="li-info">
          <h4>${p.name}</h4><small>Size ${l.size}</small>
          <div class="li-bottom">
            <div class="qty"><button data-dec aria-label="Decrease">−</button><span>${l.qty}</span><button data-inc aria-label="Increase">+</button></div>
            <b>${formatPrice(p.price * l.qty)}</b>
          </div>
          <button class="li-remove" data-remove>Remove</button>
        </div>
      </div>`;
    }).join('');
  }
  const left = FREE_SHIP - total;
  $('#shipText').innerHTML = !total ? `Free Greater Banjul delivery over <b>${formatPrice(FREE_SHIP)}</b>`
    : left > 0 ? `You're <b>${formatPrice(left)}</b> away from free delivery`
    : `🎉 You've unlocked <b>free delivery</b>`;
  $('#shipBar').style.width = Math.min(100, total / FREE_SHIP * 100) + '%';
  const delivery = !total ? 0 : left > 0 ? 150 : 0;
  $('#subtotal').textContent = formatPrice(total);
  $('#delivery').textContent = !total ? '—' : delivery ? `from ${formatPrice(delivery)}` : 'Free';
  $('#total').textContent = formatPrice(total + delivery);
  $('#checkoutBtn').disabled = !total;
  $('#checkoutBtn').style.opacity = total ? 1 : .5;
}

function updateBadges(bump) {
  const set = (el, n) => {
    el.textContent = n;
    el.classList.toggle('show', n > 0);
    if (bump && n > 0) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  };
  set($('#cartCount'), cartQty());
  set($('#wishCount'), state.wish.length);
  if ($('#cart').classList.contains('open')) renderCart();
}

/* ---------- Wishlist ---------- */
function toggleWish(id) {
  const i = state.wish.indexOf(id);
  if (i >= 0) state.wish.splice(i, 1); else { state.wish.push(id); toast('Saved to your wishlist'); }
  store.set('wish', state.wish);
  updateBadges(i < 0);
  $$(`.card[data-id="${id}"] [data-wish]`).forEach(b => {
    const on = state.wish.includes(id);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
  if ($('#wish').classList.contains('open')) renderWish();
}

function renderWish() {
  const body = $('#wishItems');
  body.innerHTML = !state.wish.length
    ? `<div class="drawer-empty"><svg><use href="#seal"/></svg><h4>No favourites yet</h4><p>Tap the heart on any item to save it here.</p></div>`
    : state.wish.map((id, i) => {
      const p = byId[id];
      return `<div class="line-item" data-id="${id}" style="animation-delay:${i * 50}ms">
        <div class="li-thumb">${productArt(p.type, p.c, p.c2)}</div>
        <div class="li-info"><h4>${p.name}</h4><small>${formatPrice(p.price)}</small>
          <div class="li-bottom"><button class="btn btn-wa" style="padding:9px 14px;font-size:.8rem" data-wbuy>${icons.wa} Buy</button><button class="btn btn-dark" style="padding:9px 14px;font-size:.8rem" data-wadd>Add to bag</button><button class="li-remove" data-wremove>Remove</button></div>
        </div></div>`;
    }).join('');
}

/* ---------- Panels (drawers + modals) ---------- */
let openPanel = null, lastFocus = null;
function open(el) {
  close();
  lastFocus = document.activeElement;
  openPanel = el;
  $('#overlay').hidden = false;
  document.body.classList.add('is-locked');
  if (el.classList.contains('drawer')) {
    el.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => el.classList.add('open'));
  } else el.hidden = false;
  setTimeout(() => (el.querySelector('input, button:not([data-close])') || el.querySelector('button'))?.focus(), 60);
}
function close() {
  if (!openPanel) return;
  const el = openPanel;
  if (el.classList.contains('drawer')) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }
  else el.hidden = true;
  $('#overlay').hidden = true;
  document.body.classList.remove('is-locked');
  openPanel = null;
  lastFocus?.focus?.();
}

function openCart(withSkeleton = true) {
  open($('#cart'));
  if (withSkeleton && state.cart.length) {
    $('#cartItems').innerHTML = state.cart.slice(0, 4).map(skeletonLine).join('');
    setTimeout(renderCart, 380);
  } else renderCart();
}

/* Quick view, with its own skeleton */
function quickView(id) {
  const p = byId[id];
  open($('#quick'));
  $('#qvMedia').innerHTML = '<div class="sk" style="width:70%;aspect-ratio:1;border-radius:50%"></div>';
  $('#qvInfo').innerHTML = `<div class="sk sk-line w40"></div><div class="sk sk-line w70" style="height:34px"></div><div class="sk sk-line w30" style="height:22px"></div>
    <div class="sk sk-line"></div><div class="sk sk-line"></div><div class="sk sk-line w70"></div><div class="sk" style="height:52px;border-radius:999px;margin-top:30px"></div>`;
  setTimeout(() => {
    let size = p.sizes[Math.min(1, p.sizes.length - 1)];
    const wished = state.wish.includes(id);
    $('#qvMedia').innerHTML = productArt(p.type, p.c, p.c2);
    $('#qvInfo').innerHTML = `
      <span class="card-cat">${CATEGORIES.find(c => c.id === p.cat).label}${p.tag ? ' · ' + p.tag : ''}</span>
      <h2 id="qvName">${p.name}</h2>
      <div class="card-meta" style="justify-content:flex-start;gap:16px"><span class="price">${formatPrice(p.price)}${p.old ? `<s>${formatPrice(p.old)}</s>` : ''}</span><span class="stars">${p.rating.toFixed(1)} · ${p.reviews} reviews</span></div>
      <p>Handpicked for comfort in the Gambian heat and made to last. Checked, pressed and sealed by the Almakhtoum team before it leaves our Serrekunda studio.</p>
      <div class="opt-label">Size</div>
      <div class="sizes">${p.sizes.map(s => `<button class="size ${s === size ? 'on' : ''}" data-size="${s}">${s}</button>`).join('')}</div>
      <div class="qv-actions">
        <button class="btn btn-wa" id="qvBuy">${icons.wa} Buy on WhatsApp · ${formatPrice(p.price)}</button>
      </div>
      <div class="qv-actions qv-secondary">
        <button class="btn btn-outline" id="qvAdd">${icons.bag} Add to bag</button>
        <button class="icon-btn ${wished ? 'on' : ''}" id="qvWish" aria-label="Wishlist">${icons.heart}</button>
      </div>
      <ul class="qv-perks"><li>🚚 Same-day delivery in Greater Banjul</li><li>📱 Wave · Afrimoney · QMoney · Cash</li><li>↺ Free 7-day size exchange</li></ul>`;
    $$('.size', $('#qvInfo')).forEach(b => b.onclick = () => {
      size = b.dataset.size;
      $$('.size', $('#qvInfo')).forEach(x => x.classList.toggle('on', x === b));
    });
    $('#qvBuy').onclick = () => buyNow(id, size);
    $('#qvAdd').onclick = e => { addToCart(id, size, e.currentTarget); setTimeout(close, 250); };
    $('#qvWish').onclick = e => { toggleWish(id); e.currentTarget.classList.toggle('on', state.wish.includes(id)); };
  }, 450);
}

/* ---------- Checkout ---------- */
function openCheckout() {
  open($('#checkout'));
  $('#coForm').hidden = false;
  $('#coDone').hidden = true;
  updateCoTotal();
}
function updateCoTotal() {
  const t = cartTotal();
  const fee = t >= FREE_SHIP && $('#coArea').value === '150' ? 0 : +$('#coArea').value;
  $('#coTotal').textContent = formatPrice(t + fee) + (fee ? '' : ' · free delivery');
}

/* ---------- Misc UI ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function startCountdown() {
  const end = Date.now() + ((5 * 60 + 47) * 60 + 12) * 1000;
  const els = { h: $('[data-u=h]'), m: $('[data-u=m]'), s: $('[data-u=s]') };
  const tick = () => {
    const left = Math.max(0, end - Date.now());
    const v = { h: Math.floor(left / 36e5), m: Math.floor(left / 6e4) % 60, s: Math.floor(left / 1e3) % 60 };
    for (const k in v) {
      const txt = String(v[k]).padStart(2, '0');
      if (els[k].textContent !== txt) {
        els[k].textContent = txt;
        els[k].classList.remove('tick'); void els[k].offsetWidth; els[k].classList.add('tick');
      }
    }
  };
  tick();
  setInterval(tick, 1000);
}

function countUp(el) {
  const target = +el.dataset.count;
  const t0 = performance.now(), dur = 1600;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('en-GB');
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setupReveal() {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.value').forEach((el, i) => el.style.setProperty('--i', i));
  $$('.reveal').forEach(el => io.observe(el));
}

function updateRange() {
  const r = $('#priceRange');
  r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
  $('#priceOut').textContent = formatPrice(r.value);
}

/* ---------- Events ---------- */
function bind() {
  document.addEventListener('click', e => {
    const t = e.target;
    const catEl = t.closest('[data-cat]');
    if (catEl) {
      if (catEl.tagName === 'A') e.preventDefault();
      $('#mobileNav').hidden = true;
      $('#menuBtn').setAttribute('aria-expanded', 'false');
      setFilter({ cat: catEl.dataset.cat });
      if (!catEl.classList.contains('chip')) $('#shop').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    const tagEl = t.closest('[data-tag], [data-jump-tag]');
    if (tagEl) {
      if (tagEl.dataset.jumpTag) { e.preventDefault(); $('#shop').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
      const tag = tagEl.dataset.tag || tagEl.dataset.jumpTag;
      setFilter({ cat: 'all', tag: state.tag === tag && tagEl.dataset.tag ? null : tag });
      return;
    }
    const card = t.closest('.card');
    if (card) {
      const id = +card.dataset.id;
      if (t.closest('[data-wish]')) return toggleWish(id);
      if (t.closest('[data-buy]')) return buyNow(id);
      if (t.closest('[data-add]')) return addToCart(id, null, card.querySelector('.card-media'));
      if (t.closest('[data-quick]')) return quickView(id);
    }
    const li = t.closest('#cartItems .line-item');
    if (li) {
      const line = state.cart[+li.dataset.i];
      if (t.closest('[data-inc]')) line.qty++;
      else if (t.closest('[data-dec]')) line.qty--;
      else if (t.closest('[data-remove]')) line.qty = 0;
      else return;
      const removing = line.qty <= 0;
      const commit = () => {
        state.cart = state.cart.filter(l => l.qty > 0);
        store.set('cart', state.cart);
        updateBadges(false);
        renderCart();
      };
      if (removing) { li.classList.add('removing'); setTimeout(commit, 320); } else commit();
      return;
    }
    const wli = t.closest('#wishItems .line-item');
    if (wli) {
      const id = +wli.dataset.id;
      if (t.closest('[data-wbuy]')) buyNow(id);
      if (t.closest('[data-wadd]')) addToCart(id, null, wli.querySelector('.li-thumb'));
      if (t.closest('[data-wremove]')) toggleWish(id);
      return;
    }
    if (t.closest('[data-close]') || t === $('#overlay') || t.classList.contains('modal')) close();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); $('#mobileNav').hidden = true; } });
  $('#cartBtn').onclick = () => openCart();
  $('#wishBtn').onclick = () => { open($('#wish')); renderWish(); };
  $('#checkoutBtn').onclick = () => { if (state.cart.length) openCheckout(); };
  $('#coArea').onchange = updateCoTotal;
  $('#coForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const areaSel = $('#coArea');
    const msg = cartMessage({
      name: fd.get('name'), phone: fd.get('phone'), pay: fd.get('pay'),
      area: areaSel.options[areaSel.selectedIndex].text,
    }) + `\nTotal to pay: ${$('#coTotal').textContent}`;
    // Open synchronously inside the submit handler so pop-up blockers allow it
    window.open(waLink(msg), '_blank', 'noopener');
    $('#coForm').hidden = true;
    $('#coDone').hidden = false;
    $('#coDoneText').innerHTML = `Thank you, ${escapeHTML(fd.get('name').split(' ')[0])}! Your order is ready in WhatsApp. Press <b>send</b> and we'll confirm your ${escapeHTML(fd.get('pay'))} payment and delivery. <br/><br/>WhatsApp didn't open? <a class="wa-inline" href="${waLink(msg)}" target="_blank" rel="noopener">Tap here</a>.`;
  };
  $('#menuBtn').onclick = () => {
    const nav = $('#mobileNav');
    nav.hidden = !nav.hidden;
    $('#menuBtn').setAttribute('aria-expanded', String(!nav.hidden));
  };

  let searchTimer;
  $('#search').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = e.target.value;
      if (state.query && !isInView($('#shop'))) $('#shop').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      renderGrid(350);
    }, 250);
  });
  $('#priceRange').addEventListener('input', e => { state.maxPrice = +e.target.value; updateRange(); });
  $('#priceRange').addEventListener('change', () => renderGrid(350));
  $('#sort').onchange = e => { state.sort = e.target.value; renderGrid(350); };
  $('#resetFilters').onclick = () => {
    Object.assign(state, { cat: 'all', tag: null, query: '', maxPrice: 7000, sort: 'featured' });
    $('#search').value = ''; $('#priceRange').value = 7000; $('#sort').value = 'featured';
    updateRange(); renderChips(); renderGrid();
  };
  $('#newsForm').onsubmit = e => { e.preventDefault(); e.target.reset(); toast('Welcome! Your D 250 voucher is on its way'); };

  const header = $('#header');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });
}

const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isInView = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };

/* ---------- Boot ---------- */
function boot() {
  $('#year').textContent = new Date().getFullYear();
  $('#saleArt1').innerHTML = productArt('handbag', '#C8553D', '#E9CF8A', false);
  $('#saleArt2').innerHTML = productArt('heel', '#7A1F3D', '#E9CF8A', false);

  // Skeletons first, then real content (simulates fetching from a server)
  $('#catGrid').innerHTML = Array.from({ length: 6 }, skeletonCat).join('');
  renderChips();
  renderGrid(1400);
  setTimeout(renderCategories, 1100);

  bind();
  updateRange();
  updateBadges(false);
  startCountdown();

  let booted = false;
  const done = () => {
    if (booted) return;
    booted = true;
    document.body.classList.remove('is-loading');
    setTimeout(() => {
      document.body.classList.add('ready');
      setupReveal();
      $$('[data-count]').forEach(countUp);
    }, 250);
  };
  if (document.readyState === 'complete') setTimeout(done, 700);
  else addEventListener('load', () => setTimeout(done, 500));
  setTimeout(done, 3000); // never block on slow fonts/CDN

  // If WebGL or the 3D library is unavailable, show an animated 2D stage instead
  const fallback = () => {
    if ($('#hero3d').classList.contains('on') || $('#heroStage').classList.contains('fallback')) return;
    $('#heroStage').classList.add('fallback');
    $('#stageSkeleton').innerHTML = `<div class="fb-ring"></div><svg class="fb-seal"><use href="#seal"/></svg>
      <div class="fb-item fb-1">${productArt('handbag', '#A8442F', '#E9CF8A', false)}</div>
      <div class="fb-item fb-2">${productArt('sneaker', '#F5F2EC', '#C8553D', false)}</div>`;
  };
  addEventListener('hero3d:fail', fallback);
  setTimeout(fallback, 8000);
}

boot();
