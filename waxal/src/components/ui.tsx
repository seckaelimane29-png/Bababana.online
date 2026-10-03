import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, PanResponder, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { UI_FONT } from '@/lib/fonts';
import { colors, gradient, radius } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

export function T({ style, weight = 'regular', children, numberOfLines }: { style?: StyleProp<TextStyle>; weight?: 'regular' | 'semibold' | 'bold'; children: ReactNode; numberOfLines?: number }) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ color: colors.text, fontFamily: UI_FONT[weight], fontSize: 14 }, style]}>
      {children}
    </Text>
  );
}

export function GradientButton({ label, icon, onPress, loading, disabled, style }: { label: string; icon?: IconName; onPress: () => void; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}
    >
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradBtn}>
        {loading ? <ActivityIndicator color="#fff" /> : icon ? <Ionicons name={icon} size={20} color="#fff" /> : null}
        <T weight="bold" style={{ fontSize: 16 }}>
          {label}
        </T>
      </LinearGradient>
    </Pressable>
  );
}

export function SoftButton({ label, icon, onPress, danger, active, style, small }: { label?: string; icon?: IconName; onPress: () => void; danger?: boolean; active?: boolean; style?: StyleProp<ViewStyle>; small?: boolean }) {
  const fg = danger ? colors.danger : active ? '#fff' : colors.text;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.soft,
        small && { paddingVertical: 8, paddingHorizontal: 12 },
        active && { backgroundColor: colors.accent, borderColor: colors.accent },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} /> : null}
      {label ? (
        <T weight="semibold" style={{ color: fg, fontSize: small ? 13 : 14 }}>
          {label}
        </T>
      ) : null}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, disabled, size = 22, color = colors.text, style, label }: { icon: IconName; onPress: () => void; disabled?: boolean; size?: number; color?: string; style?: StyleProp<ViewStyle>; label?: string }) {
  return (
    <Pressable
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={8}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.iconBtn, { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 }, style]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={[styles.chip, active && { backgroundColor: colors.accent, borderColor: colors.accent }]}
    >
      <T weight="semibold" style={{ fontSize: 13, color: active ? '#fff' : colors.textDim }}>
        {label}
      </T>
    </Pressable>
  );
}

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <T weight="semibold" style={{ color: colors.textDim, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
          {title}
        </T>
        {right}
      </View>
      {children}
    </View>
  );
}

/** Lightweight slider (works on iOS, Android and web without extra native modules). */
export function Slider({ value, min, max, step = 0, onChange, onStart, onEnd, format }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; onStart?: () => void; onEnd?: (v: number) => void; format?: (v: number) => string }) {
  const width = useRef(1);
  const latest = useRef(value);
  const origin = useRef(0);
  const cb = useRef({ onChange, onStart, onEnd });
  cb.current = { onChange, onStart, onEnd };
  const valueAt = (x: number) => {
    const r = Math.min(1, Math.max(0, x / width.current));
    let v = min + r * (max - min);
    if (step) v = Math.round(v / step) * step;
    return Number(v.toFixed(4));
  };
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        cb.current.onStart?.();
        // Track from the touch's page position so moves stay accurate whatever view is under the finger.
        origin.current = e.nativeEvent.pageX - e.nativeEvent.locationX;
        latest.current = valueAt(e.nativeEvent.locationX);
        cb.current.onChange(latest.current);
      },
      onPanResponderMove: (_e, g) => {
        latest.current = valueAt(g.moveX - origin.current);
        cb.current.onChange(latest.current);
      },
      onPanResponderRelease: () => cb.current.onEnd?.(latest.current),
    }),
  ).current;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={styles.sliderHit}
        onLayout={(e) => (width.current = e.nativeEvent.layout.width)}
        {...responder.panHandlers}
      >
        <View pointerEvents="none" style={styles.sliderTrack}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${pct}%`, height: '100%', borderRadius: 3 }} />
        </View>
        <View pointerEvents="none" style={[styles.sliderThumb, { left: `${pct}%` }]} />
      </View>
      {format ? (
        <T weight="semibold" style={{ width: 52, textAlign: 'right', color: colors.textDim, fontSize: 13 }}>
          {format(value)}
        </T>
      ) : null}
    </View>
  );
}

export function Swatches({ colorsList, value, onChange, allowNone }: { colorsList: string[]; value: string | null; onChange: (c: string | null) => void; allowNone?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {allowNone ? (
        <Pressable onPress={() => onChange(null)} style={[styles.swatch, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface3 }, value === null && styles.swatchActive]}>
          <Ionicons name="ban" size={16} color={colors.textDim} />
        </Pressable>
      ) : null}
      {colorsList.map((c) => (
        <Pressable
          key={c}
          onPress={() => {
            tap();
            onChange(c);
          }}
          style={[styles.swatch, { backgroundColor: c }, value?.slice(0, 7).toUpperCase() === c.toUpperCase() && styles.swatchActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gradBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 22, borderRadius: radius.pill },
  soft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  sliderHit: { flex: 1, height: 36, justifyContent: 'center' },
  sliderTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surface3, overflow: 'hidden' },
  sliderThumb: { position: 'absolute', width: 22, height: 22, marginLeft: -11, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: colors.border },
  swatchActive: { borderColor: '#fff', transform: [{ scale: 1.12 }] },
});
