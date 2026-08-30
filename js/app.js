(function () {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const navCta = document.querySelector(".nav-cta");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      if (navCta) navCta.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        if (navCta) navCta.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Sticky header shadow on scroll
  const topbar = document.getElementById("topbar");
  if (topbar) {
    const updateTopbar = () => {
      topbar.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", updateTopbar, { passive: true });
    updateTopbar();
  }

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".faq-item.open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-answer").style.maxHeight = null;
        }
      });

      item.classList.toggle("open", !isOpen);
      question.setAttribute("aria-expanded", isOpen ? "false" : "true");
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
    });
  });

  // Scroll reveal
  const revealTargets = document.querySelectorAll(
    [
      ".method-card",
      ".program-card",
      ".testimonial-card",
      ".about-grid",
      ".problem-list",
      ".video-frame",
      "#intent-grid .intent-card",
      ".video-row-scroll .video-row-card",
      "main > section:not(.hero) .section-inner > .eyebrow",
      "main > section:not(.hero) .section-inner > .section-title",
      "main > section:not(.hero) .section-inner > .section-lead",
      ".cta-title",
      ".cta-subtitle"
    ].join(", ")
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in-view"));
  }

  // Animated count-up stats (e.g. "500+", "4.9★", "100%")
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counterEls = document.querySelectorAll(".about-stats strong, .stats-grid strong");

  counterEls.forEach((el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/^([\d.]+)(.*)$/);
    if (!match) return;

    const target = parseFloat(match[1]);
    const decimals = (match[1].split(".")[1] || "").length;
    const suffix = match[2] || "";
    const format = (value) => (decimals > 0 ? value.toFixed(decimals) : String(Math.round(value))) + suffix;

    if (prefersReducedMotion) return;

    el.textContent = format(0);

    const run = () => {
      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = format(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              run();
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counterObserver.observe(el);
    } else {
      run();
    }
  });

  // Intent picker + contact form
  const intentGrid = document.getElementById("intent-grid");
  const intentForm = document.getElementById("intent-form");

  if (intentGrid && intentForm) {
    const INTENTS = {
      work: {
        label: "Work With Me",
        placeholder: "What kind of ongoing work are you thinking about, and what does success look like?",
        submitText: "Send — Let's Work Together",
        successTitle: "Got it — let's talk shop.",
        successText: "I'll reply personally about working together, usually within a day or two."
      },
      collab: {
        label: "Collaborate",
        placeholder: "What's the collaboration idea? The more specific, the faster I can say yes.",
        submitText: "Send — Let's Collaborate",
        successTitle: "Love a good collab.",
        successText: "I'll get back to you about teaming up, usually within a day or two."
      },
      talk: {
        label: "Just Talk",
        placeholder: "What's on your mind?",
        submitText: "Send — Let's Talk",
        successTitle: "Got it — thanks for reaching out.",
        successText: "I'll reply personally, usually within a day or two."
      },
      hire: {
        label: "Hire Me",
        placeholder: "What's the role or project, and what's the timeline?",
        submitText: "Send — I'm Interested",
        successTitle: "Got it — thanks.",
        successText: "I'll follow up about the opportunity, usually within a day or two."
      },
      coach: {
        label: "Coach Me",
        placeholder: "What are you stuck on right now?",
        submitText: "Send — Coach Me",
        successTitle: "Got it — let's fix that.",
        successText: "I'll reach out about coaching, usually within a day or two."
      }
    };

    const intentField = document.getElementById("intent-field");
    const intentSelected = document.getElementById("intent-selected");
    const intentSelectedLabel = document.getElementById("intent-selected-label");
    const intentClear = document.getElementById("intent-clear");
    const intentMessage = document.getElementById("intent-message");
    const intentSubmit = document.getElementById("intent-submit");
    const intentSuccess = document.getElementById("intent-success");
    const intentError = document.getElementById("intent-error");
    const defaultPlaceholder = intentMessage ? intentMessage.placeholder : "";

    function setSubmitText(text) {
      intentSubmit.textContent = text + " ";
      const arrow = document.createElement("span");
      arrow.className = "arrow";
      arrow.textContent = "→";
      intentSubmit.appendChild(arrow);
    }

    function selectIntent(key) {
      const card = intentGrid.querySelector('[data-intent="' + key + '"]');
      const cfg = INTENTS[key];
      if (!card || !cfg) return;

      intentGrid.querySelectorAll(".intent-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      intentField.value = cfg.label;
      intentSelectedLabel.textContent = cfg.label;
      intentSelected.hidden = false;
      intentMessage.placeholder = cfg.placeholder;
      setSubmitText(cfg.submitText);
    }

    function clearIntent() {
      intentGrid.querySelectorAll(".intent-card").forEach((c) => c.classList.remove("selected"));
      intentField.value = "";
      intentSelected.hidden = true;
      intentMessage.placeholder = defaultPlaceholder;
      setSubmitText("Send Message");
    }

    intentGrid.querySelectorAll(".intent-card").forEach((card) => {
      card.addEventListener("click", () => selectIntent(card.dataset.intent));
    });

    if (intentClear) intentClear.addEventListener("click", clearIntent);

    intentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (intentError) intentError.hidden = true;

      const selectedCard = intentGrid.querySelector(".intent-card.selected");
      const cfg = selectedCard ? INTENTS[selectedCard.dataset.intent] : null;

      const originalHTML = intentSubmit.innerHTML;
      intentSubmit.disabled = true;
      intentSubmit.textContent = "Sending…";

      try {
        const res = await fetch(intentForm.action, {
          method: "POST",
          body: new FormData(intentForm),
          headers: { Accept: "application/json" }
        });
        if (!res.ok) throw new Error("Form submission failed");

        intentForm.hidden = true;
        intentGrid.hidden = true;
        if (intentSuccess) {
          intentSuccess.hidden = false;
          const title = document.getElementById("intent-success-title");
          const text = document.getElementById("intent-success-text");
          if (cfg) {
            if (title) title.textContent = cfg.successTitle;
            if (text) text.textContent = cfg.successText;
          }
        }
      } catch (err) {
        if (intentError) intentError.hidden = false;
        intentSubmit.disabled = false;
        intentSubmit.innerHTML = originalHTML;
      }
    });
  }
})();
