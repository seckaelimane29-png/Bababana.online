import { Pressable, StyleSheet, Text, TextInput } from 'react-native';

import { Row, Sheet, Toggle } from '@/components/Sheet';
import { Chip, Section, Slider, SoftButton, Swatches } from '@/components/ui';
import { FONTS } from '@/lib/fonts';
import { useEditor } from '@/store/projects';
import { usePlayback } from '@/store/playback';
import { colors, SWATCHES } from '@/theme';
import type { FontKey, TextOverlay } from '@/types';

export function TextPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const overlay = useEditor((s) => s.project!.texts.find((t) => t.id === id));
  const update = useEditor((s) => s.update);
  const checkpoint = useEditor((s) => s.checkpoint);
  if (!overlay) return null;

  const set = (patch: Partial<TextOverlay>, history = true) =>
    update((p) => ({ ...p, texts: p.texts.map((t) => (t.id === id ? { ...t, ...patch } : t)) }), { history });

  const setDuration = (seconds: number) => set({ end: overlay.start + seconds });

  return (
    <Sheet title="Text" onClose={onClose} maxHeight="60%">
      <TextInput
        value={overlay.text}
        onFocus={checkpoint}
        onChangeText={(text) => set({ text }, false)}
        placeholder="Type something…"
        placeholderTextColor={colors.textMute}
        multiline
        autoFocus={overlay.text === 'Your text'}
        selectTextOnFocus={overlay.text === 'Your text'}
        style={styles.input}
      />
      <Section title="Font">
        <Row>
          {(Object.keys(FONTS) as FontKey[]).map((f) => (
            <Pressable key={f} onPress={() => set({ font: f })} style={[styles.font, overlay.font === f && { borderColor: colors.accent, backgroundColor: '#211A44' }]}>
              <Text style={{ fontFamily: FONTS[f].family, color: '#fff', fontSize: 15 }}>{FONTS[f].label}</Text>
            </Pressable>
          ))}
        </Row>
      </Section>
      <Section title="Size">
        <Slider value={overlay.size} min={0.03} max={0.16} onStart={checkpoint} onChange={(v) => set({ size: v }, false)} format={(v) => `${Math.round(v * 1000)}`} />
      </Section>
      <Section title="Color">
        <Swatches colorsList={SWATCHES} value={overlay.color} onChange={(c) => c && set({ color: c })} />
      </Section>
      <Section title="Background">
        <Swatches allowNone colorsList={['#000000CC', '#FFFFFFE6', '#7C5CFFE6', '#FF4FD8E6', '#FFE600E6', '#FF4D6AE6']} value={overlay.background} onChange={(c) => set({ background: c })} />
      </Section>
      <Toggle label="Outline" value={!!overlay.strokeColor} onChange={(v) => set({ strokeColor: v ? '#000000' : null })} />
      <Section title={`Duration · ${(overlay.end - overlay.start).toFixed(1)}s`}>
        <Row>
          {[1, 2, 3, 5, 10].map((s) => (
            <Chip key={s} label={`${s}s`} active={Math.abs(overlay.end - overlay.start - s) < 0.05} onPress={() => setDuration(s)} />
          ))}
          <Chip
            label="Start here"
            onPress={() => {
              const t = usePlayback.getState().time;
              set({ start: t, end: Math.max(t + 0.5, overlay.end) });
            }}
          />
          <Chip
            label="End here"
            onPress={() => {
              const t = usePlayback.getState().time;
              if (t > overlay.start + 0.2) set({ end: t });
            }}
          />
        </Row>
      </Section>
      <Section title="Position">
        <Row>
          <SoftButton small label="Top" onPress={() => set({ x: 0.5, y: 0.18 })} />
          <SoftButton small label="Center" onPress={() => set({ x: 0.5, y: 0.5 })} />
          <SoftButton small label="Bottom" onPress={() => set({ x: 0.5, y: 0.86 })} />
        </Row>
      </Section>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: colors.surface2, color: colors.text, borderRadius: 14, padding: 14, fontSize: 17, minHeight: 56, marginBottom: 18, borderWidth: 1, borderColor: colors.border },
  font: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface2 },
});
