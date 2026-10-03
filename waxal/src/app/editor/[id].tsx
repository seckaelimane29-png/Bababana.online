import { Ionicons } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, type VideoThumbnail } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaptionsPanel, MagicPanel } from '@/components/panels/AIPanel';
import { SpeedPanel, VolumePanel } from '@/components/panels/AudioPanels';
import { StylePanel } from '@/components/panels/StylePanel';
import { TextPanel } from '@/components/panels/TextPanel';
import { TranscriptPanel } from '@/components/panels/TranscriptPanel';
import { Timeline } from '@/components/Timeline';
import { toast, ToastHost } from '@/components/Toast';
import { Toolbar, type Tool } from '@/components/Toolbar';
import { IconButton, T } from '@/components/ui';
import { VideoStage } from '@/components/VideoStage';
import { splitCaptionAt } from '@/lib/captions';
import { uid } from '@/lib/id';
import { clipOffsets, sourceToTimeline, timelineDuration, timelineToSource } from '@/lib/timeline';
import { useEditor } from '@/store/projects';
import { usePlayback } from '@/store/playback';
import { colors } from '@/theme';
import type { Project } from '@/types';

type Panel = 'captions' | 'magic' | 'style' | 'volume' | 'speed' | 'transcript' | { text: string } | null;

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = useEditor((s) => s.project);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    usePlayback.getState().set({ time: 0, timelineTime: 0, playing: false });
    useEditor
      .getState()
      .open(id)
      .then((ok) => setMissing(!ok));
    return () => useEditor.getState().close();
  }, [id]);

  if (missing) {
    return (
      <View style={[styles.screen, styles.center]}>
        <T>Project not found.</T>
      </View>
    );
  }
  if (!project || project.id !== id) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return <Editor videoUri={project.videoUri} />;
}

function Editor({ videoUri }: { videoUri: string }) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const project = useEditor((s) => s.project)!;
  const { selection, select, update, undo, redo, past, future } = useEditor();
  const [panel, setPanel] = useState<Panel>(null);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [thumbs, setThumbs] = useState<{ time: number; thumb: VideoThumbnail }[]>([]);

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0;
  });

  const clipIndex = useRef(0);
  const projectRef = useRef<Project>(project);
  projectRef.current = project;

  // ---- audio settings -> player
  useEffect(() => {
    player.volume = Math.min(1, project.volume);
    player.muted = project.muted || project.volume === 0;
  }, [player, project.volume, project.muted]);
  useEffect(() => {
    player.playbackRate = project.speed;
  }, [player, project.speed]);

  // ---- metadata + timeline thumbnails
  useEventListener(player, 'sourceLoad', ({ duration }) => {
    const p = projectRef.current;
    if ((!p.duration || p.clips.length === 0) && duration > 0) {
      update((x) => ({ ...x, duration, clips: x.clips.length ? x.clips : [{ id: uid('k'), start: 0, end: duration }] }), { history: false });
    }
    if (Platform.OS !== 'web' && duration > 0) {
      const count = Math.min(60, Math.max(8, Math.ceil(duration)));
      const times = Array.from({ length: count }, (_, i) => (i * duration) / count);
      player
        .generateThumbnailsAsync(times, { maxWidth: 120 })
        .then((list) => setThumbs(list.map((thumb, i) => ({ time: times[i], thumb }))))
        .catch(() => {});
    }
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => usePlayback.getState().set({ playing: isPlaying }));

  // On the web the player never fires 'sourceLoad', so read the length once the browser knows it.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const timer = setInterval(() => {
      const duration = player.duration;
      if (!duration || !Number.isFinite(duration)) return;
      clearInterval(timer);
      const p = projectRef.current;
      if (!p.duration || p.clips.length === 0) {
        update((x) => ({ ...x, duration, clips: x.clips.length ? x.clips : [{ id: uid('k'), start: 0, end: duration }] }), { history: false });
      }
      // iPhone Safari shows a grey box until it decodes a frame; nudging the time makes it draw the first frame.
      if (player.currentTime === 0) player.currentTime = 0.05;
    }, 250);
    return () => clearInterval(timer);
  }, [player, update]);

  // ---- playback clock: follows clips, skipping removed parts
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = projectRef.current;
      const clips = p.clips;
      if (clips.length) {
        let idx = Math.min(clipIndex.current, clips.length - 1);
        let t = player.currentTime;
        const clip = clips[idx];
        if (player.playing) {
          if (t >= clip.end - 0.03) {
            if (idx + 1 < clips.length) {
              idx += 1;
              t = clips[idx].start;
              player.currentTime = t;
            } else {
              player.pause();
              t = clip.end;
            }
          } else if (t < clip.start - 0.25) {
            player.currentTime = clip.start;
            t = clip.start;
          }
        }
        clipIndex.current = idx;
        const offsets = clipOffsets(clips);
        const tl = offsets[idx] + Math.min(Math.max(t - clips[idx].start, 0), clips[idx].end - clips[idx].start);
        const st = usePlayback.getState();
        if (Math.abs(st.time - t) > 0.001 || Math.abs(st.timelineTime - tl) > 0.001) st.set({ time: t, timelineTime: tl });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [player]);

  const seekTimeline = useCallback(
    (t: number) => {
      const clips = projectRef.current.clips;
      if (!clips.length) return;
      const { index, source } = timelineToSource(clips, t);
      clipIndex.current = index;
      player.currentTime = source;
      usePlayback.getState().set({ time: source, timelineTime: t });
    },
    [player],
  );

  const seekSource = useCallback(
    (s: number) => {
      const clips = projectRef.current.clips;
      seekTimeline(sourceToTimeline(clips, s));
    },
    [seekTimeline],
  );

  const togglePlay = useCallback(() => {
    if (player.playing) {
      player.pause();
      return;
    }
    const total = timelineDuration(projectRef.current.clips);
    if (usePlayback.getState().timelineTime >= total - 0.05) seekTimeline(0);
    player.play();
  }, [player, seekTimeline]);

  // ---- editing actions
  const playhead = () => usePlayback.getState();

  const split = () => {
    const { time, timelineTime } = playhead();
    if (selection?.kind === 'caption') {
      const c = project.captions.find((x) => x.id === selection.id);
      const parts = c && splitCaptionAt(c, time);
      if (!parts) return toast('Move the playhead inside the caption to split it');
      update((p) => ({ ...p, captions: p.captions.flatMap((x) => (x.id === c!.id ? parts : [x])) }));
      select({ kind: 'caption', id: parts[1].id });
      return;
    }
    if (selection?.kind === 'text') {
      const t = project.texts.find((x) => x.id === selection.id);
      if (!t || time <= t.start + 0.1 || time >= t.end - 0.1) return toast('Move the playhead inside the text to split it');
      const second = { ...t, id: uid('t'), start: time };
      update((p) => ({ ...p, texts: p.texts.flatMap((x) => (x.id === t.id ? [{ ...x, end: time }, second] : [x])) }));
      return;
    }
    const { index, source } = timelineToSource(project.clips, timelineTime);
    const c = project.clips[index];
    if (!c || source - c.start < 0.1 || c.end - source < 0.1) return toast('Move the playhead away from the edge to split');
    const a = { id: uid('k'), start: c.start, end: source };
    const b = { id: uid('k'), start: source, end: c.end };
    update((p) => ({ ...p, clips: p.clips.flatMap((x) => (x.id === c.id ? [a, b] : [x])) }));
    select({ kind: 'clip', id: b.id });
    toast('Split');
  };

  const remove = () => {
    if (!selection) {
      const { timelineTime } = playhead();
      const { index } = timelineToSource(project.clips, timelineTime);
      const c = project.clips[index];
      if (c) select({ kind: 'clip', id: c.id });
      return toast('Tap delete again to remove the selected clip');
    }
    if (selection.kind === 'clip') {
      if (project.clips.length <= 1) return toast("Can't delete the only clip");
      update((p) => ({ ...p, clips: p.clips.filter((c) => c.id !== selection.id) }));
      clipIndex.current = 0;
      setTimeout(() => seekTimeline(Math.min(playhead().timelineTime, timelineDuration(useEditor.getState().project!.clips) - 0.01)), 0);
    } else if (selection.kind === 'caption') {
      update((p) => ({ ...p, captions: p.captions.filter((c) => c.id !== selection.id) }));
    } else if (selection.kind === 'text') {
      update((p) => ({ ...p, texts: p.texts.filter((t) => t.id !== selection.id) }));
    }
    select(null);
    toast('Deleted');
  };

  const addText = () => {
    const { time, timelineTime } = playhead();
    const { index } = timelineToSource(project.clips, timelineTime);
    const clipEnd = project.clips[index]?.end ?? project.duration;
    const t = {
      id: uid('t'),
      text: 'Your text',
      start: time,
      end: Math.min(time + 3, Math.max(clipEnd, time + 0.5)),
      x: 0.5,
      y: 0.3,
      font: 'montserrat' as const,
      size: 0.075,
      color: '#FFFFFF',
      background: null,
      strokeColor: '#000000',
    };
    update((p) => ({ ...p, texts: [...p.texts, t] }));
    select({ kind: 'text', id: t.id });
    setPanel({ text: t.id });
  };

  const trim = (side: 'left' | 'right') => {
    if (selection?.kind !== 'clip') return;
    const { time } = playhead();
    const c = project.clips.find((x) => x.id === selection.id);
    if (!c || time <= c.start + 0.05 || time >= c.end - 0.05) return toast('Put the playhead inside the selected clip');
    update((p) => ({ ...p, clips: p.clips.map((x) => (x.id === c.id ? (side === 'left' ? { ...x, start: time } : { ...x, end: time }) : x)) }));
    if (side === 'left') setTimeout(() => seekSource(time + 0.01), 0);
  };

  const duplicate = () => {
    if (selection?.kind === 'clip') {
      update((p) => ({ ...p, clips: p.clips.flatMap((x) => (x.id === selection.id ? [x, { ...x, id: uid('k') }] : [x])) }));
      toast('Clip duplicated');
    } else if (selection?.kind === 'text') {
      const t = project.texts.find((x) => x.id === selection.id);
      if (!t) return;
      const copy = { ...t, id: uid('t'), y: Math.min(0.95, t.y + 0.08) };
      update((p) => ({ ...p, texts: [...p.texts, copy] }));
      select({ kind: 'text', id: copy.id });
    }
  };

  const mergeNext = () => {
    if (selection?.kind !== 'caption') return;
    const i = project.captions.findIndex((c) => c.id === selection.id);
    const a = project.captions[i];
    const b = project.captions[i + 1];
    if (!a || !b) return toast('No caption after this one');
    const merged = { ...a, end: b.end, words: [...a.words, ...b.words] };
    update((p) => ({ ...p, captions: p.captions.filter((c) => c.id !== b.id).map((c) => (c.id === a.id ? merged : c)) }));
  };

  const confirmReset = () => {
    const doIt = () => {
      update((p) => ({ ...p, clips: [{ id: uid('k'), start: 0, end: p.duration }] }));
      seekTimeline(0);
    };
    if (Platform.OS === 'web') return window.confirm('Restore the full original video? (Undo is available)') && doIt();
    Alert.alert('Restore original?', 'Brings back every part you cut. You can undo this.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: doIt },
    ]);
  };

  const tools: Tool[] = useMemo(() => {
    if (selection?.kind === 'clip')
      return [
        { key: 'split', icon: 'cut', label: 'Split', onPress: split },
        { key: 'trimL', icon: 'arrow-back-circle-outline', label: 'Trim start', onPress: () => trim('left') },
        { key: 'trimR', icon: 'arrow-forward-circle-outline', label: 'Trim end', onPress: () => trim('right') },
        { key: 'dup', icon: 'copy-outline', label: 'Duplicate', onPress: duplicate },
        { key: 'vol', icon: 'volume-high', label: 'Volume', onPress: () => setPanel('volume') },
        { key: 'speed', icon: 'speedometer', label: 'Speed', onPress: () => setPanel('speed') },
        { key: 'del', icon: 'trash', label: 'Delete', onPress: remove, danger: true },
      ];
    if (selection?.kind === 'caption')
      return [
        { key: 'edit', icon: 'create-outline', label: 'Edit', onPress: () => setPanel('transcript') },
        { key: 'split', icon: 'cut', label: 'Split', onPress: split },
        { key: 'merge', icon: 'git-merge-outline', label: 'Merge next', onPress: mergeNext },
        { key: 'style', icon: 'color-palette', label: 'Style', onPress: () => setPanel('style') },
        { key: 'del', icon: 'trash', label: 'Delete', onPress: remove, danger: true },
      ];
    if (selection?.kind === 'text')
      return [
        { key: 'edit', icon: 'create-outline', label: 'Edit', onPress: () => setPanel({ text: selection.id }) },
        { key: 'split', icon: 'cut', label: 'Split', onPress: split },
        { key: 'dup', icon: 'copy-outline', label: 'Duplicate', onPress: duplicate },
        { key: 'del', icon: 'trash', label: 'Delete', onPress: remove, danger: true },
      ];
    return [
      { key: 'captions', icon: 'sparkles', label: 'Captions', onPress: () => setPanel('captions'), accent: true },
      { key: 'text', icon: 'text', label: 'Add text', onPress: addText },
      { key: 'style', icon: 'color-palette', label: 'Style', onPress: () => setPanel('style') },
      { key: 'split', icon: 'cut', label: 'Split', onPress: split },
      { key: 'delete', icon: 'trash-outline', label: 'Delete', onPress: remove },
      { key: 'transcript', icon: 'document-text-outline', label: 'Transcript', onPress: () => setPanel('transcript') },
      { key: 'magic', icon: 'flash', label: 'AI Magic', onPress: () => setPanel('magic') },
      { key: 'vol', icon: project.muted ? 'volume-mute' : 'volume-high', label: 'Volume', onPress: () => setPanel('volume') },
      { key: 'speed', icon: 'speedometer', label: 'Speed', onPress: () => setPanel('speed') },
      { key: 'reset', icon: 'refresh', label: 'Restore', onPress: confirmReset },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, project]);

  // Stage size: fit the video's aspect ratio in the available area.
  const aspect = project.width && project.height ? project.width / project.height : 9 / 16;
  let stageW = Math.min(area.w - 24, screenW - 24);
  let stageH = stageW / aspect;
  if (stageH > area.h - 16) {
    stageH = area.h - 16;
    stageW = stageH * aspect;
  }

  const closePanel = () => setPanel(null);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* top bar */}
      <View style={styles.topBar}>
        <IconButton icon="close" onPress={() => router.back()} label="Close" />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <T weight="bold" numberOfLines={1} style={{ fontSize: 15, maxWidth: 170 }}>
            {project.name}
          </T>
        </View>
        <IconButton icon="arrow-undo" disabled={!past.length} onPress={undo} label="Undo" />
        <IconButton icon="arrow-redo" disabled={!future.length} onPress={redo} label="Redo" />
        <Pressable onPress={() => router.push({ pathname: '/export/[id]', params: { id: project.id } })} style={styles.exportBtn}>
          <T weight="bold" style={{ fontSize: 14, color: '#0B0B10' }}>
            Export
          </T>
        </Pressable>
      </View>

      {/* video */}
      <Pressable style={styles.stageArea} onPress={() => select(null)} onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {area.w > 0 && stageW > 0 ? <VideoStage player={player} width={stageW} height={stageH} onTogglePlay={togglePlay} onEditText={(tid) => setPanel({ text: tid })} /> : null}
      </Pressable>

      <PlayBar onToggle={togglePlay} onSeek={seekTimeline} />

      <Timeline
        width={screenW}
        thumbnails={thumbs}
        onSeek={seekTimeline}
        onScrubStart={() => {
          if (player.playing) player.pause();
        }}
      />

      <View style={{ paddingBottom: insets.bottom + 4, backgroundColor: colors.bg }}>
        <Toolbar tools={tools} onBack={selection ? () => select(null) : undefined} title={selection ? selection.kind : undefined} />
      </View>

      {panel === 'captions' ? <CaptionsPanel onClose={closePanel} /> : null}
      {panel === 'magic' ? <MagicPanel onClose={closePanel} /> : null}
      {panel === 'style' ? <StylePanel onClose={closePanel} /> : null}
      {panel === 'volume' ? <VolumePanel onClose={closePanel} /> : null}
      {panel === 'speed' ? <SpeedPanel onClose={closePanel} /> : null}
      {panel === 'transcript' ? <TranscriptPanel onClose={closePanel} onSeekSource={seekSource} /> : null}
      {panel && typeof panel === 'object' ? <TextPanel id={panel.text} onClose={closePanel} /> : null}
      <ToastHost />
    </View>
  );
}

function PlayBar({ onToggle, onSeek }: { onToggle: () => void; onSeek: (t: number) => void }) {
  const playing = usePlayback((s) => s.playing);
  const muted = useEditor((s) => s.project!.muted);
  const update = useEditor((s) => s.update);
  const jump = (d: number) => {
    const total = timelineDuration(useEditor.getState().project!.clips);
    onSeek(Math.min(total, Math.max(0, usePlayback.getState().timelineTime + d)));
  };
  return (
    <View style={styles.playBar}>
      <IconButton icon="play-skip-back" size={20} color={colors.textDim} onPress={() => onSeek(0)} label="Go to start" />
      <IconButton icon="play-back" size={20} color={colors.textDim} onPress={() => jump(-2)} label="Back 2 seconds" />
      <Pressable onPress={onToggle} style={styles.playBtn} accessibilityLabel={playing ? 'Pause' : 'Play'}>
        <Ionicons name={playing ? 'pause' : 'play'} size={24} color="#0B0B10" style={{ marginLeft: playing ? 0 : 3 }} />
      </Pressable>
      <IconButton icon="play-forward" size={20} color={colors.textDim} onPress={() => jump(2)} label="Forward 2 seconds" />
      <IconButton icon={muted ? 'volume-mute' : 'volume-medium'} size={20} color={muted ? colors.danger : colors.textDim} onPress={() => update((p) => ({ ...p, muted: !p.muted }))} label="Mute" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 52, gap: 2 },
  exportBtn: { backgroundColor: colors.lime, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, marginLeft: 6 },
  stageArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 6 },
  playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
