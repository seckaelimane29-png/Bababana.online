import { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { StrokeText } from '@/components/StyledText';
import { FONTS } from '@/lib/fonts';
import { usePlayback } from '@/store/playback';
import type { Caption, CaptionStyle, Word } from '@/types';

function findCaption(captions: Caption[], t: number): Caption | null {
  // Captions are sorted; a simple scan is plenty fast for a few hundred lines.
  for (const c of captions) if (t >= c.start && t < c.end) return c;
  return null;
}

function activeIndex(words: Word[], t: number): number {
  let idx = -1;
  for (let i = 0; i < words.length; i++) if (t >= words[i].start) idx = i;
  return idx;
}

type Props = { captions: Caption[]; style: CaptionStyle; width: number; height: number; preview?: Caption | null };

export function CaptionOverlay({ captions, style, width, height, preview }: Props) {
  const time = usePlayback((s) => s.time);
  const caption = preview ?? findCaption(captions, time);
  const active = caption ? (preview ? Math.min(1, caption.words.length - 1) : activeIndex(caption.words, time)) : -1;
  if (!caption || !caption.words.length) return null;
  return <CaptionLine key={caption.id} caption={caption} active={active} style={style} width={width} height={height} />;
}

const SAMPLE_WORDS = ['The', 'quick', 'brown', 'fox'];

/** Static preview of a caption style (used by the template picker). */
export function CaptionSample({ style, width, height }: { style: CaptionStyle; width: number; height: number }) {
  const caption: Caption = {
    id: 'sample',
    start: 0,
    end: 4,
    words: SAMPLE_WORDS.slice(0, Math.max(2, Math.min(3, style.wordsPerLine))).map((text, i) => ({ id: `s${i}`, text, start: i, end: i + 1 })),
  };
  // Tiles are small, so scale the type up and center it.
  const sampleStyle = { ...style, positionY: 0.5, size: Math.min(0.16, style.size * 1.75) };
  return (
    <View style={{ width, height }} pointerEvents="none">
      <CaptionLine caption={caption} active={1} style={sampleStyle} width={width} height={height} />
    </View>
  );
}

function CaptionLine({ caption, active, style, width, height }: { caption: Caption; active: number; style: CaptionStyle; width: number; height: number }) {
  const fontSize = Math.max(10, style.size * width);
  const stroke = (style.strokeWidth * width) / 1080;
  const appear = useRef(new Animated.Value(style.animation === 'none' ? 1 : 0)).current;

  useEffect(() => {
    if (style.animation === 'none') return;
    Animated.spring(appear, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }, [appear, style.animation]);

  const emoji = caption.words.find((w) => w.emoji)?.emoji;
  const lineStyle = useMemo(
    () => ({
      fontFamily: FONTS[style.font].family,
      fontSize,
      lineHeight: fontSize * 1.18,
      textAlign: 'center' as const,
      ...(style.shadow ? { textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: fontSize * 0.06 }, textShadowRadius: fontSize * 0.12 } : {}),
    }),
    [style.font, fontSize, style.shadow],
  );

  const containerAnim =
    style.animation === 'fade'
      ? { opacity: appear }
      : style.animation === 'none'
        ? {}
        : { opacity: appear, transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: width * 0.06,
          right: width * 0.06,
          top: style.positionY * height,
          transform: [{ translateY: -fontSize * 0.7 }],
          alignItems: 'center',
        },
        containerAnim,
      ]}
    >
      {emoji ? <Text style={{ fontSize: fontSize * 1.1, marginBottom: 2 }}>{emoji}</Text> : null}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: fontSize * 0.34,
          backgroundColor: style.background ?? 'transparent',
          paddingHorizontal: style.background ? fontSize * 0.4 : 0,
          paddingVertical: style.background ? fontSize * 0.15 : 0,
          borderRadius: fontSize * 0.25,
        }}
      >
        {caption.words.map((w, i) => (
          <CaptionWord key={w.id} word={w} index={i} active={active} style={style} lineStyle={lineStyle} stroke={stroke} />
        ))}
      </View>
    </Animated.View>
  );
}

function CaptionWord({ word, index, active, style, lineStyle, stroke }: { word: Word; index: number; active: number; style: CaptionStyle; lineStyle: object; stroke: number }) {
  const isActive = index === active;
  const spoken = index <= active;
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      scale.setValue(1);
      lift.setValue(0);
      return;
    }
    if (style.animation === 'pop') {
      scale.setValue(0.9);
      Animated.spring(scale, { toValue: 1.08, useNativeDriver: true, speed: 40, bounciness: 14 }).start();
    } else if (style.animation === 'bounce') {
      lift.setValue(0);
      Animated.sequence([
        Animated.timing(lift, { toValue: -1, duration: 90, useNativeDriver: true }),
        Animated.spring(lift, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 16 }),
      ]).start();
    }
  }, [isActive, style.animation, scale, lift]);

  let color = word.emphasis ? style.emphasisColor : style.color;
  if (style.animation === 'karaoke' ? spoken : isActive && style.animation !== 'none') color = style.highlightColor;
  const text = style.uppercase ? word.text.toUpperCase() : word.text;
  const fontSize = (lineStyle as { fontSize: number }).fontSize;
  const boxed = isActive && !!style.highlightBg;
  const glow = style.glow ? { textShadowColor: style.glow, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: fontSize * 0.45 } : null;

  return (
    <Animated.View
      style={{
        transform: [{ scale }, { translateY: Animated.multiply(lift, fontSize * 0.25) }],
        backgroundColor: boxed ? style.highlightBg! : 'transparent',
        borderRadius: fontSize * 0.22,
        paddingHorizontal: style.highlightBg ? fontSize * 0.14 : 0,
      }}
    >
      <StrokeText text={text} stroke={stroke} strokeColor={style.strokeColor} style={{ ...lineStyle, ...glow, color }} />
    </Animated.View>
  );
}
