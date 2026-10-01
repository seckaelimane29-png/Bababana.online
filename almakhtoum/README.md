# Sunu Waxal — Clothes, Bags & Shoes

A standalone storefront for **Sunu Waxal**. It lives in the `almakhtoum/` folder (the shop's original working name) and is fully separate from the other projects in this repo: it has its own HTML, CSS, JS and assets, and nothing outside this folder links to it.

## Run it

It's a static site with no build step. Serve the folder:

```bash
cd almakhtoum
python3 -m http.server 8080   # then open http://localhost:8080
```

(ES modules need a server, so opening `index.html` straight from disk won't work.)

## What's inside

| File | Purpose |
|---|---|
| `index.html` | Page layout, cart drawer, quick view, WhatsApp order form |
| `css/styles.css` | Design tokens, animations, skeleton shimmer, responsive layout |
| `js/products.js` | Catalogue (28 products, 6 categories), prices in Dalasi, SVG product illustrations |
| `js/app.js` | Filters, search, sort, cart, wishlist, skeleton loading, WhatsApp ordering |
| `js/catalog.js`, `js/config.js` | Loads products from Supabase; backend settings |
| `admin.html`, `js/admin.js`, `css/admin.css` | Admin page |
| `js/hero3d.js` | Three.js 3D banner: handbag, shoe box, hanger and gold seal coin |
| `assets/logo.svg`, `assets/favicon.svg` | Logo: a gold medallion with an "S" whose top is a clothes-hanger hook |

## Ordering via WhatsApp

Every buy button opens WhatsApp to **+220 236 4012** (`WHATSAPP` in `js/app.js`) with the order already written:

- **Buy** on a product card or in quick view sends that one item, with its size and price.
- **Order on WhatsApp** in the bag asks for name, phone, delivery area and payment method, then sends the whole order and total.
- The floating green button opens a general chat.

## Admin page (add, edit and upload products)

Open **`/admin`** (e.g. `https://sunu-waxal.vercel.app/admin`) and log in. From there you can add products, upload photos from your phone, change prices, sizes, labels and descriptions, hide products or delete them. The shop updates immediately.

- **Backend:** Supabase project `almakhtoum` (`js/config.js`). Products live in the `products` table, photos in the public `products` storage bucket. Photos are resized on the device (max 1400 px, JPEG) before upload.
- **Who can edit:** only signed-in users whose confirmed email is in the `public.admins` table (currently `seckaelimane29@gmail.com`). Everyone else can only read visible products. This is enforced by database row-level security, not by the page.
- **First login:** tap *Create account* with the admin email, open the confirmation email, then log in.
- **Add another admin:** in the Supabase SQL editor run `insert into public.admins (email) values ('name@example.com');` (lowercase). Remove with `delete from public.admins where email = '…';`.
- **Confirmation links:** in Supabase → Authentication → URL Configuration, set the Site URL to `https://sunu-waxal.vercel.app/admin` so email links come back to the admin page.
- **If the database is unreachable,** the shop falls back to the built-in sample list in `js/products.js`.

## Built-in sample products

Use the admin page to manage products. `PRODUCTS` in `js/products.js` is only the offline fallback. Each item has a `type` (the illustration, e.g. `dress`, `kaftan`, `handbag`, `sneaker`, `heel`) and two colours, `c` and `c2`.

To show a real photo, put it in `images/` and add `img: 'images/your-photo.jpg'` to the product. It then appears on the card, in quick view, in the bag and in the wishlist. See `images/README.md` for photo size tips.

Prices are whole Dalasi and are formatted as `D 2,450` by `formatPrice()`.
