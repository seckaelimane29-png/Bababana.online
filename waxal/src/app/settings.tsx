import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Row } from '@/components/Sheet';
import { Chip, GradientButton, IconButton, Section, T } from '@/components/ui';
import { compareCaptionEngines, LANGUAGES, type CompareResult } from '@/lib/ai';
import { useSettings } from '@/lib/settings';
import { colors } from '@/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const s = useSettings();
  const [key, setKey] = useState(s.openaiKey);
  const [elevenKey, setElevenKey] = useState(s.elevenlabsKey);
  const [provider, setProvider] = useState(s.sttProvider);
  const [showEleven, setShowEleven] = useState(false);
  const [server, setServer] = useState(s.serverUrl);
  const [token, setToken] = useState(s.serverToken);
  const [model, setModel] = useState(s.chatModel);
  const [via, setVia] = useState(s.transcribeVia);
  const [lang, setLang] = useState(s.defaultLanguage);
  const [showKey, setShowKey] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [check, setCheck] = useState<'idle' | 'busy' | 'ok' | 'fail'>('idle');

  const testServer = async () => {
    setCheck('busy');
    try {
      const res = await fetch(`${server.trim().replace(/\/+$/, '')}/health`);
      setCheck(res.ok ? 'ok' : 'fail');
    } catch {
      setCheck('fail');
    }
  };

  const save = async () => {
    await s.save({ openaiKey: key.trim(), elevenlabsKey: elevenKey.trim(), sttProvider: provider, serverUrl: server.trim(), serverToken: token.trim(), chatModel: model.trim() || 'gpt-4o-mini', transcribeVia: via, defaultLanguage: lang });
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <IconButton icon="close" onPress={() => router.back()} label="Close" />
        {/* Owner-only: long-press the title for 2 seconds to reveal server and API settings. */}
        <Pressable delayLongPress={2000} onLongPress={() => setAdvanced((v) => !v)} hitSlop={12}>
          <T weight="bold" style={{ fontSize: 17 }}>
            Settings
          </T>
        </Pressable>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30, maxWidth: 640, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        <Section title="Default spoken language">
          <Row>
            {LANGUAGES.map((l) => (
              <Chip key={l.code} label={l.name} active={lang === l.code} onPress={() => setLang(l.code)} />
            ))}
          </Row>
        </Section>


        {advanced ? (
          <View style={styles.advanced}>
            <T weight="bold" style={{ color: colors.warning, marginBottom: 14 }}>
              Owner settings (hidden from users)
            </T>
        <Section title="Caption engine">
          <Row>
            <Chip label="ElevenLabs (Wolof)" active={provider === 'elevenlabs'} onPress={() => setProvider('elevenlabs')} />
            <Chip label="OpenAI" active={provider === 'openai'} onPress={() => setProvider('openai')} />
          </Row>
          <T style={styles.hint}>ElevenLabs Scribe understands Wolof and 90+ languages. OpenAI Whisper does not support Wolof.</T>
        </Section>

        <Section title="ElevenLabs API key">
          <View style={styles.inputRow}>
            <TextInput
              value={elevenKey}
              onChangeText={setElevenKey}
              placeholder="sk_…"
              placeholderTextColor={colors.textMute}
              secureTextEntry={!showEleven}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <IconButton icon={showEleven ? 'eye-off' : 'eye'} size={20} color={colors.textDim} onPress={() => setShowEleven(!showEleven)} label="Show key" />
          </View>
          <T style={styles.hint}>Used to write captions. Stored encrypted on this device only (Keychain / Keystore).</T>
        </Section>

        <Section title="OpenAI API key">
          <View style={styles.inputRow}>
            <TextInput
              value={key}
              onChangeText={setKey}
              placeholder="sk-…"
              placeholderTextColor={colors.textMute}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <IconButton icon={showKey ? 'eye-off' : 'eye'} size={20} color={colors.textDim} onPress={() => setShowKey(!showKey)} label="Show key" />
          </View>
          <T style={styles.hint}>Used for Translate and Highlight keywords (and captions if you pick OpenAI). Stored encrypted on this device only.</T>
        </Section>

        <Section title="Transcribe with">
          <Row>
            <Chip label="This device" active={via === 'device'} onPress={() => setVia('device')} />
            <Chip label="Waxal server" active={via === 'server'} onPress={() => setVia('server')} />
          </Row>
          <T style={styles.hint}>
            “This device” sends the video straight to the caption engine. “Waxal server” extracts the audio first (faster uploads) and keeps your keys on the server.
          </T>
        </Section>

        <Section title="Waxal server URL (for video export)">
          <TextInput value={server} onChangeText={(v) => { setServer(v); setCheck('idle'); }} placeholder="https://your-server.example.com" placeholderTextColor={colors.textMute} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={[styles.input, styles.box]} />
          <TextInput value={token} onChangeText={setToken} placeholder="Server token (optional)" placeholderTextColor={colors.textMute} autoCapitalize="none" autoCorrect={false} secureTextEntry style={[styles.input, styles.box, { marginTop: 10 }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <Chip label="Test connection" onPress={testServer} />
            {check === 'busy' ? <ActivityIndicator color={colors.accent} /> : null}
            {check === 'ok' ? <Ionicons name="checkmark-circle" size={20} color={colors.success} /> : null}
            {check === 'fail' ? <Ionicons name="close-circle" size={20} color={colors.danger} /> : null}
          </View>
          <T style={styles.hint}>The server (in the /server folder) renders your final MP4 with ffmpeg: cuts, speed, volume and burned-in animated captions.</T>
        </Section>

        <Section title="AI model (translate & highlight)">
          <TextInput value={model} onChangeText={setModel} autoCapitalize="none" autoCorrect={false} style={[styles.input, styles.box]} placeholderTextColor={colors.textMute} />
        </Section>

            <WolofTest lang={lang} />
          </View>
        ) : null}

        <GradientButton label="Save" icon="checkmark" onPress={save} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, height: 52 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingRight: 4 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingHorizontal: 14, paddingVertical: 14 },
  box: { backgroundColor: colors.surface2, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  advanced: { marginTop: 10, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: '#4A3B12', backgroundColor: '#15120A' },
  result: { backgroundColor: colors.surface2, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border },
  hint: { color: colors.textMute, fontSize: 12, marginTop: 8, lineHeight: 17 },
});

/** Owner-only: compare ElevenLabs setups on a real Wolof clip, to pick the default that writes it best. */
function WolofTest({ lang }: { lang: string }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [out, setOut] = useState<{ current: { model: string; language: string }; results: CompareResult[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 1 });
    if (res.canceled || !res.assets?.[0]) return;
    setBusy(true);
    setError(null);
    setOut(null);
    setProgress(0);
    try {
      setOut(await compareCaptionEngines(res.assets[0].uri, lang === 'auto' ? 'wo' : lang, setProgress));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Section title="Test Wolof captions">
      <T style={styles.hint}>Pick a short video (20–60 s) where you speak. The server writes it 4 different ways; tell Claude which one matches what you said.</T>
      <Chip label={busy ? (progress > 0 && progress < 1 ? `Uploading ${Math.round(progress * 100)}%` : 'Comparing…') : 'Pick a video and compare'} onPress={busy ? () => {} : run} />
      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: 10 }} /> : null}
      {error ? <T style={{ color: colors.danger, marginTop: 10 }}>{error}</T> : null}
      {out ? (
        <View style={{ gap: 10, marginTop: 12 }}>
          <T style={styles.hint}>
            Used for captions now: {out.current.model} · {out.current.language === 'auto' ? 'auto-detect' : 'forced language'}
          </T>
          {out.results.map((r, i) => (
            <View key={r.label} style={styles.result}>
              <T weight="bold" style={{ marginBottom: 4 }}>
                {i + 1}. {r.label}
                {r.detected ? `  (heard: ${r.detected})` : ''}
              </T>
              <T style={{ color: r.ok ? colors.text : colors.danger, lineHeight: 20 }}>{r.ok ? r.text || '(nothing heard)' : r.error}</T>
            </View>
          ))}
        </View>
      ) : null}
    </Section>
  );
}
