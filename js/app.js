/* Renders the whole page from TRANSLATIONS[lang] and wires up the language switcher. */
(function () {
  const THEMES = ["navy", "rust", "olive", "navy", "rust", "olive", "navy"];

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else node.setAttribute(k, v);
      }
    }
    for (const child of children) {
      if (child == null) continue;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    }
    return node;
  }

  function fmt(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key]);
  }

  function getLang() {
    const saved = localStorage.getItem("signal-method-lang");
    if (saved && TRANSLATIONS[saved]) return saved;
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return TRANSLATIONS[nav] ? nav : "en";
  }

  function setLang(lang) {
    localStorage.setItem("signal-method-lang", lang);
    render(lang);
    history.replaceState(null, "", "#top");
  }

  function renderLangSwitcher(current) {
    const nav = document.getElementById("lang-switcher");
    nav.innerHTML = "";
    LANG_ORDER.forEach((code) => {
      const btn = el(
        "button",
        {
          class: "lang-btn" + (code === current ? " active" : ""),
          type: "button",
          "aria-pressed": code === current ? "true" : "false",
          "data-lang": code
        },
        code.toUpperCase()
      );
      btn.addEventListener("click", () => setLang(code));
      nav.appendChild(btn);
    });
  }

  function renderCover(t) {
    return el(
      "section",
      { class: "cover", id: "top" },
      el(
        "div",
        { class: "cover-inner" },
        el("span", { class: "badge" }, t.cover.badge),
        el("div", { class: "cover-number" }, t.cover.number),
        el(
          "h1",
          { class: "cover-title" },
          t.cover.titleLine1,
          el("br"),
          t.cover.titleLine2
        ),
        el("p", { class: "cover-subtitle" }, t.cover.subtitle),
        el("p", { class: "cover-quote" }, t.cover.quote),
        el("p", { class: "handwritten cover-motto" }, t.cover.motto),
        el(
          "div",
          { class: "stat-bar" },
          ...t.cover.stats.map((s) => el("span", { class: "stat" }, s))
        ),
        el(
          "a",
          { class: "start-reading", href: "#" + t.parts[0].id },
          el("span", { class: "start-reading-main" }, t.ui.startReading, el("span", { class: "start-arrow" }, " →")),
          el("span", { class: "start-reading-sub" }, t.ui.startReadingSub)
        )
      )
    );
  }

  function renderHowTo(t) {
    const toc = el(
      "ol",
      { class: "toc" },
      ...t.parts.map((p, i) =>
        el(
          "li",
          { class: "toc-row toc-theme-" + THEMES[i] },
          el("a", { href: "#" + p.id, class: "toc-link" },
            el("span", { class: "toc-num" }, String(i + 1).padStart(2, "0")),
            el("span", { class: "toc-title" }, p.title),
            el("span", { class: "toc-count" }, String(p.points.length))
          )
        )
      )
    );
    return el(
      "section",
      { class: "howto", id: "howto" },
      el(
        "div",
        { class: "howto-inner" },
        el("span", { class: "eyebrow" }, t.howto.label),
        el("p", null, t.howto.p1),
        el("p", null, t.howto.p2),
        toc
      )
    );
  }

  function renderPart(t, part, index) {
    const theme = THEMES[index];
    const total = t.parts.length;
    const partOfText = fmt(t.ui.partOf, { n: index + 1, total: total });

    const banner = el(
      "div",
      { class: "part-banner theme-" + theme },
      el("div", { class: "part-banner-inner" },
        el("span", { class: "eyebrow" }, partOfText),
        el("p", { class: "handwritten part-tagline" }, part.tagline),
        el("h2", { class: "part-title" }, part.title),
        el("p", { class: "part-intro" }, part.intro),
        el("span", { class: "part-count" }, part.points.length + " " + t.pointsSuffix)
      ),
      el("span", { class: "part-ghost-num" }, String(index + 1).padStart(2, "0"))
    );

    const list = el(
      "ol",
      { class: "point-list" },
      ...part.points.map((pt, i) =>
        el(
          "li",
          { class: "point-row" },
          el("span", { class: "point-num theme-text-" + theme }, String(i + 1 + pointOffset(t, index)).padStart(2, "0")),
          el("span", { class: "point-text" }, pt)
        )
      )
    );

    const applied = el(
      "div",
      { class: "applied-box theme-border-" + theme },
      el("span", { class: "applied-label theme-bg-" + theme }, t.appliedLabel),
      el("p", null, part.applied)
    );

    const isLast = index === total - 1;
    const nextPart = isLast ? null : t.parts[index + 1];
    const nextHref = isLast ? "#closing" : "#" + nextPart.id;
    const nextTitle = isLast ? t.closing.strip : nextPart.title;
    const nextEyebrow = isLast ? t.ui.finalWord : t.ui.upNext;

    const prevLink = index === 0
      ? el("a", { class: "flow-link flow-prev", href: "#howto" },
          el("span", { class: "flow-arrow" }, "←"),
          el("span", { class: "flow-text" },
            el("span", { class: "flow-label" }, t.ui.previous),
            el("span", { class: "flow-title" }, t.howto.tocLabel)
          )
        )
      : el("a", { class: "flow-link flow-prev", href: "#" + t.parts[index - 1].id },
          el("span", { class: "flow-arrow" }, "←"),
          el("span", { class: "flow-text" },
            el("span", { class: "flow-label" }, t.ui.previous),
            el("span", { class: "flow-title" }, t.parts[index - 1].title)
          )
        );

    const nextLink = el(
      "a",
      { class: "flow-link flow-next theme-text-" + theme, href: nextHref },
      el("span", { class: "flow-text" },
        el("span", { class: "flow-label" }, nextEyebrow),
        el("span", { class: "flow-title" }, nextTitle)
      ),
      el("span", { class: "flow-arrow" }, "→")
    );

    const flowNav = el("nav", { class: "flow-nav", "aria-label": "Part navigation" }, prevLink, nextLink);

    const body = el(
      "div",
      { class: "part-body" },
      el("div", { class: "part-body-inner" },
        el("div", { class: "part-index theme-text-" + theme }, part.eyebrow.match(/\d+/)[0]),
        list,
        applied,
        flowNav
      )
    );

    return el("section", { class: "part", id: part.id }, banner, body);
  }

  function pointOffset(t, index) {
    let offset = 0;
    for (let i = 0; i < index; i++) offset += t.parts[i].points.length;
    return offset;
  }

  function renderClosing(t) {
    return el(
      "section",
      { class: "closing", id: "closing" },
      el(
        "div",
        { class: "closing-inner" },
        el("p", { class: "closing-strip" }, t.closing.strip),
        el("p", { class: "closing-line" }, t.closing.line),
        el("p", { class: "handwritten closing-motto" }, t.closing.motto),
        el(
          "div",
          { class: "closing-actions" },
          el("a", { class: "closing-link", href: "#top" }, t.ui.backToStart),
          el("a", { class: "closing-link closing-link-ghost", href: "#top" }, t.ui.backToTop)
        )
      )
    );
  }

  function renderProgressBar() {
    let bar = document.getElementById("progress-bar");
    if (!bar) {
      bar = el("div", { id: "progress-bar", class: "progress-bar" });
      document.body.appendChild(bar);
      window.addEventListener("scroll", updateProgress, { passive: true });
      window.addEventListener("resize", updateProgress);
    }
    updateProgress();
  }

  function updateProgress() {
    const bar = document.getElementById("progress-bar");
    if (!bar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    bar.style.width = pct + "%";
  }

  function render(lang) {
    const t = TRANSLATIONS[lang];
    document.documentElement.lang = t.htmlLang;
    document.documentElement.dir = t.dir;
    document.title = t.cover.titleLine1 + " " + t.cover.titleLine2 + " — " + t.cover.badge;

    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(renderCover(t));
    app.appendChild(renderHowTo(t));
    t.parts.forEach((part, i) => app.appendChild(renderPart(t, part, i)));
    app.appendChild(renderClosing(t));

    renderLangSwitcher(lang);
    renderProgressBar();
  }

  document.addEventListener("DOMContentLoaded", () => {
    render(getLang());
  });
})();
