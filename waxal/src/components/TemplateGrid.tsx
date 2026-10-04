import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { CaptionSample } from '@/components/CaptionOverlay';
import { T, tap } from '@/components/ui';
import { TEMPLATES, type Template } from '@/lib/templates';
import { colors } from '@/theme';

/** Grid of caption templates, each with a live preview of the style. */
export function TemplateGrid({ selected, onSelect }: { selected: string; onSelect: (t: Template) => void }) {
  const { width } = useWindowDimensions();
  const columns = 3;
  const gap = 10;
  // Sheet content has 18px side padding plus a 1px border; cap for tablets / desktop browsers.
  const tileW = Math.floor((Math.min(width, 640) - 44 - gap * (columns - 1)) / columns);
  const tileH = Math.round(tileW * 0.78);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {TEMPLATES.map((t) => {
        const active = selected === t.id;
        return (
          <Pressable
            key={t.id}
            accessibilityLabel={`${t.name} caption style`}
            onPress={() => {
              tap();
              onSelect(t);
            }}
            style={[styles.tile, { width: tileW }, active && styles.active]}
          >
            <View style={[styles.preview, { height: tileH }]}>
              <CaptionSample style={t.style} width={tileW - 4} height={tileH} />
            </View>
            <T weight="semibold" numberOfLines={1} style={{ fontSize: 11, color: active ? colors.lime : colors.textDim, textAlign: 'center', paddingVertical: 6 }}>
              {t.name}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: 14, backgroundColor: '#1D1D2A', borderWidth: 2, borderColor: colors.border, overflow: 'hidden' },
  active: { borderColor: colors.lime },
  preview: { backgroundColor: '#2A2A38', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
