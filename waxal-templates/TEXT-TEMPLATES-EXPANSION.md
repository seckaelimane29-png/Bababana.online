# Text tool: premium upgrade + 10 new templates — ready-to-send Lovable prompt

Blocked by: workspace out of Lovable credits. After topping up at
https://lovable.dev/settings/billing, paste the prompt below into the
Waxal project chat
(https://lovable.dev/projects/c079f7f2-de41-4991-aa27-5fee22a8c707),
or ask Claude to send it. A live visual reference of all 16 templates
is in this folder's index.html.

---

Make the overlay text templates look premium and modern on real video — right now they read a bit flat. Upgrade the existing 6 templates' rendering quality AND add 10 new templates (16 total), all data-driven in textTemplates.ts with live animated mini-preview cards in the panel.

PREMIUM RENDERING QUALITY (applies to every text template, on the video preview and in the preview cards):
- Plates behind text use backdrop-filter: blur(12px) with a translucent tint instead of flat opaque backgrounds, with a 1px inner border of rgba(245,237,228,0.15) — glassmorphism, like CapCut/Apple titles.
- All text over video gets a subtle two-layer shadow (0 1px 2px rgba(0,0,0,.6) + 0 8px 24px rgba(0,0,0,.35)) so it stays legible on bright footage like a sunny street scene.
- Entrance animations use spring easing cubic-bezier(0.34, 1.56, 0.64, 1) or smooth cubic-bezier(0.22, 1, 0.36, 1) — never linear; multi-word templates stagger words by 60-80ms.
- Typography polish: tighter letter-spacing (-0.02em) on big headlines, optical kerning, text-wrap: balance on multi-line text.
- Headline-scale templates get an optional very subtle gradient fill (cream → slightly warmer cream) via background-clip: text.

NEW TEMPLATES, organized in category rows with mono uppercase labels (existing six distribute into these rows too):
✍️ TITLES — "Serif classic": high-contrast serif (Playfair Display), cream, with a wide letter-spaced small-caps subtitle line, gentle fade-up, for film openers. "Outline": huge uppercase letters with thick cream stroke and transparent fill, top-center. "Split color": bold uppercase, first half cream and second half amber, sliding in from both sides and meeting in the middle. "Neon sign": script font with cyan glow and a brief flicker-in.
💬 SOCIAL — "Speech bubble": glassy terracotta-tinted bubble with a tail, bounce-in, for reactions. "Sticker": short word on an amber rounded sticker rotated -4°, white border, pop-in with overshoot. "Location tag": frosted-glass pill with a 📍 glyph and mono text ("Dakar, Sénégal"), top-left, slide-down. "Hashtag rail": 2-3 frosted mono hashtag chips bottom-right, staggered fade-in.
🎞 DYNAMIC — "Typewriter": mono font, characters revealing one by one with a blinking cursor. "Big number": huge amber numeral with a small cream label beside it, scale-in, for listicles.

Category rows in the panel: ✍️ TITLES (Bold headline, Serif classic, Outline, Split color, Neon sign), 💬 SOCIAL (Lower third, Quote card, Speech bubble, Sticker, Location tag, Hashtag rail), 🎞 DYNAMIC (Kinetic word, Ticker, Typewriter, Big number, Woven banner). Each new template gets a distinct Wolof default sample. Load new Google Fonts properly, keep the editable-content and template-id layer behavior exactly as is, and verify all 16 fit in all three aspect ratios without overflow using the min(cqw,cqh) sizing approach. Fallback gracefully where backdrop-filter is unsupported (solid rgba plate).
