import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { VideoThumbnail } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { IconButton, T, tap } from '@/components/ui';
import { captionText } from '@/lib/captions';
import { clipOffsets, formatTime, sourceRangeToTimeline, timelineDuration } from '@/lib/timeline';
import { useEditor } from '@/store/projects';
import { usePlayback } from '@/store/playback';
import { colors } from '@/theme';

const BASE_PPS = 56; // pixels per second at zoom 1
const THUMB_W = 40;

type Props = {
  width: number;
  thumbnails: { time: number; thumb: VideoThumbnail }[];
  onSeek: (timelineTime: number) => void;
  onScrubStart: () => void;
};

export function Timeline({ width, thumbnails, onSeek, onScrubStart }: Props) {
  const project = useEditor((s) => s.project)!;
  const selection = useEditor((s) => s.selection);
  const select = useEditor((s) => s.select);
  const [zoom, setZoom] = useState(1);
  const pps = BASE_PPS * zoom;
  const scroll = useRef<ScrollView>(null);
  const userScrolling = useRef(false);
  const momentum = useRef(false);
  // Where the app itself last scrolled to. Any other scroll position came from the user's finger.
  // (The web build never fires onScrollBeginDrag, so this is what makes scrubbing work there.)
  const autoX = useRef(0);
  // Finger on the timeline (and a short grace period for the fling after lifting it).
  const touching = useRef(false);
  const touchEndAt = useRef(0);
  const fingerActive = () => touching.current || Date.now() - touchEndAt.current < 700;
  const scrollTo = (x: number) => {
    autoX.current = x;
    scroll.current?.scrollTo({ x, animated: false });
  };
  const total = timelineDuration(project.clips);
  const half = width / 2;
  const offsets = useMemo(() => clipOffsets(project.clips), [project.clips]);

  // Follow the playhead while playing / after programmatic seeks.
  useEffect(() => {
    return usePlayback.subscribe((s, prev) => {
      if (s.timelineTime === prev.timelineTime || userScrolling.current || momentum.current || fingerActive()) return;
      scrollTo(s.timelineTime * pps);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pps]);

  useEffect(() => {
    scrollTo(usePlayback.getState().timelineTime * pps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pps]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const playing = usePlayback.getState().playing;
    // While playing, only a real touch counts: our own follow-scroll events can arrive a few frames late.
    const byUser = userScrolling.current || momentum.current || fingerActive() || (!playing && Math.abs(x - autoX.current) > 2);
    if (!byUser) return;
    if (usePlayback.getState().playing) onScrubStart();
    autoX.current = x;
    onSeek(Math.min(total, Math.max(0, x / pps)));
  };

  const captionBlocks = useMemo(
    () =>
      project.captions.flatMap((c) =>
        sourceRangeToTimeline(project.clips, c.start, c.end).map((r, i) => ({ key: `${c.id}-${i}`, id: c.id, start: r.start, end: r.end, text: captionText(c) })),
      ),
    [project.captions, project.clips],
  );
  const textBlocks = useMemo(
    () =>
      project.texts.flatMap((t) =>
        sourceRangeToTimeline(project.clips, t.start, t.end).map((r, i) => ({ key: `${t.id}-${i}`, id: t.id, start: r.start, end: r.end, text: t.text })),
      ),
    [project.texts, project.clips],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TimeReadout total={total / project.speed} speed={project.speed} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="remove-circle-outline" size={20} color={colors.textDim} onPress={() => setZoom((z) => Math.max(0.25, z / 1.5))} label="Zoom out" />
          <IconButton icon="add-circle-outline" size={20} color={colors.textDim} onPress={() => setZoom((z) => Math.min(6, z * 1.5))} label="Zoom in" />
        </View>
      </View>
      <View>
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onTouchStart={() => {
            touching.current = true;
          }}
          onTouchEnd={() => {
            touching.current = false;
            touchEndAt.current = Date.now();
          }}
          onTouchCancel={() => {
            touching.current = false;
            touchEndAt.current = Date.now();
          }}
          onScrollBeginDrag={() => {
            userScrolling.current = true;
            onScrubStart();
          }}
          onScrollEndDrag={() => {
            userScrolling.current = false;
          }}
          onMomentumScrollBegin={() => {
            momentum.current = true;
          }}
          onMomentumScrollEnd={() => {
            momentum.current = false;
          }}
          contentContainerStyle={{ paddingHorizontal: half, paddingVertical: 6 }}
        >
          <View style={{ width: Math.max(total * pps, 1) }}>
            <Ruler total={total} pps={pps} />
            {/* video track */}
            <View style={[styles.track, { height: 54 }]}>
              {project.clips.map((c, i) => {
                const sel = selection?.kind === 'clip' && selection.id === c.id;
                const w = (c.end - c.start) * pps;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      tap();
                      select(sel ? null : { kind: 'clip', id: c.id });
                    }}
                    style={[styles.clip, { left: offsets[i] * pps, width: Math.max(w - 2, 2) }, sel && styles.selected]}
                  >
                    <ClipThumbs start={c.start} end={c.end} width={w} pps={pps} thumbnails={thumbnails} />
                  </Pressable>
                );
              })}
            </View>
            {/* captions track */}
            <View style={[styles.track, { height: 34, marginTop: 6 }]}>
              {captionBlocks.length === 0 ? (
                <View style={styles.emptyTrack}>
                  <Ionicons name="sparkles" size={12} color={colors.textMute} />
                  <T style={{ color: colors.textMute, fontSize: 11 }}>Captions appear here</T>
                </View>
              ) : null}
              {captionBlocks.map((b) => {
                const sel = selection?.kind === 'caption' && selection.id === b.id;
                return (
                  <Pressable
                    key={b.key}
                    onPress={() => {
                      tap();
                      select(sel ? null : { kind: 'caption', id: b.id });
                      onSeek(b.start + 0.01);
                    }}
                    style={[styles.block, { left: b.start * pps, width: Math.max((b.end - b.start) * pps - 2, 3), backgroundColor: sel ? colors.caption : '#2B2350' }, sel && styles.selected]}
                  >
                    <T numberOfLines={1} weight="semibold" style={{ fontSize: 10, color: '#fff' }}>
                      {b.text}
                    </T>
                  </Pressable>
                );
              })}
            </View>
            {/* text track */}
            <View style={[styles.track, { height: 28, marginTop: 6 }]}>
              {textBlocks.map((b) => {
                const sel = selection?.kind === 'text' && selection.id === b.id;
                return (
                  <Pressable
                    key={b.key}
                    onPress={() => {
                      tap();
                      select(sel ? null : { kind: 'text', id: b.id });
                    }}
                    style={[styles.block, { left: b.start * pps, width: Math.max((b.end - b.start) * pps - 2, 3), backgroundColor: sel ? colors.textTrack : '#4A2C17' }, sel && styles.selected]}
                  >
                    <Ionicons name="text" size={10} color="#fff" />
                    <T numberOfLines={1} weight="semibold" style={{ fontSize: 10, color: '#fff', flexShrink: 1 }}>
                      {b.text}
                    </T>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
        <View pointerEvents="none" style={[styles.playhead, { left: half - 1 }]}>
          <View style={styles.playheadKnob} />
        </View>
      </View>
    </View>
  );
}

function TimeReadout({ total, speed }: { total: number; speed: number }) {
  const t = usePlayback((s) => s.timelineTime);
  return (
    <T weight="semibold" style={{ fontVariant: ['tabular-nums'], fontSize: 13 }}>
      {formatTime(t / speed, true)} <T style={{ color: colors.textMute, fontSize: 13 }}>/ {formatTime(total, true)}</T>
    </T>
  );
}

const Ruler = memo(function Ruler({ total, pps }: { total: number; pps: number }) {
  const step = pps < 20 ? 10 : pps < 40 ? 5 : pps < 90 ? 2 : 1;
  const marks = [];
  for (let s = 0; s <= total; s += step) marks.push(s);
  return (
    <View style={{ height: 16 }}>
      {marks.map((s) => (
        <View key={s} style={{ position: 'absolute', left: s * pps, alignItems: 'flex-start' }}>
          <View style={{ width: 1, height: 5, backgroundColor: colors.textMute }} />
          <T style={{ fontSize: 9, color: colors.textMute, marginLeft: -4 }}>{formatTime(s)}</T>
        </View>
      ))}
    </View>
  );
});

const ClipThumbs = memo(function ClipThumbs({ start, end, width, pps, thumbnails }: { start: number; end: number; width: number; pps: number; thumbnails: { time: number; thumb: VideoThumbnail }[] }) {
  if (!thumbnails.length) {
    return <LinearGradient colors={['#2F6BFF', '#7C5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />;
  }
  const count = Math.max(1, Math.ceil(width / THUMB_W));
  const items = [];
  for (let i = 0; i < count; i++) {
    const t = start + ((i * THUMB_W) / pps);
    if (t > end) break;
    let best = thumbnails[0];
    for (const th of thumbnails) if (Math.abs(th.time - t) < Math.abs(best.time - t)) best = th;
    items.push(<Image key={i} source={best.thumb} style={{ width: THUMB_W, height: '100%' }} contentFit="cover" />);
  }
  return <View style={{ flexDirection: 'row', ...StyleSheet.absoluteFill }}>{items}</View>;
});

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, paddingBottom: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  track: { position: 'relative' },
  clip: { position: 'absolute', top: 0, bottom: 0, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.clip },
  block: { position: 'absolute', top: 0, bottom: 0, borderRadius: 6, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', gap: 4, overflow: 'hidden' },
  selected: { borderWidth: 2, borderColor: colors.lime },
  emptyTrack: { flexDirection: 'row', alignItems: 'center', gap: 6, height: '100%', paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, width: 180 },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#fff', borderRadius: 1 },
  playheadKnob: { position: 'absolute', top: -2, left: -5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },
});
