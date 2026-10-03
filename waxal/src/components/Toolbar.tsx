import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { T, tap, type IconName } from '@/components/ui';
import { colors } from '@/theme';

export type Tool = { key: string; icon: IconName; label: string; onPress: () => void; accent?: boolean; danger?: boolean; disabled?: boolean };

export function Toolbar({ tools, title, onBack }: { tools: Tool[]; title?: string; onBack?: () => void }) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable
          onPress={() => {
            tap();
            onBack();
          }}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
          {title ? (
            <T weight="bold" style={{ fontSize: 10, color: colors.textDim, marginTop: 2 }}>
              {title}
            </T>
          ) : null}
        </Pressable>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, gap: 4 }}>
        {tools.map((t) => (
          <Pressable
            key={t.key}
            disabled={t.disabled}
            onPress={() => {
              tap();
              t.onPress();
            }}
            style={({ pressed }) => [styles.tool, { opacity: t.disabled ? 0.35 : pressed ? 0.6 : 1 }]}
          >
            <View style={[styles.icon, t.accent && { backgroundColor: colors.accent }, t.danger && { backgroundColor: '#3A1520' }]}>
              <Ionicons name={t.icon} size={22} color={t.danger ? colors.danger : '#fff'} />
            </View>
            <T weight="semibold" style={{ fontSize: 11, color: t.danger ? colors.danger : colors.textDim }} numberOfLines={1}>
              {t.label}
            </T>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, paddingTop: 8 },
  back: { width: 54, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderColor: colors.border, paddingVertical: 6 },
  tool: { width: 68, alignItems: 'center', gap: 6, paddingVertical: 4 },
  icon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
});
