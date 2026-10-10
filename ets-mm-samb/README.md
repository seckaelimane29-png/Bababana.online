# ETS MM SAMB — Balles de friperie en gros

Standalone website for **ETS MM SAMB**, a second-hand clothing bale wholesaler in **Touba Dianatou, Senegal**. It is fully separate from the other projects in this repo (own HTML, CSS, JS, assets) and can be moved into its own repository as-is.

## Run it

Static site, no build step:

```bash
cd ets-mm-samb
python3 -m http.server 8080   # open http://localhost:8080
```

Deploy by pointing Vercel / Netlify at this folder.

## How ordering works (no buy button)

There is no checkout. Every bale has a **Request** button that opens WhatsApp to **+221 76 166 91 26** with a message that already contains the bale name, weight, grade, origin and **the link to that bale's page** (`…/#/p/<id>`).

- **Add / Ajouter** puts bales in a request list (the bag icon). From the list the customer can set quantities, optionally add their name and city, and send the whole list to WhatsApp in one message, each bale with its link.
- The floating green button opens a WhatsApp support panel with both numbers: +221 76 166 91 26 and +221 78 552 05 50.
- Numbers live at the top of `js/app.js` (`WA_MAIN`, `WA_ALT`).

## Languages

A welcome screen asks visitors to choose **Français, Wolof or English** on their first visit (animated greeting and falling bales). The choice is remembered, and the FR / WO / EN switch in the header changes it at any time. All text is in `js/i18n.js`. The Wolof text should be checked by a native speaker.

## Admin page (add, edit and upload bales)

Open **`/admin.html`** (e.g. `https://your-site.vercel.app/admin.html`) and log in. From there the owner can add bales, take or upload photos from his phone, change weight, quality, origin, label and descriptions (French required; English and Wolof optional, French is shown when they're empty), hide bales or delete them. The site updates immediately.

- **Backend:** Supabase project `ets-mm-samb` (`js/config.js`). Bales are in the `products` table, photos in the public `products` storage bucket. Photos are resized on the phone (max 1200 px, JPEG) before upload.
- **Who can edit:** only signed-in users whose confirmed e-mail is in the `public.admins` table (currently `seckaelimane29@gmail.com`). Everyone else can only read visible bales. The database enforces this with row-level security, not the page.
- **First login:** tap *Créer un compte* with the admin e-mail, open the confirmation e-mail, then log in.
- **Give the owner access:** in the Supabase SQL editor run `insert into public.admins (email) values ('his-email@example.com');` (lowercase). Remove with `delete from public.admins where email = '…';`.
- **Confirmation links:** after deploying, set Supabase → Authentication → URL Configuration → Site URL to `https://your-site/admin.html` so e-mail links come back to the admin page.
- **Offline fallback:** if the database can't be reached, the site shows the last catalogue it loaded on that device, or the built-in list in `js/products.js`.

## Pictures

- 8 bales and the home-page banner use **AI-generated demo photos** (stored in Supabase under `products/demo/`). They are marked "Images de démonstration" on product pages. Replace them with real photos from the admin page when the owner has them.
- Bales without a photo show a generated bale illustration (`js/art.js`) in the tarp colour chosen in the admin.
- The banner photo is `HERO_PHOTO` in `js/config.js`.

## Files

| File | Purpose |
|---|---|
| `index.html` | Shop: welcome screen, header, request-list drawer, WhatsApp support, mobile bottom bar |
| `admin.html`, `js/admin.js`, `css/admin.css` | Admin page (French) |
| `js/config.js` | Supabase project URL, public key, photo bucket, banner photo |
| `css/styles.css` | Industrial design, animations, responsive layout |
| `js/products.js` | Categories and the offline fallback catalogue |
| `js/art.js` | Bale illustrations for bales without a photo |
| `js/i18n.js` | Interface text in French, English and Wolof |
| `js/app.js` | Loads the live catalogue; routing, filters, search, request list, WhatsApp links |
