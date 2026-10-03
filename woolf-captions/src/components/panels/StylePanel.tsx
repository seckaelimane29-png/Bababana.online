import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Row, Sheet, Toggle } from '@/components/Sheet';
import { StrokeText } from '@/components/StyledText';
import { Chip, Section, Slider, Swatches, T, tap } from '@/components/ui';
import { regroup } from '@/lib/captions';
import { FONTS } from '@/lib/fonts';
import { TEMPLATES } from '@/lib/templates';
import { useEditor } from '@/store/projects';
import { colors, SWATCHES } from '@/theme';
import type { CaptionAnimation, CaptionStyle, FontKey } from '@/types';

const ANIMATIONS: { id: CaptionAnimation; label: string }[] = [
  { id: 'pop', label: 'Pop' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'karaoke', label: 'Karaoke' },
  { id: 'fade', label: 'Fade' },
  { id: 'none', label: 'None' },
];

export function StylePanel({ onClose }: { onClose: () => void }) {
  const style = useEditor((s) => s.project!.style);
  const update = useEditor((s) => s.update);
  const checkpoint = useEditor((s) => s.checkpoint);

  const set = (patch: Partial<CaptionStyle>, history = true) => update((p) => ({ ...p, style: { ...p.style, ...patch } }), { history });

  return (
    <Sheet title="Caption style" onClose={onClose} maxHeight="62%">
      <Section title="Templates">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {TEMPLATES.map((t) => {
            const active = style.templateId === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => {
                  tap();
                  update((p) => ({ ...p, style: { ...t.style, positionY: p.style.positionY, wordsPerLine: p.style.wordsPerLine } }));
                }}
                style={[styles.tpl, active && { borderColor: colors.lime }]}
              >
                <View style={{ flexDirection: 'row', gap: 4, backgroundColor: t.style.background ?? 'transparent', paddingHorizontal: 6, borderRadius: 6 }}>
                  <StrokeText text={t.style.uppercase ? 'HEY' : 'Hey'} stroke={t.style.strokeWidth / 2} strokeColor={t.style.strokeColor} style={{ fontFamily: FONTS[t.style.font].family, fontSize: 17, color: t.style.color }} />
                  <StrokeText text={t.style.uppercase ? 'YOU' : 'you'} stroke={t.style.strokeWidth / 2} strokeColor={t.style.strokeColor} style={{ fontFamily: FONTS[t.style.font].family, fontSize: 17, color: t.style.highlightColor }} />
                </View>
                <T weight="semibold" style={{ fontSize: 11, color: colors.textDim, marginTop: 8 }}>
                  {t.name}
                </T>
              </Pressable>
            );
          })}
        </ScrollView>
      </Section>

      <Section title="Font">
        <Row>
          {(Object.keys(FONTS) as FontKey[]).map((f) => (
            <Pressable key={f} onPress={() => set({ font: f })} style={[styles.font, style.font === f && { borderColor: colors.accent, backgroundColor: '#211A44' }]}>
              <Text style={{ fontFamily: FONTS[f].family, color: '#fff', fontSize: 15 }}>{FONTS[f].label}</Text>
            </Pressable>
          ))}
        </Row>
      </Section>

      <Section title="Animation">
        <Row>
          {ANIMATIONS.map((a) => (
            <Chip key={a.id} label={a.label} active={style.animation === a.id} onPress={() => set({ animation: a.id })} />
          ))}
        </Row>
      </Section>

      <Section title="Size">
        <Slider value={style.size} min={0.03} max={0.12} onStart={checkpoint} onChange={(v) => set({ size: v }, false)} format={(v) => `${Math.round(v * 1000)}`} />
      </Section>
      <Section title="Position">
        <Slider value={style.positionY} min={0.08} max={0.92} onStart={checkpoint} onChange={(v) => set({ positionY: v }, false)} format={(v) => (v < 0.33 ? 'Top' : v < 0.66 ? 'Middle' : 'Bottom')} />
      </Section>
      <Section title="Words per line">
        <Slider
          value={style.wordsPerLine}
          min={1}
          max={8}
          step={1}
          onStart={checkpoint}
          onChange={(v) => update((p) => ({ ...p, style: { ...p.style, wordsPerLine: v } }), { history: false })}
          onEnd={(v) => update((p) => ({ ...p, captions: regroup(p.captions, v) }), { history: false })}
          format={(v) => `${v}`}
        />
      </Section>

      <Section title="Text color">
        <Swatches colorsList={SWATCHES} value={style.color} onChange={(c) => c && set({ color: c })} />
      </Section>
      <Section title="Active word">
        <Swatches colorsList={SWATCHES} value={style.highlightColor} onChange={(c) => c && set({ highlightColor: c })} />
      </Section>
      <Section title="Keyword color">
        <Swatches colorsList={SWATCHES} value={style.emphasisColor} onChange={(c) => c && set({ emphasisColor: c })} />
      </Section>
      <Section title="Outline">
        <Swatches colorsList={SWATCHES} value={style.strokeColor} onChange={(c) => c && set({ strokeColor: c })} />
        <View style={{ height: 8 }} />
        <Slider value={style.strokeWidth} min={0} max={8} step={0.5} onStart={checkpoint} onChange={(v) => set({ strokeWidth: v }, false)} format={(v) => `${v}`} />
      </Section>
      <Section title="Background box">
        <Swatches allowNone colorsList={['#000000CC', '#FFFFFFE6', '#7C5CFFE6', '#FF4FD8E6', '#FFE600E6', '#2F6BFFE6']} value={style.background} onChange={(c) => set({ background: c })} />
      </Section>
      <Toggle label="ALL CAPS" value={style.uppercase} onChange={(v) => set({ uppercase: v })} />
      <Toggle label="Drop shadow" value={style.shadow} onChange={(v) => set({ shadow: v })} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  tpl: { width: 96, height: 84, borderRadius: 16, backgroundColor: '#1D1D2A', borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  font: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface2 },
});
