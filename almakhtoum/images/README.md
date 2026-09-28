# Product photos

Put your product photos in this folder, then link each one to its product in `../js/products.js` with an `img` field:

```js
{ id: 1, name: 'Sanyang Wrap Dress', cat: 'women', ..., img: 'images/sanyang-wrap-dress.jpg' },
```

Tips for photos that look good on the site:

- **Shape:** portrait, 4:5 (for example 1200 × 1500 px). Other shapes are cropped to fit.
- **Size:** keep each file under about 300 KB (JPG or WebP). Big phone photos make the shop slow on mobile data.
- **Names:** lowercase with dashes, no spaces (`gold-seal-tote.jpg`, not `IMG 2041.JPG`).
- **Background:** a plain, light background makes the whole grid look consistent.

A product without an `img`, or whose photo file is missing, shows its illustration instead.
