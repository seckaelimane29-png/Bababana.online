import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Row, Sheet, Toggle } from '@/components/Sheet';
import { TemplateGrid } from '@/components/TemplateGrid';
import { Chip, GradientButton, Section, Slider, T, tap, type IconName } from '@/components/ui';
import { AIError, highlightKeywords, LANGUAGES, transcribe, translateCaptions } from '@/lib/ai';
import { allWords, cutSilences, groupWords, isFiller, regroup, retextCaption } from '@/lib/captions';
import type { Template } from '@/lib/templates';
import { useSettings } from '@/lib/settings';
import { useEditor } from '@/store/projects';
import { colors } from '@/theme';

function notify(title: string, msg: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
}

function errorText(e: unknown) {
  if (e instanceof AIError) return e.message;
  return e instanceof Error ? e.message : String(e);
}

/** Generate captions with AI: pick a template and the spoken language, then generate. */
export function CaptionsPanel({ onClose }: { onClose: () => void }) {
  const project = useEditor((s) => s.project!);
  const update = useEditor((s) => s.update);
  const settings = useSettings();
  const [lang, setLang] = useState(project.language ?? settings.defaultLanguage ?? 'auto');
  const [showLangs, setShowLangs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const hasCaptions = project.captions.length > 0;
  const langName = LANGUAGES.find((l) => l.code === lang)?.name ?? lang;

  const pickTemplate = (t: Template) =>
    update((p) => ({
      ...p,
      style: { ...t.style, positionY: p.style.positionY },
      captions: p.captions.length && t.style.wordsPerLine !== p.style.wordsPerLine ? regroup(p.captions, t.style.wordsPerLine) : p.captions,
    }));

  const run = async () => {
    setBusy(true);
    setProgress(0);
    try {
      const { words, language } = await transcribe(project.videoUri, lang, setProgress);
      if (!words.length) {
        notify('No speech found', 'We could not hear any words in this video.');
        return;
      }
      update((p) => ({ ...p, language, captions: groupWords(words, p.style.wordsPerLine) }));
      onClose();
    } catch (e) {
      notify('Captions failed', errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const footer = busy ? (
    <View style={styles.progress}>
      <ActivityIndicator color={colors.lime} />
      <T weight="semibold">{progress > 0 && progress < 1 ? `Uploading ${Math.round(progress * 100)}%` : 'Writing captions…'}</T>
    </View>
  ) : (
    <GradientButton icon="sparkles" label={hasCaptions ? 'Apply & regenerate' : 'Generate captions'} onPress={run} />
  );

  return (
    <Sheet title="Auto captions" onClose={onClose} maxHeight="88%" footer={footer}>

      <Pressable onPress={() => setShowLangs((v) => !v)} style={styles.row}>
        <Ionicons name="language" size={20} color={colors.text} />
        <T weight="semibold" style={{ flex: 1, fontSize: 15 }}>
          Spoken language
        </T>
        <T style={{ color: colors.textDim }}>{langName}</T>
        <Ionicons name={showLangs ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textDim} />
      </Pressable>
      {showLangs ? (
        <View style={{ marginBottom: 14 }}>
          <Row>
            {LANGUAGES.map((l) => (
              <Chip
                key={l.code}
                label={l.name}
                active={lang === l.code}
                onPress={() => {
                  setLang(l.code);
                  setShowLangs(false);
                }}
              />
            ))}
          </Row>
        </View>
      ) : null}

      <Section title="Templates">
        <TemplateGrid selected={project.style.templateId} onSelect={pickTemplate} />
      </Section>
      {hasCaptions ? <T style={{ color: colors.textMute, fontSize: 12, textAlign: 'center' }}>Tapping a template restyles your captions right away. Regenerating rewrites the text (you can undo).</T> : null}
    </Sheet>
  );
}

/** One-tap AI magic tools. */
export function MagicPanel({ onClose }: { onClose: () => void }) {
  const project = useEditor((s) => s.project!);
  const update = useEditor((s) => s.update);
  const [busy, setBusy] = useState<string | null>(null);
  const [gap, setGap] = useState(0.7);
  const [emoji, setEmoji] = useState(true);
  const [target, setTarget] = useState('fr');
  const words = allWords(project.captions);
  const fillers = words.filter(isFiller).length;
  const noCaptions = project.captions.length === 0;

  const guard = () => {
    if (noCaptions) {
      notify('Captions needed', 'Generate captions first — the magic tools work from the transcript.');
      return false;
    }
    return true;
  };

  const silences = () => {
    if (!guard()) return;
    const before = project.clips.reduce((s, c) => s + c.end - c.start, 0);
    const clips = cutSilences(project.clips, words, gap);
    const after = clips.reduce((s, c) => s + c.end - c.start, 0);
    update((p) => ({ ...p, clips }));
    notify('Silences removed', `Trimmed ${(before - after).toFixed(1)}s of dead air.`);
  };

  const removeFillers = () => {
    if (!guard()) return;
    if (!fillers) return notify('All clean', 'No filler words (um, uh…) found.');
    const clips = cutSilences(project.clips, words, 0.35, 0.06, true);
    update((p) => ({
      ...p,
      clips,
      captions: p.captions.map((c) => ({ ...c, words: c.words.filter((w) => !isFiller(w)) })).filter((c) => c.words.length),
    }));
    notify('Fillers removed', `Removed ${fillers} filler word${fillers > 1 ? 's' : ''}.`);
  };

  const keywords = async () => {
    if (!guard()) return;
    setBusy('keywords');
    try {
      const res = await highlightKeywords(project.captions, emoji);
      update((p) => ({
        ...p,
        captions: p.captions.map((c, i) => ({
          ...c,
          words: c.words.map((w, wi) => ({
            ...w,
            emphasis: res[i]?.emphasis.includes(wi) ?? false,
            emoji: wi === 0 ? res[i]?.emoji ?? undefined : undefined,
          })),
        })),
      }));
    } catch (e) {
      notify('Highlight failed', errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const translate = async () => {
    if (!guard()) return;
    setBusy('translate');
    try {
      const name = LANGUAGES.find((l) => l.code === target)?.name ?? target;
      const lines = await translateCaptions(project.captions, name);
      update((p) => ({ ...p, captions: p.captions.map((c, i) => retextCaption(c, lines[i] ?? '')) }));
    } catch (e) {
      notify('Translation failed', errorText(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet title="AI Magic" onClose={onClose} maxHeight="66%">
      <Tool icon="cut" title="Cut silences" desc="Jump-cut every pause longer than the gap below." onPress={silences} />
      <View style={{ marginBottom: 14, marginTop: -4 }}>
        <Slider value={gap} min={0.3} max={2} step={0.1} onChange={setGap} format={(v) => `${v.toFixed(1)}s`} />
      </View>
      <Tool icon="chatbubble-ellipses" title="Remove filler words" desc={fillers ? `Found ${fillers} “um / uh” — cut them from video and captions.` : 'Cut “um”, “uh”, “erm” from video and captions.'} onPress={removeFillers} />
      <Tool icon="flash" title="Highlight keywords" desc="AI colors the most important word of each line." onPress={keywords} loading={busy === 'keywords'} />
      <View style={{ marginTop: -6, marginBottom: 8 }}>
        <Toggle label="Add emojis" value={emoji} onChange={setEmoji} />
      </View>
      <Tool icon="language" title="Translate captions" desc="Keeps timing, rewrites every line." onPress={translate} loading={busy === 'translate'} />
      <Row>
        {LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
          <Chip key={l.code} label={l.name} active={target === l.code} onPress={() => setTarget(l.code)} />
        ))}
      </Row>
    </Sheet>
  );
}

function Tool({ icon, title, desc, onPress, loading }: { icon: IconName; title: string; desc: string; onPress: () => void; loading?: boolean }) {
  return (
    <Pressable
      disabled={loading}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.tool, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.toolIcon}>{loading ? <ActivityIndicator color="#fff" /> : <Ionicons name={icon} size={20} color="#fff" />}</View>
      <View style={{ flex: 1 }}>
        <T weight="bold" style={{ fontSize: 15 }}>
          {title}
        </T>
        <T style={{ color: colors.textDim, fontSize: 12, marginTop: 2 }}>{desc}</T>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMute} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface2, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  hero: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#17142B', borderRadius: 16, padding: 14, marginBottom: 16 },
  warn: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#2A2210', borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#4A3B12' },
  progress: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, backgroundColor: colors.surface2, borderRadius: 999 },
  tool: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface2, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  toolIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
