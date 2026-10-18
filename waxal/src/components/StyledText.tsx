import { createElement, memo } from 'react';
import { Platform, StyleSheet, Text, View, type TextStyle } from 'react-native';

const OFFSETS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

/** Web: one element with the outline drawn by CSS text-shadows (no blur, cheap to paint over video). */
function WebStrokeText({ text, style, stroke, strokeColor }: { text: string; style: TextStyle; stroke: number; strokeColor: string }) {
  const flat = StyleSheet.flatten(style);
  const shadows: string[] = [];
  if (stroke > 0) {
    const r = Math.max(0.5, stroke);
    // 16 directions give a round outline without blur.
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      shadows.push(`${(Math.cos(a) * r).toFixed(2)}px ${(Math.sin(a) * r).toFixed(2)}px 0 ${strokeColor}`);
    }
  }
  if (flat.textShadowColor && flat.textShadowColor !== 'transparent') {
    const o = flat.textShadowOffset ?? { width: 0, height: 0 };
    shadows.push(`${o.width}px ${o.height}px ${flat.textShadowRadius ?? 0}px ${String(flat.textShadowColor)}`);
  }
  const css = {
    display: 'block',
    whiteSpace: 'pre-wrap',
    fontFamily: flat.fontFamily,
    fontSize: flat.fontSize,
    lineHeight: flat.lineHeight ? `${flat.lineHeight}px` : undefined,
    color: flat.color as string,
    textAlign: flat.textAlign,
    textShadow: shadows.length ? shadows.join(',') : undefined,
  };
  // react-native-web renders to the DOM, so a plain span is fine here.
  return createElement('span', { style: css }, text);
}

/** Text with an outline (React Native has no text stroke, so we layer offset copies underneath). */
export const StrokeText = memo(function StrokeText({ text, style, stroke, strokeColor }: { text: string; style: TextStyle; stroke: number; strokeColor: string }) {
  if (Platform.OS === 'web') return <WebStrokeText text={text} style={style} stroke={stroke} strokeColor={strokeColor} />;
  if (stroke <= 0) return <Text style={style}>{text}</Text>;
  return (
    <View>
      {OFFSETS.map(([x, y], i) => (
        <Text
          key={i}
          style={[style, StyleSheet.absoluteFill, { color: strokeColor, textShadowColor: 'transparent', transform: [{ translateX: x * stroke }, { translateY: y * stroke }] }]}
        >
          {text}
        </Text>
      ))}
      <Text style={style}>{text}</Text>
    </View>
  );
});
