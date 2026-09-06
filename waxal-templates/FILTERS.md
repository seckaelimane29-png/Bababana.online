# Waxal look pack — original filters/LUTs

## Why not the uploaded .lutpreset files

The five presets uploaded from the phone are third-party property:
FiLMiC deLog V3 / deLog / deFlat belong to FiLMiC Pro, and "Stripy Soft"
/ "Modern Vintage" come from a commercial preset pack. Rebranding and
redistributing their LUT data in Waxal would be copyright infringement.
The deLog/deFlat ones are also technical conversion LUTs for log/flat
camera profiles — on normal phone footage they look harsh, not like a
creative filter.

## The Waxal look pack (fully owned)

Seven original looks, generated from scratch (see luts/*.cube,
standard 33-point .cube format usable in any editor or WebGL pipeline):

| Look | File | Character |
|---|---|---|
| Teranga | waxal-teranga.cube | Warm golden-hour welcome, amber highlights |
| Harmattan | waxal-harmattan.cube | Dusty soft matte, lifted blacks |
| Sahel Gold | waxal-sahel-gold.cube | Rich golden punch, deep brown shadows |
| Night Market | waxal-night-market.cube | Teal shadows, warm lamp highlights |
| Dakar 84 | waxal-dakar-84.cube | Modern vintage, faded film base |
| Nooy | waxal-nooy.cube | Soft, bright, kind to skin |
| Nit | waxal-nit.cube | Warm-paper monochrome |

## CSS approximations (work in the current Filters panel today)

```ts
export const WAXAL_LOOKS_CSS: Record<string, string> = {
  teranga:     "sepia(.16) saturate(1.12) contrast(1.07) brightness(1.02) hue-rotate(-6deg)",
  harmattan:   "sepia(.24) saturate(.88) contrast(.90) brightness(1.05)",
  sahel_gold:  "sepia(.30) saturate(1.22) contrast(1.14) hue-rotate(-8deg)",
  night_market:"saturate(1.08) contrast(1.12) brightness(.96) hue-rotate(6deg)",
  dakar_84:    "sepia(.20) saturate(.82) contrast(.94) brightness(1.04)",
  nooy:        "saturate(.96) contrast(.92) brightness(1.07)",
  nit:         "grayscale(1) sepia(.14) contrast(1.08) brightness(1.02)",
};
```

## Ready-to-send Lovable prompt (pending credits)

---

Rebuild the Filters tool around the Waxal look pack — 7 branded looks
replacing the current 6 filter names. Looks: Teranga, Harmattan,
Sahel Gold, Night Market, Dakar 84, Nooy, Nit (Wolof: nooy = soft,
nit = person). Implement each as a CSS filter string applied to the
video preview (and carried into any export path), defined data-driven
in src/lib/waxal/looks.ts with these exact values: [paste the
WAXAL_LOOKS_CSS block above]. The filter tiles in the panel must show a
real thumbnail preview: the current clip's poster frame (or the demo
image) with each look's CSS filter applied, plus the look name and a
one-word Wolof mood tag. Selected tile gets an amber border. Keep the
existing adjustment sliders (exposure/contrast/warmth/saturation/sharpen)
stacking on top of the chosen look. Keep the "None" option first.
Do not change anything else.

---

Later (optional, when there is a real export pipeline): apply the
.cube LUTs in luts/ via a WebGL 3D-texture shader for exact color,
using the CSS strings only as live-preview approximations.
