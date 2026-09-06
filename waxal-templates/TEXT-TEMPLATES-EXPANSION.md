# Text tool expansion — ready-to-send Lovable prompt (pending credits)

Blocked by: workspace out of Lovable credits. After topping up at
https://lovable.dev/settings/billing, paste the prompt below into the
Waxal project chat
(https://lovable.dev/projects/c079f7f2-de41-4991-aa27-5fee22a8c707),
or ask Claude to send it.

---

Expand the Text tool with 10 more overlay text templates (16 total), organized in category rows with mono uppercase labels like the Captions panel. Keep the existing 6 (Bold headline, Lower third, Quote card, Ticker, Kinetic word, Woven banner) and the data-driven textTemplates.ts approach — add the new ones there so each gets a live animated mini-preview card in the panel AND renders identically on the video preview. New templates, all using the brand palette (#F5EDE4 cream, #0F8A5F green, #E0A32E amber, #C2542F terracotta) unless a style calls for its own:

✍️ TITLES — 7. "Neon sign": handwritten-style script font, cyan glow with flicker-in animation, centered. 8. "Outline": huge uppercase transparent letters with a thick cream stroke only (no fill), top-center, fade-in. 9. "Serif classic": elegant high-contrast serif (e.g. Playfair Display), cream, wide letter-spaced small caps subtitle line underneath, gentle fade-up — for film titles. 10. "Split color": bold uppercase where the first half of the text is cream and the second half amber, slides in from both sides meeting in the middle.

💬 SOCIAL — 11. "Speech bubble": rounded terracotta bubble with a small tail, cream bold text, bounce-in — for reactions. 12. "Sticker": short word on an amber rounded sticker rotated -4° with a white border and drop shadow, pop-in with overshoot. 13. "Location tag": small pill with a 📍 pin glyph and mono text (e.g. "Dakar, Sénégal"), top-left, slide-down — for vlogs. 14. "Hashtag rail": a row of 2-3 mono hashtag chips (#Waxal #Dakar) at the bottom-right, staggered fade-in.

🎞 DYNAMIC — 15. "Typewriter": mono font, characters reveal one by one with a blinking cursor, left-aligned mid-frame. 16. "Big number": a huge amber numeral (e.g. "3") with a small cream label word next to it, count-up scale-in — for listicle videos.

Give each a distinct Wolof default sample. In the panel, the category rows are: ✍️ TITLES (Bold headline, Serif classic, Outline, Split color, Neon sign), 💬 SOCIAL (Lower third, Quote card, Speech bubble, Sticker, Location tag, Hashtag rail), 🎞 DYNAMIC (Kinetic word, Ticker, Typewriter, Big number, Woven banner). Load any new Google Fonts properly. Editable content and template-id layer behavior stay exactly as they work now; make sure all 16 render correctly in the three aspect ratios without overflowing (reuse the min(cqw,cqh) sizing fix).
