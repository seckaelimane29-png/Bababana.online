/**
 * iPhone Safari gets stuck when a <video> is sent many seeks in a row (dragging the timeline):
 * currentTime reports the new spot but playback later resumes from the old one. Send one seek at a
 * time and always finish on the latest position asked for.
 */
type State = { target: number | null; busy: boolean; since: number; hooked: boolean };
const states = new WeakMap<HTMLVideoElement, State>();

function state(el: HTMLVideoElement): State {
  let s = states.get(el);
  if (!s) {
    s = { target: null, busy: false, since: 0, hooked: false };
    states.set(el, s);
  }
  if (!s.hooked) {
    s.hooked = true;
    const next = () => {
      s!.busy = false;
      if (s!.target != null) run(el, s!);
    };
    el.addEventListener('seeked', next);
    el.addEventListener('loadedmetadata', next);
    // Ask Safari to keep the whole clip ready so seeks land on a picture instead of black.
    el.preload = 'auto';
  }
  return s;
}

function run(el: HTMLVideoElement, s: State) {
  const t = s.target;
  if (t == null) return;
  if (el.readyState < 1) return; // applied on loadedmetadata
  s.target = null;
  s.busy = true;
  s.since = Date.now();
  el.currentTime = t;
}

export function webSeek(el: HTMLVideoElement, t: number) {
  const s = state(el);
  s.target = t;
  // A seek that never reported back (Safari sometimes drops them) must not block the next one.
  if (s.busy && Date.now() - s.since < 800) return;
  run(el, s);
}

/** Before playing: re-issue the position the user picked, so a dropped seek can't resume from the old spot. */
export function webPrepareToPlay(el: HTMLVideoElement, t: number) {
  const s = state(el);
  s.target = null;
  s.busy = true;
  s.since = Date.now();
  if (el.readyState >= 1 && Math.abs(el.currentTime - t) > 0.02) el.currentTime = t;
  else if (el.readyState >= 1) el.currentTime = t + 0.001;
}
