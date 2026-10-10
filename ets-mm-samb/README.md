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

## Files

| File | Purpose |
|---|---|
| `index.html` | Shell: welcome screen, header, request-list drawer, WhatsApp support, mobile bottom bar |
| `css/styles.css` | Industrial design (concrete, steel, safety yellow, tarp orange), animations, responsive layout |
| `js/products.js` | Catalogue: 12 bales across 7 categories, text in FR / EN / WO |
| `js/art.js` | Generates the demo pictures (SVG bales under plastic or PP tarp, green straps, marker label) |
| `js/i18n.js` | Interface text in three languages |
| `js/app.js` | Routing (home, catalogue, product page), filters, search, sort, request list, WhatsApp links |

## Replacing the demo pictures with real photos

The bale pictures are generated illustrations (marked "Images de démonstration"). To use a real photo, put it in `assets/photos/` and add `photo` to the product in `js/products.js`:

```js
{ id: 'jeans-homme-ca', photo: 'assets/photos/jeans-homme.jpg', ... }
```

Square photos (1:1) look best.
