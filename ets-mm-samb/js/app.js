/* ETS MM SAMB — app: language welcome, routing, catalogue, request list,
   and WhatsApp requests. There is no checkout: every "Request" opens
   WhatsApp with the bale's link already written. */
(function () {
  'use strict';

  var WA_MAIN = '221761669126';
  var WA_ALT = '221785520550';
  var CFG = window.MMS_CONFIG || {};
  var PRODUCTS = window.MMS_PRODUCTS;
  var CATS = window.MMS_CATEGORIES;
  var I18N = window.MMS_I18N;

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---------- storage (never required to work) ---------- */
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  var state = {
    lang: load('mms_lang', null),
    list: load('mms_list', []).filter(function (it) { return byId(it.id); }),
    cat: 'all', q: '', sort: 'pop'
  };

  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function L() { return I18N[state.lang || 'fr']; }
  function t(k) { var v = L()[k]; return v === undefined ? I18N.fr[k] : v; }
  function tx(obj) { return obj[state.lang || 'fr'] || obj.fr; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function catName(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return tx(CATS[i]); return id; }

  /* ---------- WhatsApp ---------- */
  function siteBase() { return location.href.split('#')[0]; }
  function productUrl(p) { return siteBase() + '#/p/' + p.id; }
  function wa(text, num) { return 'https://wa.me/' + (num || WA_MAIN) + '?text=' + encodeURIComponent(text); }
  function line(p, qty) {
    return '• ' + (qty ? qty + ' × ' : '') + tx(p.name) + ' — ' + p.weight + ' kg · ' + t('grade') + ' ' + p.grade + ' · ' + p.origin + '\n  ' + productUrl(p);
  }
  function waOne(p) { return wa(t('waHello') + '\n' + t('waOne') + '\n\n' + line(p) + '\n\n' + t('waEnd')); }
  function waList(name, city) {
    var msg = t('waHello') + '\n' + t('waList') + '\n\n' +
      state.list.map(function (it) { return line(byId(it.id), it.qty); }).join('\n');
    if (name || city) msg += '\n';
    if (name) msg += '\n' + t('waName') + ' : ' + name;
    if (city) msg += '\n' + t('waCity') + ' : ' + city;
    return wa(msg + '\n\n' + t('waEnd'));
  }

  /* ---------- pictures ---------- */
  var svgCache = {};
  function picture(p) {
    if (p.photo) return '<img src="' + esc(p.photo) + '" alt="' + esc(tx(p.name)) + '" loading="lazy" decoding="async">';
    return svgCache[p.id] || (svgCache[p.id] = window.MMSArt.productSVG(p));
  }

  /* ---------- request list ---------- */
  function inList(id) { return state.list.some(function (it) { return it.id === id; }); }
  function addToList(id) {
    if (!inList(id)) state.list.push({ id: id, qty: 1 });
    save('mms_list', state.list);
    updateCounts(true);
    toast(t('addedToast'));
    refreshAddButtons();
  }
  function setQty(id, qty) {
    state.list = state.list.map(function (it) { return it.id === id ? { id: id, qty: Math.max(1, Math.min(99, qty)) } : it; });
    save('mms_list', state.list); renderList(); updateCounts();
  }
  function removeFromList(id) {
    state.list = state.list.filter(function (it) { return it.id !== id; });
    save('mms_list', state.list); renderList(); updateCounts(); refreshAddButtons();
  }
  function totalQty() { return state.list.reduce(function (s, it) { return s + it.qty; }, 0); }
  function updateCounts(bump) {
    var n = totalQty();
    ['listCount', 'listCount2'].forEach(function (id) {
      var el = document.getElementById(id);
      el.textContent = n; el.classList.toggle('is-zero', n === 0);
      if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
  }
  function refreshAddButtons() {
    $$('[data-add]').forEach(function (b) {
      var on = inList(b.getAttribute('data-add'));
      b.classList.toggle('is-in', on);
      var lbl = b.querySelector('.lbl');
      if (lbl) lbl.textContent = on ? (b.hasAttribute('data-long') ? t('inList') : t('added')) : (b.hasAttribute('data-long') ? t('addToList') : t('addList'));
    });
  }

  function renderList() {
    var body = $('#listBody'), foot = $('#listFoot');
    if (!state.list.length) {
      body.innerHTML = '<div class="empty"><div class="empty-art">' + window.MMSArt.miniBale('empty', 'clear', ['#3a4148', '#4b545c', '#5c6670']) + '</div><p>' + esc(t('listEmpty')) + '</p><a class="btn btn-ghost" href="#/catalogue" data-close>' + esc(t('listBrowse')) + '</a></div>';
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = state.list.map(function (it) {
      var p = byId(it.id);
      return '<div class="li">' +
        '<a class="li-pic" href="#/p/' + p.id + '" data-close>' + picture(p) + '</a>' +
        '<div class="li-info"><a href="#/p/' + p.id + '" data-close class="li-name">' + esc(tx(p.name)) + '</a>' +
        '<span class="mono">' + p.weight + ' KG · ' + esc(p.grade) + ' · ' + esc(p.origin) + '</span>' +
        '<div class="qty" role="group" aria-label="' + esc(t('qty')) + '"><button data-dec="' + p.id + '" aria-label="-">−</button><span>' + it.qty + '</span><button data-inc="' + p.id + '" aria-label="+">+</button></div></div>' +
        '<button class="iconbtn li-rm" data-rm="' + p.id + '" aria-label="' + esc(t('remove')) + '"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>' +
        '</div>';
    }).join('');
    var f = load('mms_form', {});
    foot.innerHTML =
      '<div class="field"><input id="fName" placeholder="' + esc(t('listName')) + '" value="' + esc(f.name || '') + '" autocomplete="name"></div>' +
      '<div class="field"><input id="fCity" placeholder="' + esc(t('listCity')) + '" value="' + esc(f.city || '') + '"></div>' +
      '<div class="foot-sum"><span>' + totalQty() + ' ' + esc(t('bales')) + '</span><span class="mono">' + esc(t('priceOnRequest')) + '</span></div>' +
      '<a class="btn btn-wa btn-block" id="sendList" target="_blank" rel="noopener"><svg viewBox="0 0 32 32"><use href="#wa-icon"/></svg>' + esc(t('listSend')) + '</a>' +
      '<button class="linkbtn" id="clearList">' + esc(t('listClear')) + '</button>';
    var send = $('#sendList');
    function upd() {
      var n = $('#fName').value.trim(), c = $('#fCity').value.trim();
      save('mms_form', { name: n, city: c });
      send.href = waList(n, c);
    }
    upd();
    $('#fName').addEventListener('input', upd);
    $('#fCity').addEventListener('input', upd);
    $('#clearList').addEventListener('click', function () { state.list = []; save('mms_list', []); renderList(); updateCounts(); refreshAddButtons(); });
  }

  function openList() {
    renderList();
    $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false');
    $('#scrim').hidden = false; requestAnimationFrame(function () { $('#scrim').classList.add('on'); });
    document.body.classList.add('locked');
  }
  function closeList() {
    $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true');
    $('#scrim').classList.remove('on'); setTimeout(function () { $('#scrim').hidden = true; }, 250);
    document.body.classList.remove('locked');
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2000);
  }

  /* ---------- components ---------- */
  function badge(p) {
    if (!p.badge) return '';
    var k = { hot: 'badgeHot', 'new': 'badgeNew', premium: 'badgePremium' }[p.badge];
    return '<span class="badge badge-' + p.badge + '">' + esc(t(k)) + '</span>';
  }
  function card(p, i) {
    return '<article class="card" data-reveal style="--d:' + ((i || 0) % 4) * 70 + 'ms">' +
      '<a class="card-pic" href="#/p/' + p.id + '" aria-label="' + esc(tx(p.name)) + '">' + picture(p) + badge(p) +
      '<span class="card-kg mono">' + p.weight + ' KG</span></a>' +
      '<div class="card-body">' +
      '<span class="card-cat mono">' + esc(catName(p.cat)) + ' · ' + esc(p.origin) + '</span>' +
      '<h3><a href="#/p/' + p.id + '">' + esc(tx(p.name)) + '</a></h3>' +
      '<div class="card-specs"><span>' + esc(t('grade')) + ' <b>' + esc(p.grade) + '</b></span><span>~<b>' + esc(p.pieces) + '</b> pcs</span></div>' +
      '<div class="card-price">' + esc(t('priceOnRequest')) + '</div>' +
      '<div class="card-actions">' +
      '<a class="btn btn-wa" href="' + waOne(p) + '" target="_blank" rel="noopener"><svg viewBox="0 0 32 32"><use href="#wa-icon"/></svg>' + esc(t('request')) + '</a>' +
      '<button class="btn btn-add" data-add="' + p.id + '"><svg viewBox="0 0 24 24" class="i-plus"><path d="M12 5v14M5 12h14"/></svg><svg viewBox="0 0 24 24" class="i-check"><path d="m5 12 5 5 9-10"/></svg><span class="lbl"></span></button>' +
      '</div></div></article>';
  }

  function sectionHead(title, sub, extra) {
    return '<div class="sec-head" data-reveal><div><h2>' + title + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (extra || '') + '</div>';
  }

  /* ---------- views ---------- */
  function viewHome() {
    var featured = PRODUCTS.filter(function (p) { return p.badge; }).concat(PRODUCTS.filter(function (p) { return !p.badge; })).slice(0, 8);
    var ticker = L().tickerItems.map(function (s) { return '<span>' + esc(s) + '</span><i>✦</i>'; }).join('');
    var catCards = CATS.filter(function (c) { return c.id !== 'all'; }).map(function (c, i) {
      var ps = PRODUCTS.filter(function (p) { return p.cat === c.id; });
      var p = ps.filter(function (x) { return x.photo; })[0] || ps[0];
      var art = !p ? window.MMSArt.miniBale('cat-' + c.id, 'clear', ['#3a4148', '#4b545c', '#5c6670'])
        : p.photo ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy" decoding="async">'
        : window.MMSArt.miniBale('cat-' + c.id, p.art.tarp, p.art.palette);
      return '<a class="cat" href="#/catalogue?cat=' + c.id + '" data-reveal style="--d:' + (i % 4) * 60 + 'ms">' +
        '<span class="cat-art' + (p && p.photo ? ' has-photo' : '') + '">' + art + '</span>' +
        '<span class="cat-name">' + esc(tx(c)) + '</span><span class="cat-n mono">' + ps.length + ' ' + esc(t('bales')) + ' →</span></a>';
    }).join('');

    return '' +
      '<section class="hero">' +
        '<div class="hero-grid-bg" aria-hidden="true"></div>' +
        '<div class="wrap hero-in">' +
          '<div class="hero-copy">' +
            '<span class="eyebrow mono"><span class="dot"></span>' + esc(t('heroEyebrow')) + '</span>' +
            '<h1>' + t('heroTitle') + '</h1>' +
            '<p class="lead">' + esc(t('heroSub')) + '</p>' +
            '<div class="hero-ctas">' +
              '<a class="btn btn-primary btn-lg" href="#/catalogue">' + esc(t('heroCta')) + '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
              '<a class="btn btn-wa btn-lg" href="' + wa(t('waSupport')) + '" target="_blank" rel="noopener"><svg viewBox="0 0 32 32"><use href="#wa-icon"/></svg>' + esc(t('heroCta2')) + '</a>' +
            '</div>' +
            '<dl class="stats">' +
              '<div><dt>' + esc(t('stat1')) + '</dt><dd>' + esc(t('stat1v')) + '</dd></div>' +
              '<div><dt>' + esc(t('stat2')) + '</dt><dd>' + esc(t('stat2v')) + '</dd></div>' +
              '<div><dt>' + esc(t('stat3')) + '</dt><dd>' + esc(t('stat3v')) + '</dd></div>' +
            '</dl>' +
          '</div>' +
          '<div class="hero-art' + (CFG.HERO_PHOTO ? ' has-photo' : '') + '">' +
            (CFG.HERO_PHOTO ? '<figure class="hero-photo"><img src="' + esc(CFG.HERO_PHOTO) + '" alt="" fetchpriority="high"></figure>' : window.MMSArt.heroSVG()) +
            '<div class="hero-tag mono"><b>ETS MM SAMB</b><span>TOUBA · DIANATOU</span><span>STOCK ' + PRODUCTS.length + ' TYPES</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<div class="ticker" aria-hidden="true"><div class="ticker-track">' + ticker + ticker + ticker + '</div></div>' +

      '<section class="sec wrap">' + sectionHead(esc(t('catTitle')), esc(t('catSub'))) +
        '<div class="cats">' + catCards + '</div></section>' +

      '<section class="sec wrap">' + sectionHead(esc(t('featTitle')), esc(t('featSub')), '<a class="btn btn-ghost" href="#/catalogue">' + esc(t('seeAll')) + ' →</a>') +
        '<div class="grid">' + featured.map(card).join('') + '</div></section>' +

      '<section class="sec sec-dark" id="how"><div class="wrap">' + sectionHead(esc(t('howTitle')), esc(t('howSub'))) +
        '<ol class="steps">' + [1, 2, 3].map(function (n) {
          return '<li data-reveal style="--d:' + (n - 1) * 100 + 'ms"><span class="step-n mono">0' + n + '</span><h3>' + esc(t('how' + n + 't')) + '</h3><p>' + esc(t('how' + n + 'd')) + '</p></li>';
        }).join('') + '</ol></div></section>' +

      '<section class="sec wrap">' + sectionHead(esc(t('whyTitle')), '') +
        '<div class="why">' + [
          ['M4 6h16M4 12h10M4 18h6', 1], ['M4 8l8-4 8 4v8l-8 4-8-4V8Zm0 0 8 4 8-4M12 12v8', 2],
          ['M4 17l5-5 4 4 7-8M15 8h5v5', 3], ['M5 5h14v10H9l-4 4V5Z', 4]
        ].map(function (w, i) {
          return '<div class="why-i" data-reveal style="--d:' + i * 70 + 'ms"><span class="why-ic"><svg viewBox="0 0 24 24"><path d="' + w[0] + '"/></svg></span><h3>' + esc(t('why' + w[1] + 't')) + '</h3><p>' + esc(t('why' + w[1] + 'd')) + '</p></div>';
        }).join('') + '</div></section>' +

      '<section class="sec wrap" id="contact"><div class="contact" data-reveal>' +
        '<div class="contact-copy"><h2>' + esc(t('contactTitle')) + '</h2><p>' + esc(t('contactSub')) + '</p>' +
          '<div class="contact-ctas"><a class="btn btn-wa btn-lg" href="' + wa(t('waSupport')) + '" target="_blank" rel="noopener"><svg viewBox="0 0 32 32"><use href="#wa-icon"/></svg>' + esc(t('chat')) + '</a>' +
          '<a class="btn btn-ghost-light btn-lg" href="tel:+221761669126">' + esc(t('call')) + '</a></div></div>' +
        '<dl class="contact-list">' +
          '<div><dt class="mono">' + esc(t('address')) + '</dt><dd>Touba Dianatou, Sénégal<br><a href="https://www.google.com/maps/search/?api=1&query=Touba+Dianatou+Senegal" target="_blank" rel="noopener">' + esc(t('directions')) + ' ↗</a></dd></div>' +
          '<div><dt class="mono">' + esc(t('phone')) + '</dt><dd><a href="tel:+221761669126">+221 76 166 91 26</a><br><a href="tel:+221785520550">+221 78 552 05 50</a></dd></div>' +
          '<div><dt class="mono">' + esc(t('hours')) + '</dt><dd>' + esc(t('hoursV')) + '</dd></div>' +
        '</dl></div></section>';
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (!q) return true;
      var hay = [p.name.fr, p.name.en, p.name.wo, p.origin, p.grade, catName(p.cat), p.weight + 'kg'].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    var order = { pop: function (a, b) { return (b.badge ? 1 : 0) - (a.badge ? 1 : 0); },
      light: function (a, b) { return a.weight - b.weight; }, heavy: function (a, b) { return b.weight - a.weight; },
      name: function (a, b) { return tx(a.name).localeCompare(tx(b.name)); } }[state.sort];
    return list.slice().sort(order);
  }

  function viewCatalog() {
    return '<section class="page-head"><div class="wrap">' +
        '<span class="eyebrow mono"><span class="dot"></span>ETS MM SAMB · STOCK</span>' +
        '<h1>' + esc(t('catalogTitle')) + '</h1><p>' + esc(t('catalogSub')) + '</p></div></section>' +
      '<section class="wrap catalog">' +
        '<div class="toolbar">' +
          '<label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" placeholder="' + esc(t('search')) + '" value="' + esc(state.q) + '"></label>' +
          '<label class="sort"><span class="mono">' + esc(t('sortLabel')) + '</span><select id="sort">' +
            ['pop', 'light', 'heavy', 'name'].map(function (s) {
              var k = { pop: 'sortPop', light: 'sortLight', heavy: 'sortHeavy', name: 'sortName' }[s];
              return '<option value="' + s + '"' + (state.sort === s ? ' selected' : '') + '>' + esc(t(k)) + '</option>';
            }).join('') + '</select></label>' +
        '</div>' +
        '<div class="chips" role="tablist">' + CATS.map(function (c) {
          return '<button class="chip' + (state.cat === c.id ? ' on' : '') + '" data-cat="' + c.id + '" role="tab" aria-selected="' + (state.cat === c.id) + '">' + esc(tx(c)) + '</button>';
        }).join('') + '</div>' +
        '<p class="count-line mono" id="countLine"></p>' +
        '<div class="grid" id="grid"></div>' +
      '</section>';
  }
  function fillGrid() {
    var items = filtered();
    $('#countLine').textContent = L().results(items.length);
    $('#grid').innerHTML = items.length ? items.map(card).join('') : '<p class="noresults">' + esc(t('noResults')) + '</p>';
    refreshAddButtons(); reveal();
  }

  function viewProduct(p) {
    var related = PRODUCTS.filter(function (x) { return x.id !== p.id && (x.cat === p.cat || x.origin === p.origin); }).slice(0, 4);
    if (related.length < 4) related = related.concat(PRODUCTS.filter(function (x) { return x.id !== p.id && related.indexOf(x) === -1; }).slice(0, 4 - related.length));
    return '<section class="wrap pdp">' +
        '<a class="back" href="#/catalogue"><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' + esc(t('back')) + '</a>' +
        '<div class="pdp-grid">' +
          '<div class="pdp-pic" data-reveal>' + picture(p) + badge(p) + '<span class="pdp-ref mono">REF · MMS-' + ('00' + (PRODUCTS.indexOf(p) + 1)).slice(-3) + '</span><span class="demo mono">' + esc(t('demoNote')) + '</span></div>' +
          '<div class="pdp-info" data-reveal style="--d:80ms">' +
            '<span class="card-cat mono">' + esc(catName(p.cat)) + ' · ' + esc(p.origin) + '</span>' +
            '<h1>' + esc(tx(p.name)) + '</h1>' +
            '<p class="pdp-desc">' + esc(tx(p.desc)) + '</p>' +
            '<dl class="specs">' +
              '<div><dt>' + esc(t('weight')) + '</dt><dd>' + p.weight + ' kg</dd></div>' +
              '<div><dt>' + esc(t('pieces')) + '</dt><dd>' + esc(p.pieces) + '</dd></div>' +
              '<div><dt>' + esc(t('grade')) + '</dt><dd>' + esc(p.grade) + '</dd></div>' +
              '<div><dt>' + esc(t('origin')) + '</dt><dd>' + esc(p.origin) + '</dd></div>' +
            '</dl>' +
            '<div class="pdp-price"><span class="mono">' + esc(t('priceOnRequest')) + '</span></div>' +
            '<div class="pdp-actions">' +
              '<a class="btn btn-wa btn-lg btn-block" href="' + waOne(p) + '" target="_blank" rel="noopener"><svg viewBox="0 0 32 32"><use href="#wa-icon"/></svg>' + esc(t('requestWa')) + '</a>' +
              '<button class="btn btn-add btn-lg" data-add="' + p.id + '" data-long><svg viewBox="0 0 24 24" class="i-plus"><path d="M12 5v14M5 12h14"/></svg><svg viewBox="0 0 24 24" class="i-check"><path d="m5 12 5 5 9-10"/></svg><span class="lbl"></span></button>' +
              '<button class="btn btn-ghost btn-lg" id="share"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/></svg>' + esc(t('share')) + '</button>' +
            '</div>' +
            '<p class="pdp-note"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/></svg>' + esc(t('reqNote')) + '</p>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="sec wrap">' + sectionHead(esc(t('related')), '') + '<div class="grid">' + related.map(card).join('') + '</div></section>';
  }

  /* ---------- router ---------- */
  function parse() {
    var h = location.hash.replace(/^#/, '') || '/';
    var anchor = null, m = h.match(/^\/#(.+)$/);
    if (m) { anchor = m[1]; h = '/'; }
    var parts = h.split('?'), path = parts[0], qs = {};
    (parts[1] || '').split('&').forEach(function (kv) { if (kv) { var a = kv.split('='); qs[a[0]] = decodeURIComponent(a[1] || ''); } });
    return { path: path, qs: qs, anchor: anchor };
  }

  var lastPath = null;
  function render() {
    var r = parse(), app = $('#app'), route = 'home', html;
    var pm = r.path.match(/^\/p\/([\w-]+)/);
    if (pm && byId(pm[1])) {
      route = 'product'; html = viewProduct(byId(pm[1]));
      document.title = tx(byId(pm[1]).name) + ' — ETS MM SAMB';
    } else if (r.path === '/catalogue') {
      route = 'catalogue';
      if (r.qs.cat && CATS.some(function (c) { return c.id === r.qs.cat; })) state.cat = r.qs.cat;
      html = viewCatalog();
      document.title = t('catalogTitle') + ' — ETS MM SAMB';
    } else {
      html = viewHome();
      document.title = 'ETS MM SAMB — ' + t('heroEyebrow');
    }
    app.classList.remove('enter'); void app.offsetWidth;
    app.innerHTML = html; app.classList.add('enter');
    app.setAttribute('data-route', route);

    if (route === 'catalogue') bindCatalog();
    if (route === 'product') bindProduct();
    refreshAddButtons();
    $$('[data-route]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-route') === route); });
    reveal();

    var key = r.path + (r.anchor || '');
    if (r.anchor) {
      var target = document.getElementById(r.anchor);
      if (target) setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    } else if (key !== lastPath) {
      window.scrollTo(0, 0);
    }
    lastPath = key;
  }

  function bindCatalog() {
    fillGrid();
    var q = $('#q'), timer;
    q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { state.q = q.value; fillGrid(); }, 120); });
    $('#sort').addEventListener('change', function (e) { state.sort = e.target.value; fillGrid(); });
    $$('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        state.cat = c.getAttribute('data-cat');
        $$('.chip').forEach(function (x) { var on = x === c; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
        history.replaceState(null, '', '#/catalogue' + (state.cat !== 'all' ? '?cat=' + state.cat : ''));
        fillGrid();
      });
    });
  }

  function bindProduct() {
    var s = $('#share');
    s.addEventListener('click', function () {
      var url = location.href;
      if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast(t('copied')); }, function () {});
    });
  }

  /* ---------- scroll reveal ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }) : null;
  function reveal() {
    $$('[data-reveal]:not(.in)').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });
  }

  /* ---------- language ---------- */
  function applyStatic() {
    document.documentElement.lang = state.lang;
    $$('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    $$('[data-setlang]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-setlang') === state.lang); b.setAttribute('aria-pressed', b.getAttribute('data-setlang') === state.lang); });
    $('#waLine1').href = wa(t('waSupport'), WA_MAIN);
    $('#waLine2').href = wa(t('waSupport'), WA_ALT);
  }
  function setLang(l) {
    state.lang = l; save('mms_lang', l);
    applyStatic(); render(); updateCounts();
    if ($('#drawer').classList.contains('open')) renderList();
  }

  function splash() {
    var el = $('#splash');
    document.body.classList.add('locked', 'has-splash');
    // falling bales
    var rain = $('#splashRain'), tarps = ['orange', 'yellow', 'clear', 'green', 'clear'];
    for (var i = 0; i < 9; i++) {
      var p = PRODUCTS[i % PRODUCTS.length], d = document.createElement('div');
      d.className = 'rain-bale';
      d.style.left = (i * 11.5 - 4) + '%';
      d.style.animationDelay = (i * 0.9 % 6) + 's';
      d.style.animationDuration = (9 + (i % 4) * 2) + 's';
      d.style.setProperty('--s', (0.6 + (i % 3) * 0.25).toFixed(2));
      d.innerHTML = window.MMSArt.miniBale('rain' + i, tarps[i % tarps.length], p.art.palette);
      rain.appendChild(d);
    }
    // cycling greeting
    var words = [I18N.fr.splashHello, I18N.wo.splashHello, I18N.en.splashHello, 'Asalaa maalekum'], w = 0, word = $('#splashWord');
    var cyc = setInterval(function () {
      w = (w + 1) % words.length;
      word.classList.add('out');
      setTimeout(function () { word.textContent = words[w]; word.classList.remove('out'); }, 320);
    }, 2200);
    $$('.lang-btn', el).forEach(function (b) {
      b.addEventListener('click', function () {
        clearInterval(cyc);
        b.classList.add('picked');
        setLang(b.getAttribute('data-lang'));
        setTimeout(function () {
          el.classList.add('leave');
          document.body.classList.remove('locked', 'has-splash');
          window.scrollTo(0, 0);
          setTimeout(function () { el.remove(); }, 800);
        }, 380);
      });
    });
    setTimeout(function () { var first = $('.lang-btn', el); if (first) first.focus({ preventScroll: true }); }, 900);
  }

  /* ---------- global events ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]');
    if (a) { e.preventDefault(); if (inList(a.getAttribute('data-add'))) openList(); else addToList(a.getAttribute('data-add')); return; }
    var inc = e.target.closest('[data-inc]'); if (inc) { var id = inc.getAttribute('data-inc'); setQty(id, state.list.filter(function (x) { return x.id === id; })[0].qty + 1); return; }
    var dec = e.target.closest('[data-dec]'); if (dec) { var id2 = dec.getAttribute('data-dec'); setQty(id2, state.list.filter(function (x) { return x.id === id2; })[0].qty - 1); return; }
    var rm = e.target.closest('[data-rm]'); if (rm) { removeFromList(rm.getAttribute('data-rm')); return; }
    if (e.target.closest('[data-close]')) closeList();
    var sl = e.target.closest('[data-setlang]'); if (sl) setLang(sl.getAttribute('data-setlang'));
    var pop = $('#waPop');
    if (!pop.hidden && !e.target.closest('#waPop') && !e.target.closest('#waFab')) toggleWa(false);
  });
  $('#openList').addEventListener('click', openList);
  $('#openList2').addEventListener('click', openList);
  $('#closeList').addEventListener('click', closeList);
  $('#scrim').addEventListener('click', closeList);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeList(); toggleWa(false); } });

  function toggleWa(on) {
    var pop = $('#waPop');
    if (on === undefined) on = pop.hidden;
    if (on) { pop.hidden = false; requestAnimationFrame(function () { pop.classList.add('on'); }); }
    else { pop.classList.remove('on'); setTimeout(function () { pop.hidden = true; }, 220); }
    $('#waFab').classList.toggle('open', on);
  }
  $('#waFab').addEventListener('click', function () { toggleWa(); });
  $('#waClose').addEventListener('click', function () { toggleWa(false); });

  window.addEventListener('scroll', function () {
    $('#topbar').classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  window.addEventListener('hashchange', render);
  $('#year').textContent = new Date().getFullYear();

  /* ---------- live catalogue from the database ---------- */
  function fromRow(r) {
    return {
      id: r.id, cat: r.cat, weight: r.weight, pieces: r.pieces, grade: r.grade, origin: r.origin,
      badge: r.badge || null, photo: r.photo_url || null,
      name: { fr: r.name_fr, en: r.name_en || r.name_fr, wo: r.name_wo || r.name_fr },
      desc: { fr: r.desc_fr, en: r.desc_en || r.desc_fr, wo: r.desc_wo || r.desc_fr },
      art: { tarp: r.tarp || 'clear', palette: r.palette && r.palette.length ? r.palette : ['#e94f64', '#f6c445', '#5aa9e6', '#ffffff'] }
    };
  }
  function useProducts(list) {
    if (!list || !list.length) return;
    PRODUCTS = window.MMS_PRODUCTS = list;
    svgCache = {};
    state.list = state.list.filter(function (it) { return byId(it.id); });
    save('mms_list', state.list);
    render(); updateCounts();
    if ($('#drawer').classList.contains('open')) renderList();
  }
  function loadLive() {
    if (!CFG.SUPABASE_URL || !window.fetch) return;
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    fetch(CFG.SUPABASE_URL + '/rest/v1/products?select=*&order=sort.asc,id.asc', {
      headers: { apikey: CFG.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + CFG.SUPABASE_ANON_KEY },
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (rows) {
      var list = rows.map(fromRow);
      save('mms_products', list);
      if (JSON.stringify(list) !== JSON.stringify(PRODUCTS)) useProducts(list);
    }).catch(function (e) {
      if (window.console) console.warn('ETS MM SAMB: using saved catalogue, database unavailable:', e.message);
    }).then(function () { clearTimeout(timer); });
  }
  // Last catalogue seen on this device shows instantly; the database refreshes it.
  var cached = load('mms_products', null);
  if (cached && cached.length) { PRODUCTS = window.MMS_PRODUCTS = cached; }

  var hadLang = !!state.lang;
  if (!hadLang) state.lang = 'fr';
  applyStatic(); render(); updateCounts();
  if (hadLang) $('#splash').remove(); else splash();
  loadLive();
})();
