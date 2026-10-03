import { memo } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';

const OFFSETS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

/** Text with an outline (React Native has no text stroke, so we layer offset copies underneath). */
export const StrokeText = memo(function StrokeText({ text, style, stroke, strokeColor }: { text: string; style: TextStyle; stroke: number; strokeColor: string }) {
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
