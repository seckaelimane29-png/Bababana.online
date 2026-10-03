import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Row } from '@/components/Sheet';
import { Chip, GradientButton, IconButton, Section, T } from '@/components/ui';
import { LANGUAGES } from '@/lib/ai';
import { useSettings } from '@/lib/settings';
import { colors } from '@/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const s = useSettings();
  const [key, setKey] = useState(s.openaiKey);
  const [server, setServer] = useState(s.serverUrl);
  const [token, setToken] = useState(s.serverToken);
  const [model, setModel] = useState(s.chatModel);
  const [via, setVia] = useState(s.transcribeVia);
  const [lang, setLang] = useState(s.defaultLanguage);
  const [showKey, setShowKey] = useState(false);
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
    await s.save({ openaiKey: key.trim(), serverUrl: server.trim(), serverToken: token.trim(), chatModel: model.trim() || 'gpt-4o-mini', transcribeVia: via, defaultLanguage: lang });
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <IconButton icon="close" onPress={() => router.back()} label="Close" />
        <T weight="bold" style={{ fontSize: 17 }}>
          Settings
        </T>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30, maxWidth: 640, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
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
          <T style={styles.hint}>Used for speech-to-text (Whisper) and AI tools. Stored encrypted on this device only (Keychain / Keystore).</T>
        </Section>

        <Section title="Transcribe with">
          <Row>
            <Chip label="This device" active={via === 'device'} onPress={() => setVia('device')} />
            <Chip label="Waxal server" active={via === 'server'} onPress={() => setVia('server')} />
          </Row>
          <T style={styles.hint}>
            “This device” sends the video straight to OpenAI (up to 25 MB). “Waxal server” extracts the audio first, so any length works and the key can live on the server.
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

        <Section title="Default spoken language">
          <Row>
            {LANGUAGES.map((l) => (
              <Chip key={l.code} label={l.name} active={lang === l.code} onPress={() => setLang(l.code)} />
            ))}
          </Row>
        </Section>

        <Section title="AI model (translate & highlight)">
          <TextInput value={model} onChangeText={setModel} autoCapitalize="none" autoCorrect={false} style={[styles.input, styles.box]} placeholderTextColor={colors.textMute} />
        </Section>

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
  hint: { color: colors.textMute, fontSize: 12, marginTop: 8, lineHeight: 17 },
});
