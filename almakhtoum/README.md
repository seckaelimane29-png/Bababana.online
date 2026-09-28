# Almakhtoum — Clothes, Bags & Shoes

A standalone storefront for **Almakhtoum** (المختوم, "the sealed"). It is fully separate from the other projects in this repo: it has its own HTML, CSS, JS and assets, and nothing outside this folder links to it.

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
| `js/hero3d.js` | Three.js 3D banner: handbag, shoe box, hanger and gold seal coin |
| `assets/logo.svg`, `assets/favicon.svg` | Logo: a gold wax seal with an "A" whose peak is a clothes-hanger hook |

## Ordering via WhatsApp

Every buy button opens WhatsApp to **+220 204 8100** (`WHATSAPP` in `js/app.js`) with the order already written:

- **Buy** on a product card or in quick view sends that one item, with its size and price.
- **Order on WhatsApp** in the bag asks for name, phone, delivery area and payment method, then sends the whole order and total.
- The floating green button opens a general chat.

## Editing products

Edit `PRODUCTS` in `js/products.js`. Each item has a `type` (the illustration, e.g. `dress`, `kaftan`, `handbag`, `sneaker`, `heel`) and two colours, `c` and `c2`.

To show a real photo, put it in `images/` and add `img: 'images/your-photo.jpg'` to the product. It then appears on the card, in quick view, in the bag and in the wishlist. See `images/README.md` for photo size tips.

Prices are whole Dalasi and are formatted as `D 2,450` by `formatPrice()`.
