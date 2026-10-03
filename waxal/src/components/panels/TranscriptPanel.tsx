import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { IconButton, SoftButton, T } from '@/components/ui';
import { captionText, retextCaption } from '@/lib/captions';
import { formatTime } from '@/lib/timeline';
import { useEditor } from '@/store/projects';
import { usePlayback } from '@/store/playback';
import { colors } from '@/theme';

/** Edit every caption line like a document. */
export function TranscriptPanel({ onClose, onSeekSource }: { onClose: () => void; onSeekSource: (t: number) => void }) {
  const captions = useEditor((s) => s.project!.captions);
  const update = useEditor((s) => s.update);
  const checkpoint = useEditor((s) => s.checkpoint);
  const time = usePlayback((s) => s.time);

  return (
    <Sheet title="Edit transcript" onClose={onClose} maxHeight="70%">
      {captions.length === 0 ? <T style={{ color: colors.textDim }}>No captions yet. Use AI Captions to generate them, or add a line manually.</T> : null}
      {captions.map((c) => {
        const live = time >= c.start && time < c.end;
        return (
          // Keyed by text too, so undo/redo refreshes the (uncontrolled) input.
          <View key={`${c.id}:${captionText(c)}`} style={[styles.line, live && { borderColor: colors.accent }]}>
            <Pressable onPress={() => onSeekSource(c.start + 0.01)} style={styles.stamp}>
              <Ionicons name="play" size={10} color={live ? colors.lime : colors.textMute} />
              <T style={{ fontSize: 11, color: live ? colors.lime : colors.textMute, fontVariant: ['tabular-nums'] }}>{formatTime(c.start, true)}</T>
            </Pressable>
            <TextInput
              defaultValue={captionText(c)}
              onFocus={checkpoint}
              onEndEditing={(e) => {
                const text = e.nativeEvent.text;
                update((p) => ({ ...p, captions: p.captions.map((x) => (x.id === c.id ? retextCaption(x, text) : x)).filter((x) => x.words.length) }), { history: false });
              }}
              onBlur={(e) => {
                const text = (e.nativeEvent as unknown as { text?: string }).text;
                if (text == null) return;
                update((p) => ({ ...p, captions: p.captions.map((x) => (x.id === c.id ? retextCaption(x, text) : x)).filter((x) => x.words.length) }), { history: false });
              }}
              multiline
              style={styles.input}
            />
            <IconButton icon="trash-outline" size={18} color={colors.textMute} onPress={() => update((p) => ({ ...p, captions: p.captions.filter((x) => x.id !== c.id) }))} label="Delete line" />
          </View>
        );
      })}
      <SoftButton
        icon="add"
        label="Add line at playhead"
        style={{ marginTop: 6 }}
        onPress={() => {
          const t = usePlayback.getState().time;
          update((p) => {
            const next = p.captions.find((c) => c.start > t);
            const end = Math.min(t + 2, next ? next.start : t + 2);
            const line = retextCaption({ id: `c${Date.now()}`, start: t, end: Math.max(end, t + 0.3), words: [] }, 'New caption');
            return { ...p, captions: [...p.captions.filter((c) => !(t >= c.start && t < c.end)), line].sort((a, b) => a.start - b.start) };
          });
        }}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface2, borderRadius: 14, paddingLeft: 10, paddingRight: 2, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  stamp: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, width: 58 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 10 },
});
