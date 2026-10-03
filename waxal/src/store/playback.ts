import { create } from 'zustand';

/** High-frequency playback clock, kept apart from the project store so only the stage/timeline re-render. */
type PlaybackState = {
  /** Current SOURCE time of the video. */
  time: number;
  /** Current TIMELINE time (after cuts). */
  timelineTime: number;
  playing: boolean;
  set: (s: Partial<Omit<PlaybackState, 'set'>>) => void;
};

export const usePlayback = create<PlaybackState>((set) => ({
  time: 0,
  timelineTime: 0,
  playing: false,
  set: (s) => set(s),
}));
