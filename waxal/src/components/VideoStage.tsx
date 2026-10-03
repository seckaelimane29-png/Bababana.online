import { Ionicons } from '@expo/vector-icons';
import { VideoView, type VideoPlayer } from 'expo-video';
import { useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';

import { CaptionOverlay } from '@/components/CaptionOverlay';
import { StrokeText } from '@/components/StyledText';
import { FONTS } from '@/lib/fonts';
import { useEditor } from '@/store/projects';
import { usePlayback } from '@/store/playback';
import { colors } from '@/theme';
import type { TextOverlay } from '@/types';

type Props = {
  player: VideoPlayer;
  width: number;
  height: number;
  onTogglePlay: () => void;
  onEditText: (id: string) => void;
};

export function VideoStage({ player, width, height, onTogglePlay, onEditText }: Props) {
  const project = useEditor((s) => s.project)!;
  const playing = usePlayback((s) => s.playing);

  return (
    <View style={[styles.stage, { width, height }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
        // iPhone Safari: play inside the page instead of jumping to fullscreen.
        playsInline
        surfaceType="textureView"
      />
      <Pressable style={StyleSheet.absoluteFill} onPress={onTogglePlay}>
        {!playing ? (
          <View style={styles.playBadge}>
            <Ionicons name="play" size={30} color="#fff" style={{ marginLeft: 4 }} />
          </View>
        ) : null}
      </Pressable>
      <CaptionOverlay captions={project.captions} style={project.style} width={width} height={height} />
      <CaptionDragBand width={width} height={height} onTap={onTogglePlay} />
      {project.texts.map((t) => (
        <TextOverlayView key={t.id} overlay={t} width={width} height={height} onEdit={onEditText} />
      ))}
    </View>
  );
}

/** Drag the captions up or down to reposition them. */
function CaptionDragBand({ width, height, onTap }: { width: number; height: number; onTap: () => void }) {
  const project = useEditor((s) => s.project)!;
  const hasCaption = usePlayback((s) => project.captions.some((c) => s.time >= c.start && s.time < c.end));
  const startY = useRef(0);
  const moved = useRef(false);
  const dims = useRef({ height, onTap });
  dims.current = { height, onTap };
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        moved.current = false;
        startY.current = useEditor.getState().project!.style.positionY;
      },
      onPanResponderMove: (_e, g) => {
        if (!moved.current && Math.abs(g.dy) < 4) return;
        if (!moved.current) useEditor.getState().checkpoint();
        moved.current = true;
        const y = Math.min(0.92, Math.max(0.08, startY.current + g.dy / dims.current.height));
        useEditor.getState().update((p) => ({ ...p, style: { ...p.style, positionY: y } }), { history: false });
      },
      onPanResponderRelease: () => {
        if (!moved.current) dims.current.onTap();
      },
    }),
  ).current;
  if (!hasCaption) return null;
  const band = Math.max(44, project.style.size * width * 2.6);
  return <View {...responder.panHandlers} style={{ position: 'absolute', left: 0, right: 0, top: project.style.positionY * height - band / 2, height: band }} />;
}

function TextOverlayView({ overlay, width, height, onEdit }: { overlay: TextOverlay; width: number; height: number; onEdit: (id: string) => void }) {
  const visible = usePlayback((s) => s.time >= overlay.start && s.time < overlay.end);
  const selected = useEditor((s) => s.selection?.kind === 'text' && s.selection.id === overlay.id);
  const start = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const moved = useRef(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const ctx = useRef({ width, height, overlay, onEdit });
  ctx.current = { width, height, overlay, onEdit };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        moved.current = false;
        start.current = { x: ctx.current.overlay.x, y: ctx.current.overlay.y };
        const ed = useEditor.getState();
        ed.select({ kind: 'text', id: ctx.current.overlay.id });
      },
      onPanResponderMove: (_e, g) => {
        if (!moved.current && Math.abs(g.dx) + Math.abs(g.dy) < 4) return;
        if (!moved.current) useEditor.getState().checkpoint();
        moved.current = true;
        const { width: w, height: h, overlay: o } = ctx.current;
        const x = Math.min(0.98, Math.max(0.02, start.current.x + g.dx / w));
        const y = Math.min(0.98, Math.max(0.02, start.current.y + g.dy / h));
        useEditor.getState().update((p) => ({ ...p, texts: p.texts.map((t) => (t.id === o.id ? { ...t, x, y } : t)) }), { history: false });
      },
      onPanResponderRelease: () => {
        if (moved.current) return;
        const now = Date.now();
        if (now - lastTap.current < 320) ctx.current.onEdit(ctx.current.overlay.id);
        lastTap.current = now;
      },
    }),
  ).current;

  if (!visible && !selected) return null;
  const fontSize = Math.max(10, overlay.size * width);
  return (
    <View
      {...responder.panHandlers}
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={{
        position: 'absolute',
        left: overlay.x * width - box.w / 2,
        top: overlay.y * height - box.h / 2,
        maxWidth: width * 0.9,
        opacity: visible ? 1 : 0.45,
      }}
    >
      <View
        style={{
          backgroundColor: overlay.background ?? 'transparent',
          paddingHorizontal: overlay.background ? fontSize * 0.45 : 4,
          paddingVertical: overlay.background ? fontSize * 0.15 : 2,
          borderRadius: fontSize * 0.25,
          borderWidth: selected ? 1.5 : 0,
          borderColor: colors.lime,
          borderStyle: 'dashed',
        }}
      >
        <StrokeText
          text={overlay.text}
          stroke={overlay.strokeColor ? (3 * width) / 1080 : 0}
          strokeColor={overlay.strokeColor ?? '#000'}
          style={{ fontFamily: FONTS[overlay.font].family, fontSize, lineHeight: fontSize * 1.2, color: overlay.color, textAlign: 'center' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // iPhone Safari draws a blank video inside a rounded, clipped box (audio still plays), so skip rounding on web.
  stage: Platform.OS === 'web' ? { backgroundColor: '#000' } : { backgroundColor: '#000', borderRadius: 18, overflow: 'hidden' },
  playBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -34,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
