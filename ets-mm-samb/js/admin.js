/* ETS MM SAMB — admin page: sign in, then add / edit / hide / delete bales and
   their photos. Security is enforced by the database (only e-mails listed in
   public.admins can write); this page only decides what to show. */
(function () {
  'use strict';

  var CFG = window.MMS_CONFIG;
  var CATS = window.MMS_CATEGORIES.filter(function (c) { return c.id !== 'all'; });
  var db = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function catName(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].fr; return id; }

  var state = {
    products: [], q: '', cat: 'all', authMode: 'login',
    editing: null,                      // row being edited, or null for a new bale
    photo: { blob: null, preview: null, removed: false }
  };

  /* ---------- screens & messages ---------- */
  function show(id) { $$('.a-screen').forEach(function (s) { s.hidden = s.id !== id; }); $('#logout').hidden = id !== 'appScreen'; }
  function msg(el, text, ok) { el.hidden = !text; el.textContent = text || ''; el.classList.toggle('ok', !!ok); }
  var toastTimer;
  function toast(text) {
    var el = $('#toast'); el.textContent = text; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------- auth ---------- */
  async function route() {
    var res = await db.auth.getSession();
    var session = res.data.session;
    if (!session) return show('authScreen');
    var check = await db.rpc('is_admin');
    if (check.error) { show('authScreen'); return msg($('#authMsg'), 'Impossible de vérifier votre accès. Vérifiez votre connexion et réessayez.'); }
    if (!check.data) { $('#deniedEmail').textContent = session.user.email; return show('deniedScreen'); }
    show('appScreen');
    loadProducts();
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    $$('.seg-btn').forEach(function (b) { var on = b.getAttribute('data-mode') === mode; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    $('#authSubmit').textContent = mode === 'login' ? 'Se connecter' : 'Créer le compte';
    $('#pwHint').hidden = mode === 'login';
    $('#authForm').password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    msg($('#authMsg'), '');
  }

  async function submitAuth(e) {
    e.preventDefault();
    var f = e.target, email = f.email.value.trim().toLowerCase(), password = f.password.value, m = $('#authMsg');
    if (!/^\S+@\S+\.\S+$/.test(email)) return msg(m, 'Entrez une adresse e-mail valide.');
    if (password.length < 8) return msg(m, 'Le mot de passe doit faire au moins 8 caractères.');
    var btn = $('#authSubmit'); btn.disabled = true; msg(m, '');
    try {
      if (state.authMode === 'login') {
        var r = await db.auth.signInWithPassword({ email: email, password: password });
        if (r.error) return msg(m, /confirm/i.test(r.error.message)
          ? 'Confirmez d’abord votre e-mail : ouvrez le lien reçu, puis reconnectez-vous ici.'
          : 'E-mail ou mot de passe incorrect.');
        f.password.value = '';
        await route();
      } else {
        var s = await db.auth.signUp({ email: email, password: password, options: { emailRedirectTo: location.href.split('#')[0] } });
        if (s.error) return msg(m, s.error.message);
        if (s.data.session) return route();
        setAuthMode('login');
        msg(m, 'Compte créé. Un lien de confirmation a été envoyé à ' + email + '. Ouvrez-le, puis revenez ici pour vous connecter.', true);
      }
    } catch (err) {
      msg(m, 'Pas de connexion. Vérifiez internet et réessayez.');
    } finally { btn.disabled = false; }
  }

  async function forgot() {
    var email = $('#authForm').email.value.trim().toLowerCase(), m = $('#authMsg');
    if (!/^\S+@\S+\.\S+$/.test(email)) return msg(m, 'Tapez d’abord votre e-mail ci-dessus, puis « Mot de passe oublié ? ».');
    var r = await db.auth.resetPasswordForEmail(email, { redirectTo: location.href.split('#')[0] });
    msg(m, r.error ? r.error.message : 'Si ' + email + ' a un compte, un lien de réinitialisation arrive.', !r.error);
  }

  async function logout() { await db.auth.signOut(); show('authScreen'); }

  /* ---------- product list ---------- */
  async function loadProducts() {
    $('#list').innerHTML = '<div class="a-center a-pad"><div class="a-spinner"></div></div>';
    var r = await db.from('products').select('*').order('sort', { ascending: true }).order('id');
    if (r.error) { $('#list').innerHTML = '<p class="a-msg">Erreur de chargement : ' + esc(r.error.message) + '</p>'; return; }
    state.products = r.data;
    renderList();
  }

  function thumb(p) {
    if (p.photo_url) return '<img src="' + esc(p.photo_url) + '" alt="" loading="lazy">';
    return window.MMSArt.productSVG({ id: p.id, weight: p.weight, grade: p.grade, origin: p.origin || '', art: { tarp: p.tarp, palette: p.palette } });
  }

  function renderList() {
    var all = state.products;
    $('#stats').textContent = all.length + ' balles · ' + all.filter(function (p) { return p.visible; }).length + ' visibles · ' +
      all.filter(function (p) { return p.photo_url; }).length + ' avec photo';
    var q = state.q.trim().toLowerCase();
    var items = all.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      return !q || (p.name_fr + ' ' + p.name_en + ' ' + p.origin + ' ' + p.grade).toLowerCase().indexOf(q) !== -1;
    });
    if (!items.length) {
      $('#list').innerHTML = '<div class="a-empty"><p>' + (all.length ? 'Aucune balle ne correspond.' : 'Aucune balle pour l’instant.') + '</p><button class="btn btn-primary" data-new>Ajouter une balle</button></div>';
      return;
    }
    $('#list').innerHTML = items.map(function (p) {
      return '<div class="a-row' + (p.visible ? '' : ' is-hidden') + '">' +
        '<button class="a-thumb" data-edit="' + esc(p.id) + '" aria-label="Modifier">' + thumb(p) + '</button>' +
        '<button class="a-info" data-edit="' + esc(p.id) + '">' +
          '<b>' + esc(p.name_fr) + '</b>' +
          '<span class="mono">' + esc(catName(p.cat)) + ' · ' + p.weight + ' kg · ' + esc(p.grade) + (p.origin ? ' · ' + esc(p.origin) : '') + '</span>' +
          (p.photo_url ? '' : '<span class="a-tag">Sans photo</span>') +
        '</button>' +
        '<label class="a-switch" title="Visible sur le site"><input type="checkbox" data-vis="' + esc(p.id) + '"' + (p.visible ? ' checked' : '') + '><span></span></label>' +
        '<button class="iconbtn" data-edit="' + esc(p.id) + '" aria-label="Modifier"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/></svg></button>' +
        '</div>';
    }).join('');
  }

  async function toggleVisible(id, on) {
    var r = await db.from('products').update({ visible: on }).eq('id', id);
    if (r.error) { toast('Erreur : ' + r.error.message); return loadProducts(); }
    state.products.forEach(function (p) { if (p.id === id) p.visible = on; });
    renderList();
    toast(on ? 'Visible sur le site' : 'Masquée du site');
  }

  /* ---------- editor ---------- */
  function setPhotoPreview(src) {
    $('#photoBox').innerHTML = src ? '<img src="' + esc(src) + '" alt="">' : '<div class="a-photo-empty"><svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg><span>Pas de photo</span></div>';
    $('#photoLabel').textContent = src ? 'Changer la photo' : 'Ajouter une photo';
    $('#photoRemove').hidden = !src;
  }

  function openEditor(p) {
    var f = $('#editor');
    state.editing = p || null;
    state.photo = { blob: null, preview: null, removed: false };
    f.reset();
    $('#edTitle').textContent = p ? 'Modifier la balle' : 'Nouvelle balle';
    $('#delBtn').hidden = !p;
    var v = p || { cat: 'mixte', weight: 45, grade: 'A', origin: '', badge: '', visible: true, tarp: 'clear',
      sort: (state.products.reduce(function (m, x) { return Math.max(m, x.sort || 0); }, 0) + 10) };
    ['name_fr', 'name_en', 'name_wo', 'desc_fr', 'desc_en', 'desc_wo', 'pieces', 'grade', 'origin'].forEach(function (k) { f[k].value = v[k] || ''; });
    f.cat.value = v.cat; f.weight.value = v.weight; f.badge.value = v.badge || ''; f.sort.value = v.sort || 0;
    f.tarp.value = v.tarp || 'clear'; f.visible.checked = v.visible !== false;
    $('.a-more', f).open = !!(v.name_en || v.name_wo);
    setPhotoPreview(p && p.photo_url);
    msg($('#edMsg'), '');
    $('#edScrim').hidden = false;
    requestAnimationFrame(function () { $('#edScrim').classList.add('on'); f.classList.add('open'); });
    document.body.classList.add('locked');
    setTimeout(function () { f.name_fr.focus({ preventScroll: true }); }, 350);
  }

  function closeEditor() {
    $('#editor').classList.remove('open'); $('#edScrim').classList.remove('on');
    setTimeout(function () { $('#edScrim').hidden = true; }, 250);
    document.body.classList.remove('locked');
    if (state.photo.preview) URL.revokeObjectURL(state.photo.preview);
  }

  /* Photos are resized on the phone before upload (max 1200 px, JPEG). */
  function resizeImage(file, maxSide, quality) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('Impossible de traiter cette photo.')); }, 'image/jpeg', quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Ce fichier n’est pas une image lisible.')); };
      img.src = url;
    });
  }

  async function pickPhoto(e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      var blob = await resizeImage(file, 1200, 0.82);
      if (state.photo.preview) URL.revokeObjectURL(state.photo.preview);
      state.photo = { blob: blob, preview: URL.createObjectURL(blob), removed: false };
      setPhotoPreview(state.photo.preview);
    } catch (err) { msg($('#edMsg'), err.message); }
  }

  function removePhoto() {
    if (state.photo.preview) URL.revokeObjectURL(state.photo.preview);
    state.photo = { blob: null, preview: null, removed: true };
    setPhotoPreview(null);
  }

  function slug(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'balle';
  }
  // Path inside the bucket for photos uploaded from this page
  function ownPath(url) {
    var marker = '/storage/v1/object/public/' + CFG.PHOTO_BUCKET + '/';
    var i = url ? url.indexOf(marker) : -1;
    if (i === -1) return null;
    var path = decodeURIComponent(url.slice(i + marker.length));
    return path.indexOf('bales/') === 0 ? path : null;
  }

  async function save(e) {
    e.preventDefault();
    var f = e.target, m = $('#edMsg'), btn = $('#saveBtn');
    var name = f.name_fr.value.trim(), weight = parseInt(f.weight.value, 10);
    if (!name) { msg(m, 'Donnez un nom à la balle (en français).'); return f.name_fr.focus(); }
    if (!(weight >= 1 && weight <= 1000)) { msg(m, 'Le poids doit être entre 1 et 1000 kg.'); return f.weight.focus(); }

    var p = state.editing;
    var id = p ? p.id : slug(name) + '-' + Math.random().toString(36).slice(2, 6);
    var row = {
      name_fr: name, name_en: f.name_en.value.trim(), name_wo: f.name_wo.value.trim(),
      desc_fr: f.desc_fr.value.trim(), desc_en: f.desc_en.value.trim(), desc_wo: f.desc_wo.value.trim(),
      cat: f.cat.value, weight: weight, pieces: f.pieces.value.trim(), grade: f.grade.value.trim() || 'A',
      origin: f.origin.value.trim(), badge: f.badge.value || null, sort: parseInt(f.sort.value, 10) || 0,
      tarp: f.tarp.value, visible: f.visible.checked
    };
    btn.disabled = true; msg(m, '');
    var oldPhoto = p && p.photo_url;
    try {
      if (state.photo.blob) {
        var path = 'bales/' + id + '-' + Date.now() + '.jpg';
        var up = await db.storage.from(CFG.PHOTO_BUCKET).upload(path, state.photo.blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (up.error) throw up.error;
        row.photo_url = db.storage.from(CFG.PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
      } else if (state.photo.removed) {
        row.photo_url = null;
      }
      var r = p ? await db.from('products').update(row).eq('id', id) : await db.from('products').insert(Object.assign({ id: id }, row));
      if (r.error) throw r.error;
      // tidy up the replaced photo (only ones uploaded from this page)
      if (oldPhoto && row.photo_url !== undefined && row.photo_url !== oldPhoto && ownPath(oldPhoto)) {
        db.storage.from(CFG.PHOTO_BUCKET).remove([ownPath(oldPhoto)]);
      }
      closeEditor();
      toast(p ? 'Modifications enregistrées' : 'Balle ajoutée au catalogue');
      loadProducts();
    } catch (err) {
      msg(m, 'Échec de l’enregistrement : ' + (err.message || err));
    } finally { btn.disabled = false; }
  }

  async function del() {
    var p = state.editing;
    if (!p || !confirm('Supprimer « ' + p.name_fr + ' » du catalogue ? Cette action est définitive.')) return;
    var r = await db.from('products').delete().eq('id', p.id);
    if (r.error) return msg($('#edMsg'), 'Échec de la suppression : ' + r.error.message);
    if (ownPath(p.photo_url)) db.storage.from(CFG.PHOTO_BUCKET).remove([ownPath(p.photo_url)]);
    closeEditor(); toast('Balle supprimée'); loadProducts();
  }

  /* ---------- wiring ---------- */
  $('#catFilter').innerHTML = '<option value="all">Toutes les catégories</option>' + CATS.map(function (c) { return '<option value="' + c.id + '">' + esc(c.fr) + '</option>'; }).join('');
  $('#editor').cat.innerHTML = CATS.map(function (c) { return '<option value="' + c.id + '">' + esc(c.fr) + '</option>'; }).join('');

  $('#authForm').addEventListener('submit', submitAuth);
  $$('.seg-btn').forEach(function (b) { b.addEventListener('click', function () { setAuthMode(b.getAttribute('data-mode')); }); });
  $('#forgot').addEventListener('click', forgot);
  $('#logout').addEventListener('click', logout);
  $('#deniedLogout').addEventListener('click', logout);
  $('#addBtn').addEventListener('click', function () { openEditor(null); });
  $('#q').addEventListener('input', function (e) { state.q = e.target.value; renderList(); });
  $('#catFilter').addEventListener('change', function (e) { state.cat = e.target.value; renderList(); });
  $('#list').addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]');
    if (ed) { var id = ed.getAttribute('data-edit'); openEditor(state.products.filter(function (p) { return p.id === id; })[0]); }
    if (e.target.closest('[data-new]')) openEditor(null);
  });
  $('#list').addEventListener('change', function (e) {
    var v = e.target.closest('[data-vis]');
    if (v) toggleVisible(v.getAttribute('data-vis'), v.checked);
  });
  $('#editor').addEventListener('submit', save);
  $('#edClose').addEventListener('click', closeEditor);
  $('#edScrim').addEventListener('click', closeEditor);
  $('#delBtn').addEventListener('click', del);
  $('#photoInput').addEventListener('change', pickPhoto);
  $('#photoRemove').addEventListener('click', removePhoto);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#editor').classList.contains('open')) closeEditor(); });

  db.auth.onAuthStateChange(function (event) { if (event === 'PASSWORD_RECOVERY') recoverPassword(); });
  async function recoverPassword() {
    var pw = prompt('Choisissez un nouveau mot de passe (8 caractères minimum) :');
    if (!pw || pw.length < 8) return;
    var r = await db.auth.updateUser({ password: pw });
    toast(r.error ? 'Erreur : ' + r.error.message : 'Mot de passe modifié');
    route();
  }

  route().catch(function () { show('authScreen'); msg($('#authMsg'), 'Pas de connexion. Vérifiez internet et réessayez.'); });
})();
