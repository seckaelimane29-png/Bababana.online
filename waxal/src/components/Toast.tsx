import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { create } from 'zustand';

import { T } from '@/components/ui';

const useToastStore = create<{ msg: string | null; n: number }>(() => ({ msg: null, n: 0 }));

export function toast(msg: string) {
  useToastStore.setState((s) => ({ msg, n: s.n + 1 }));
}

export function ToastHost() {
  const { msg, n } = useToastStore();
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!msg) return;
    o.setValue(0);
    Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(o, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [n, msg, o]);
  if (!msg) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity: o, transform: [{ translateY: o.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
      <T weight="semibold" style={{ fontSize: 13 }}>
        {msg}
      </T>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', top: 70, alignSelf: 'center', backgroundColor: 'rgba(30,30,44,0.96)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: '#33334A' },
});
