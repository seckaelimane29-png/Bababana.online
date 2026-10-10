/* ETS MM SAMB — generated demo pictures.
   Draws warehouse-style clothing bales as SVG: folded garments pressed under
   clear plastic or a woven PP tarp, green straps and a marker-written label.
   Everything is seeded from the product id, so each bale always looks the same. */
(function () {
  var TARPS = {
    orange: { base: '#e2662a', light: '#f39a5a', dark: '#a8431a' },
    yellow: { base: '#e3c23a', light: '#f3dc72', dark: '#a8891d' },
    green:  { base: '#2f9a55', light: '#58c27c', dark: '#1d6a39' }
  };
  var uidCounter = 0;

  function rng(seedStr) {
    var h = 2166136261;
    for (var i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function f(n) { return Math.round(n * 10) / 10; }

  /* Pillow outline of a pressed bale */
  function pillow(x, y, w, h, b) {
    var x2 = x + w, y2 = y + h, cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.16;
    return 'M' + f(x + r) + ' ' + f(y) +
      ' Q' + f(cx) + ' ' + f(y - b) + ' ' + f(x2 - r) + ' ' + f(y) +
      ' Q' + f(x2 + 2) + ' ' + f(y - 2) + ' ' + f(x2) + ' ' + f(y + r) +
      ' Q' + f(x2 + b) + ' ' + f(cy) + ' ' + f(x2) + ' ' + f(y2 - r) +
      ' Q' + f(x2 + 2) + ' ' + f(y2 + 2) + ' ' + f(x2 - r) + ' ' + f(y2) +
      ' Q' + f(cx) + ' ' + f(y2 + b) + ' ' + f(x + r) + ' ' + f(y2) +
      ' Q' + f(x - 2) + ' ' + f(y2 + 2) + ' ' + f(x) + ' ' + f(y2 - r) +
      ' Q' + f(x - b) + ' ' + f(cy) + ' ' + f(x) + ' ' + f(y + r) +
      ' Q' + f(x - 2) + ' ' + f(y - 2) + ' ' + f(x + r) + ' ' + f(y) + 'Z';
  }

  /* Rows of folded garments, seen edge-on as in a pressed bale */
  function garments(x, y, w, h, palette, r, uid) {
    var out = '', rows = Math.max(3, Math.round(h / 38)), rh = h / rows;
    for (var i = 0; i < rows; i++) {
      var gx = x - 10 - r() * 20;
      while (gx < x + w + 10) {
        var gw = 40 + r() * 70, col = pick(r, palette);
        var gy = y + i * rh + (r() - 0.5) * 6, gh = rh + 4 + r() * 6;
        var rot = (r() - 0.5) * 6;
        out += '<g transform="rotate(' + f(rot) + ' ' + f(gx + gw / 2) + ' ' + f(gy + gh / 2) + ')">';
        out += '<rect x="' + f(gx) + '" y="' + f(gy) + '" width="' + f(gw) + '" height="' + f(gh) + '" rx="' + f(gh * 0.45) + '" fill="' + col + '"/>';
        var t = r();
        if (t < 0.18) out += '<rect x="' + f(gx) + '" y="' + f(gy) + '" width="' + f(gw) + '" height="' + f(gh) + '" rx="' + f(gh * 0.45) + '" fill="url(#' + uid + 'st)" opacity=".55"/>';
        else if (t < 0.32) out += '<rect x="' + f(gx) + '" y="' + f(gy) + '" width="' + f(gw) + '" height="' + f(gh) + '" rx="' + f(gh * 0.45) + '" fill="url(#' + uid + 'dt)" opacity=".6"/>';
        else if (t < 0.42) out += '<rect x="' + f(gx) + '" y="' + f(gy) + '" width="' + f(gw) + '" height="' + f(gh) + '" rx="' + f(gh * 0.45) + '" fill="url(#' + uid + 'ck)" opacity=".5"/>';
        // fold lines
        out += '<path d="M' + f(gx + 6) + ' ' + f(gy + gh * 0.5) + ' Q' + f(gx + gw / 2) + ' ' + f(gy + gh * (0.35 + r() * 0.3)) + ' ' + f(gx + gw - 6) + ' ' + f(gy + gh * 0.5) + '" stroke="#000" stroke-opacity=".22" stroke-width="1.6" fill="none"/>';
        out += '<path d="M' + f(gx + 8) + ' ' + f(gy + 3) + ' Q' + f(gx + gw / 2) + ' ' + f(gy) + ' ' + f(gx + gw - 8) + ' ' + f(gy + 3) + '" stroke="#fff" stroke-opacity=".28" stroke-width="2" fill="none"/>';
        out += '</g>';
        gx += gw - 6 - r() * 8;
      }
    }
    return out;
  }

  function wrinkles(x, y, w, h, r, color, op) {
    var out = '';
    for (var i = 0; i < 9; i++) {
      var sx = x + r() * w, sy = y + r() * h, len = 20 + r() * 50, a = (r() - 0.5) * 1.4;
      var ex = sx + Math.cos(a) * len, ey = sy + Math.sin(a) * len;
      out += '<path d="M' + f(sx) + ' ' + f(sy) + ' Q' + f((sx + ex) / 2 + (r() - .5) * 18) + ' ' + f((sy + ey) / 2 + (r() - .5) * 18) + ' ' + f(ex) + ' ' + f(ey) + '" stroke="' + color + '" stroke-opacity="' + op + '" stroke-width="' + f(1 + r() * 2) + '" fill="none" stroke-linecap="round"/>';
    }
    return out;
  }

  function defs(uid) {
    return '<pattern id="' + uid + 'st" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><rect width="4" height="8" fill="#fff"/></pattern>' +
      '<pattern id="' + uid + 'dt" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="2" fill="#fff"/></pattern>' +
      '<pattern id="' + uid + 'ck" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="7" height="14" fill="#000" opacity=".35"/><rect width="14" height="7" fill="#000" opacity=".25"/></pattern>' +
      '<pattern id="' + uid + 'wv" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 2H4" stroke="#000" stroke-opacity=".10" stroke-width=".8"/><path d="M0 0V4M2 0V4" stroke="#fff" stroke-opacity=".08" stroke-width=".8"/></pattern>' +
      '<radialGradient id="' + uid + 'sh" cx="50%" cy="42%" r="62%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".5"/></radialGradient>' +
      '<linearGradient id="' + uid + 'gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity=".06"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>';
  }

  /* One bale. opts: tarp ('clear'|'orange'|'yellow'|'green'), palette, label, sub */
  function bale(x, y, w, h, opts, r, uid, idx) {
    var cid = uid + 'c' + idx, b = Math.min(w, h) * 0.09;
    var path = pillow(x, y, w, h, b);
    var out = '<clipPath id="' + cid + '"><path d="' + path + '"/></clipPath>';
    out += '<ellipse cx="' + f(x + w / 2) + '" cy="' + f(y + h + b * 0.4) + '" rx="' + f(w * 0.52) + '" ry="' + f(h * 0.06) + '" fill="#000" opacity=".45"/>';
    out += '<g clip-path="url(#' + cid + ')">';
    out += '<rect x="' + f(x - 20) + '" y="' + f(y - 20) + '" width="' + f(w + 40) + '" height="' + f(h + 40) + '" fill="#2a2a2a"/>';
    out += garments(x - b, y - b, w + 2 * b, h + 2 * b, opts.palette, r, uid);
    var tarp = TARPS[opts.tarp];
    if (tarp) {
      // woven tarp covers most of the bale, leaving a band of clothes visible
      var top = y + h * (0.22 + r() * 0.1);
      var edge = 'M' + f(x - 30) + ' ' + f(top + 8);
      for (var i = 0; i <= 8; i++) edge += ' L' + f(x - 30 + (w + 60) * i / 8) + ' ' + f(top + (r() - 0.5) * 16);
      edge += ' L' + f(x + w + 30) + ' ' + f(y + h + 30) + ' L' + f(x - 30) + ' ' + f(y + h + 30) + 'Z';
      out += '<path d="' + edge + '" fill="' + tarp.base + '"/>';
      out += '<path d="' + edge + '" fill="url(#' + uid + 'wv)"/>';
      out += wrinkles(x, top, w, h * 0.7, r, tarp.light, .55) + wrinkles(x, top, w, h * 0.7, r, tarp.dark, .5);
    }
    out += '<rect x="' + f(x - 20) + '" y="' + f(y - 20) + '" width="' + f(w + 40) + '" height="' + f(h + 40) + '" fill="#dfe8ee" opacity=".14"/>';
    out += wrinkles(x, y, w, h, r, '#fff', .35);
    out += '<rect x="' + f(x - 20) + '" y="' + f(y - 20) + '" width="' + f(w + 40) + '" height="' + f(h + 40) + '" fill="url(#' + uid + 'gl)"/>';
    out += '<rect x="' + f(x - 20) + '" y="' + f(y - 20) + '" width="' + f(w + 40) + '" height="' + f(h + 40) + '" fill="url(#' + uid + 'sh)"/>';
    // straps
    var sc = '#2c8a3c', sl = '#5fc46d', sw = Math.max(2.5, w * 0.022);
    [0.27, 0.5, 0.73].forEach(function (p) {
      var sx = x + w * p, bow = (p - 0.5) * b * 1.4;
      var d = 'M' + f(sx) + ' ' + f(y - b) + ' Q' + f(sx + bow) + ' ' + f(y + h / 2) + ' ' + f(sx) + ' ' + f(y + h + b);
      out += '<path d="' + d + '" stroke="' + sc + '" stroke-width="' + f(sw) + '" fill="none"/><path d="' + d + '" stroke="' + sl + '" stroke-width="' + f(sw * 0.3) + '" fill="none" opacity=".8"/>';
    });
    [0.36, 0.7].forEach(function (p) {
      var sy = y + h * p;
      var d = 'M' + f(x - b) + ' ' + f(sy) + ' Q' + f(x + w / 2) + ' ' + f(sy + (p - 0.5) * b * 1.2) + ' ' + f(x + w + b) + ' ' + f(sy);
      out += '<path d="' + d + '" stroke="' + sc + '" stroke-width="' + f(sw) + '" fill="none"/><path d="' + d + '" stroke="' + sl + '" stroke-width="' + f(sw * 0.3) + '" fill="none" opacity=".8"/>';
    });
    out += '</g>';
    out += '<path d="' + path + '" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1.5"/>';
    if (opts.label) {
      var lw = w * 0.34, lh = h * 0.2, lx = x + w * 0.56, ly = y + h * 0.74;
      out += '<g transform="rotate(-5 ' + f(lx + lw / 2) + ' ' + f(ly + lh / 2) + ')">';
      out += '<rect x="' + f(lx) + '" y="' + f(ly) + '" width="' + f(lw) + '" height="' + f(lh) + '" rx="3" fill="#f7f3e8" stroke="#000" stroke-opacity=".2"/>';
      out += '<text x="' + f(lx + lw / 2) + '" y="' + f(ly + lh * 0.55) + '" text-anchor="middle" font-family="Permanent Marker, \'Comic Sans MS\', cursive" font-size="' + f(lh * 0.46) + '" fill="#1b2a7a">' + opts.label + '</text>';
      if (opts.sub) out += '<text x="' + f(lx + lw / 2) + '" y="' + f(ly + lh * 0.88) + '" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="' + f(lh * 0.2) + '" fill="#333">' + opts.sub + '</text>';
      out += '</g>';
    }
    return out;
  }

  function warehouseBg(W, H, floorY, uid) {
    var out = '<linearGradient id="' + uid + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5258"/><stop offset="1" stop-color="#2b3035"/></linearGradient>';
    out += '<rect width="' + W + '" height="' + H + '" fill="url(#' + uid + 'bg)"/>';
    for (var i = 0; i < W; i += 14) out += '<rect x="' + i + '" y="0" width="5" height="' + floorY + '" fill="#fff" opacity=".035"/>';
    out += '<rect x="0" y="0" width="' + W + '" height="' + f(H * 0.08) + '" fill="#cfd6db" opacity=".12"/>';
    out += '<rect x="0" y="' + floorY + '" width="' + W + '" height="' + (H - floorY) + '" fill="#1d2125"/>';
    out += '<rect x="0" y="' + floorY + '" width="' + W + '" height="3" fill="#f2b705" opacity=".55"/>';
    return out;
  }

  /* Product picture: a hero bale in front of a stack */
  function productSVG(p) {
    var uid = 'b' + (uidCounter++) + '_', r = rng(p.id), a = p.art;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true"><defs>' + defs(uid) + '</defs>';
    s += warehouseBg(400, 400, 330, uid);
    var backTarps = ['orange', 'yellow', 'clear', 'green'];
    s += '<g opacity=".7">' + bale(-60, 40, 170, 120, { tarp: pick(r, backTarps), palette: a.palette }, r, uid, 1) + '</g>';
    s += '<g opacity=".7">' + bale(290, 30, 170, 125, { tarp: pick(r, backTarps), palette: a.palette }, r, uid, 2) + '</g>';
    s += '<rect width="400" height="400" fill="#1a1e22" opacity=".25"/>';
    s += bale(62, 112, 276, 200, { tarp: a.tarp, palette: a.palette, label: p.weight + 'KG', sub: 'MMS·' + p.grade + '·' + p.origin.toUpperCase().slice(0, 3) }, r, uid, 3);
    return s + '</svg>';
  }

  /* Hero: a wall of stacked bales (each one animates in via CSS) */
  function heroSVG() {
    var uid = 'h' + (uidCounter++) + '_', r = rng('ets-mm-samb-hero');
    var W = 640, H = 560, floorY = 520;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Balles de friperie"><defs>' + defs(uid) + '</defs>';
    var palettes = window.MMS_PRODUCTS.map(function (p) { return p.art.palette; });
    var tarps = ['orange', 'clear', 'yellow', 'clear', 'green', 'orange', 'clear'];
    var cols = [[30, 4], [215, 4], [400, 3]], bw = 190, bh = 118, idx = 0;
    cols.forEach(function (c, ci) {
      for (var j = 0; j < c[1]; j++) {
        var x = c[0] + (r() - 0.5) * 10, y = floorY - (j + 1) * (bh - 4) - (ci === 2 ? 0 : 0);
        s += '<g class="drop" style="animation-delay:' + f((ci * c[1] + j) * 0.09 + j * 0.12) + 's">' +
          bale(x, y, bw, bh - 10, { tarp: pick(r, tarps), palette: pick(r, palettes), label: idx % 3 === 0 ? pick(r, ['45KG', '55KG', '100KG']) : '' }, r, uid, idx++) + '</g>';
      }
    });
    s += '<ellipse cx="' + W / 2 + '" cy="' + (floorY + 6) + '" rx="' + (W * 0.48) + '" ry="12" fill="#000" opacity=".35"/>';
    return s + '</svg>';
  }

  /* Small single bale for the language splash and logo areas */
  function miniBale(seed, tarp, palette) {
    var uid = 'm' + (uidCounter++) + '_', r = rng(seed);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 220 160" aria-hidden="true"><defs>' + defs(uid) + '</defs>' +
      bale(0, 0, 200, 130, { tarp: tarp, palette: palette }, r, uid, 0) + '</svg>';
  }

  window.MMSArt = { productSVG: productSVG, heroSVG: heroSVG, miniBale: miniBale };
})();
