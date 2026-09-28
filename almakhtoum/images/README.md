# Product photos

The easiest way to add photos is the **admin page** (`/admin`): open a product, tap **Add photo**, and save. Photos are resized automatically and stored in Supabase.

This folder is only for the built-in sample products in `../js/products.js` (the offline fallback). To use a photo there, add an `img` field:

```js
{ id: 1, name: 'Sanyang Wrap Dress', cat: 'women', ..., img: 'images/sanyang-wrap-dress.jpg' },
```

Tips for photos that look good on the site:

- **Shape:** portrait, 4:5 (for example 1200 × 1500 px). Other shapes are cropped to fit.
- **Background:** a plain, light background makes the whole grid look consistent.
- **Light:** daylight near a window, no flash.
