import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, T } from '@/components/ui';
import { colors } from '@/theme';

type Props = { title: string; onClose: () => void; children: ReactNode; maxHeight?: `${number}%`; footer?: ReactNode };

/** Bottom sheet that floats above the editor (no backdrop, so the video stays visible while you tweak). */
export function Sheet({ title, onClose, children, maxHeight = '58%', footer }: Props) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(400)).current;
  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 4 }).start();
  }, [y]);
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]} pointerEvents="box-none">
      <Animated.View style={[styles.sheet, { maxHeight, paddingBottom: insets.bottom + 8, transform: [{ translateY: y }] }]}>
        <View style={styles.grabber} />
        <View style={styles.head}>
          <T weight="bold" style={{ fontSize: 17 }}>
            {title}
          </T>
          <IconButton icon="checkmark-circle" size={28} color={colors.lime} onPress={onClose} label="Done" />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12 }}>
          {children}
        </ScrollView>
        {footer ? <View style={{ paddingHorizontal: 18, paddingTop: 8 }}>{footer}</View> : null}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

export function Row({ children, gap = 8, wrap = true }: { children: ReactNode; gap?: number; wrap?: boolean }) {
  return <View style={{ flexDirection: 'row', flexWrap: wrap ? 'wrap' : 'nowrap', gap, alignItems: 'center' }}>{children}</View>;
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.toggleRow}>
      <T weight="semibold">{label}</T>
      <View style={[styles.toggle, value && { backgroundColor: colors.accent }]}>
        <View style={[styles.knob, value && { transform: [{ translateX: 18 }] }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.surface3, marginTop: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  toggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.surface3, padding: 3 },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
});
