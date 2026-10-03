import { sourceRangeToTimeline } from './timeline.js';

/** '#RRGGBB' or '#RRGGBBAA' -> ASS '&HAABBGGRR' (ASS alpha: 00 = opaque). */
export function assColor(hex) {
  const h = (hex || '#FFFFFF').replace('#', '');
  const r = h.slice(0, 2);
  const g = h.slice(2, 4);
  const b = h.slice(4, 6);
  const a = h.length >= 8 ? (255 - parseInt(h.slice(6, 8), 16)).toString(16).padStart(2, '0') : '00';
  return `&H${a}${b}${g}${r}`.toUpperCase();
}

function ts(sec) {
  const cs = Math.max(0, Math.round(sec * 100));
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const s = Math.floor((cs % 6000) / 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
}

function esc(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/[{}]/g, '').replace(/\n/g, '\\N');
}

// Strip emoji: libass cannot draw color emoji, they would render as boxes.
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;

// RN font px -> ASS font size. libass sizes fonts by line height, so it needs a slightly bigger number to match.
const SIZE_FACTOR = 1.2;

/**
 * Build an ASS subtitle file that reproduces the in-app caption preview:
 * word-by-word highlight, pop animation, karaoke fill, fade, keyword colors, text overlays.
 * All event times are on the edited timeline (after cuts, before speed change).
 */
export function buildASS(project, W, H) {
  const style = project.style;
  const scale = W / 1080;
  const fs = Math.round(style.size * W * SIZE_FACTOR);
  const outline = (style.strokeWidth * scale).toFixed(1);
  const shadow = style.shadow ? Math.max(1, Math.round(fs * 0.05)) : 0;
  const box = !!style.background;
  const margin = Math.round(W * 0.06);

  const header = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${W}`,
    `PlayResY: ${H}`,
    'WrapStyle: 0',
    'ScaledBorderAndShadow: yes',
    'YCbCr Matrix: TV.709',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Cap,${style.fontFamily},${fs},${assColor(style.color)},${assColor(style.highlightColor)},${box ? assColor(style.background) : assColor(style.strokeColor)},&H80000000,0,0,0,0,100,100,0,0,${box ? 3 : 1},${box ? Math.round(fs * 0.22) : outline},${box ? 0 : shadow},5,${margin},${margin},0,1`,
    `Style: Txt,Montserrat Black,${Math.round(0.07 * W * SIZE_FACTOR)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,${(3 * scale).toFixed(1)},0,5,${margin},${margin},0,1`,
    `Style: TxtBox,Montserrat Black,${Math.round(0.07 * W * SIZE_FACTOR)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,3,10,0,5,${margin},${margin},0,1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];

  const events = [];
  const x = Math.round(W / 2);
  const y = Math.round(style.positionY * H);
  const anim = style.animation;
  const hl = assColor(style.highlightColor);
  const base = assColor(style.color);
  const emph = assColor(style.emphasisColor);

  for (const cap of project.captions || []) {
    const words = (cap.words || []).filter((w) => String(w.text).replace(EMOJI, '').trim());
    if (!words.length) continue;
    // Constant-state segments: before the first word, then one per word.
    const bounds = [cap.start, ...words.map((w) => Math.min(Math.max(w.start, cap.start), cap.end)), cap.end];
    const segs = [];
    for (let k = 0; k < bounds.length - 1; k++) {
      if (bounds[k + 1] - bounds[k] > 0.005) segs.push({ start: bounds[k], end: bounds[k + 1], active: k - 1 });
    }
    let first = true;
    for (const seg of segs) {
      const line = words
        .map((w, i) => {
          let t = String(w.text).replace(EMOJI, '').trim();
          if (style.uppercase) t = t.toUpperCase();
          t = esc(t);
          const isActive = i === seg.active;
          const spoken = i <= seg.active;
          let color = w.emphasis ? emph : base;
          if (anim === 'karaoke' ? spoken : isActive && anim !== 'none') color = hl;
          let tags = `\\1c${color}`;
          if (isActive && (anim === 'pop' || anim === 'bounce')) {
            const peak = anim === 'bounce' ? 114 : 108;
            tags += `\\fscx88\\fscy88\\t(0,90,\\fscx${peak}\\fscy${peak})`;
          }
          return `{${tags}}${t}{\\fscx100\\fscy100}`;
        })
        .join(' ');
      for (const r of sourceRangeToTimeline(project.clips, seg.start, seg.end)) {
        const fade = anim === 'fade' && first ? '\\fad(150,0)' : '';
        events.push(`Dialogue: 0,${ts(r.start)},${ts(r.end)},Cap,,0,0,0,,{\\an5\\pos(${x},${y})${fade}}${line}`);
      }
      first = false;
    }
  }

  const fonts = project.textFonts || {};
  for (const t of project.texts || []) {
    const text = esc(String(t.text).replace(EMOJI, '').trim());
    if (!text) continue;
    const size = Math.round(t.size * W * SIZE_FACTOR);
    const family = fonts[t.font] || 'Montserrat Black';
    const pos = `\\an5\\pos(${Math.round(t.x * W)},${Math.round(t.y * H)})`;
    const tags = t.background
      ? `{${pos}\\fn${family}\\fs${size}\\1c${assColor(t.color)}\\3c${assColor(t.background)}\\bord${Math.round(size * 0.25)}}`
      : `{${pos}\\fn${family}\\fs${size}\\1c${assColor(t.color)}\\3c${assColor(t.strokeColor || '#000000')}\\bord${t.strokeColor ? (3 * scale).toFixed(1) : 0}}`;
    for (const r of sourceRangeToTimeline(project.clips, t.start, t.end)) {
      events.push(`Dialogue: 1,${ts(r.start)},${ts(r.end)},${t.background ? 'TxtBox' : 'Txt'},,0,0,0,,${tags}${text}`);
    }
  }

  return [...header, ...events, ''].join('\n');
}
