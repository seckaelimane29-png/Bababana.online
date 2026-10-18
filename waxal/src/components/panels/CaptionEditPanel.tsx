import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { GradientButton, SoftButton, T } from '@/components/ui';
import { captionText, retextCaption } from '@/lib/captions';
import { uid } from '@/lib/id';
import { useEditor } from '@/store/projects';
import { colors } from '@/theme';
import type { Caption } from '@/types';

/** Replace one word; typing several words splits that word's time between them, an empty box removes it. */
function rewordCaption(c: Caption, index: number, text: string): Caption {
  const w = c.words[index];
  if (!w) return c;
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const span = (w.end - w.start) / Math.max(1, tokens.length);
  const replacement = tokens.map((t, i) =>
    i === 0 ? { ...w, text: t, end: tokens.length === 1 ? w.end : w.start + span } : { id: uid('w'), text: t, start: w.start + i * span, end: w.start + (i + 1) * span },
  );
  return { ...c, words: [...c.words.slice(0, index), ...replacement, ...c.words.slice(index + 1)] };
}

/** Tap a caption on the video → fix any word in it. */
export function CaptionEditPanel({ captionId, onClose, onSeekSource }: { captionId: string; onClose: () => void; onSeekSource: (t: number) => void }) {
  const caption = useEditor((s) => s.project!.captions.find((c) => c.id === captionId));
  const update = useEditor((s) => s.update);
  const [selected, setSelected] = useState<number | null>(0);
  const [draft, setDraft] = useState('');
  const input = useRef<TextInput>(null);
  const lastApplied = useRef('');

  useEffect(() => {
    useEditor.getState().checkpoint();
  }, []);
  useEffect(() => {
    if (!caption) return;
    setDraft(selected == null ? captionText(caption) : (caption.words[selected]?.text ?? ''));
    // Only when the chosen word changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, captionId]);

  if (!caption) return null;

  const apply = (text: string) => {
    // Blur, submit and Done can all fire for the same edit; splitting a word twice would duplicate it.
    const key = `${selected}|${text}`;
    if (key === lastApplied.current) return;
    lastApplied.current = key;
    update(
      (p) => ({
        ...p,
        captions: p.captions
          .map((c) => (c.id !== captionId ? c : selected == null ? retextCaption(c, text) : rewordCaption(c, selected, text)))
          .filter((c) => c.words.length),
      }),
      { history: false },
    );
  };

  const pick = (i: number) => {
    setSelected(i);
    onSeekSource(caption.words[i].start + 0.01);
    setTimeout(() => input.current?.focus(), 50);
  };

  const done = () => {
    apply(draft);
    onClose();
  };

  return (
    <Sheet
      title="Fix caption"
      onClose={done}
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SoftButton
            icon="trash-outline"
            danger
            label="Delete line"
            onPress={() => {
              update((p) => ({ ...p, captions: p.captions.filter((c) => c.id !== captionId) }), { history: false });
              onClose();
            }}
          />
          <GradientButton icon="checkmark" label="Done" onPress={done} style={{ flex: 1 }} />
        </View>
      }
    >
      <T style={{ color: colors.textDim, marginBottom: 10 }}>Tap the word that's wrong, then type it the way you said it.</T>
      <View style={styles.words}>
        {caption.words.map((w, i) => (
          <Pressable
            key={w.id}
            onPress={() => {
              if (selected != null && selected !== i) apply(draft);
              pick(i);
            }}
            style={[styles.word, selected === i && styles.wordOn]}
          >
            <T weight="semibold" style={{ fontSize: 16, color: selected === i ? '#0B0B10' : colors.text }}>
              {w.text}
            </T>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            if (selected != null) apply(draft);
            setSelected(null);
            setTimeout(() => input.current?.focus(), 50);
          }}
          style={[styles.word, styles.lineBtn, selected == null && styles.wordOn]}
        >
          <T style={{ fontSize: 13, color: selected == null ? '#0B0B10' : colors.textDim }}>Whole line</T>
        </Pressable>
      </View>
      <TextInput
        ref={input}
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => apply(draft)}
        onBlur={() => apply(draft)}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        returnKeyType="done"
        placeholder={selected == null ? 'Type the whole line' : 'Type the word'}
        placeholderTextColor={colors.textMute}
        style={styles.input}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  word: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  wordOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  lineBtn: { borderStyle: 'dashed' },
  input: { color: colors.text, fontSize: 18, backgroundColor: colors.surface2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.accent },
});
