import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Platform, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton, IconButton, SoftButton, T, tap } from '@/components/ui';
import { captionsReady, useSettings } from '@/lib/settings';
import { formatTime } from '@/lib/timeline';
import { useLibrary, type ProjectSummary } from '@/store/projects';
import { colors, gradient } from '@/theme';

const CARD_GRADIENTS: [string, string][] = [
  ['#2F6BFF', '#7C5CFF'],
  ['#7C5CFF', '#FF4FD8'],
  ['#FF4FD8', '#FF8A3D'],
  ['#00B4D8', '#2EE59D'],
  ['#FF4D6A', '#7C5CFF'],
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const projects = useLibrary((s) => s.projects);
  const hasKey = useSettings(captionsReady);
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<ProjectSummary | null>(null);

  const start = async (source: 'library' | 'camera') => {
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
      }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['videos'], quality: 1, allowsEditing: false, videoMaxDuration: 600 };
      const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      setBusy(true);
      const project = await useLibrary.getState().create({
        uri: a.uri,
        duration: (a.duration ?? 0) / 1000,
        width: a.width,
        height: a.height,
        fileName: a.fileName,
      });
      router.push({ pathname: '/editor/[id]', params: { id: project.id } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Could not open video', msg);
    } finally {
      setBusy(false);
    }
  };

  const projectMenu = (p: ProjectSummary) => {
    const lib = useLibrary.getState();
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${p.name}"?`)) lib.remove(p.id);
      return;
    }
    Alert.alert(p.name, undefined, [
      { text: 'Rename', onPress: () => setRenaming(p) },
      { text: 'Duplicate', onPress: () => lib.duplicate(p.id) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete project?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => lib.remove(p.id) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const cardW = (Math.min(width, 640) - 16 * 2 - 12) / 2;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 120, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' }}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
                  <Ionicons name="chatbubbles" size={18} color="#fff" />
                </LinearGradient>
                <T weight="bold" style={{ fontSize: 24, letterSpacing: -0.5 }}>
                  Waxal
                </T>
              </View>
              <IconButton icon="settings-outline" onPress={() => router.push('/settings')} label="Settings" />
            </View>

            <LinearGradient colors={['#1E1640', '#2A1035']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={12} color={colors.lime} />
                <T weight="bold" style={{ fontSize: 11, color: colors.lime, letterSpacing: 0.5 }}>
                  AI AUTO CAPTIONS
                </T>
              </View>
              <T weight="bold" style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.8, marginTop: 12 }}>
                Captions that{'\n'}
                <T weight="bold" style={{ fontSize: 30, color: colors.accent2 }}>
                  pop
                </T>{' '}
                in seconds.
              </T>
              <T style={{ color: colors.textDim, marginTop: 8, fontSize: 14, lineHeight: 20 }}>
                Upload a video, let AI write word-by-word captions, then style, cut and export.
              </T>
              <GradientButton icon="add" label="New project" onPress={() => start('library')} loading={busy} style={{ marginTop: 18 }} />
              <SoftButton icon="videocam" label="Record video" onPress={() => start('camera')} style={{ marginTop: 10 }} />
            </LinearGradient>

            {!hasKey ? (
              <Pressable onPress={() => router.push('/settings')} style={styles.keyCard}>
                <Ionicons name="key" size={18} color={colors.warning} />
                <T style={{ flex: 1, fontSize: 13 }}>Add your ElevenLabs API key in Settings to turn on AI captions.</T>
                <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
              </Pressable>
            ) : null}

            <View style={styles.features}>
              {[
                ['mic', 'Word-level AI'],
                ['color-palette', '8 styles'],
                ['cut', 'Silence cut'],
                ['language', 'Translate'],
              ].map(([icon, label]) => (
                <View key={label} style={styles.feature}>
                  <Ionicons name={icon as 'mic'} size={18} color={colors.accent} />
                  <T weight="semibold" style={{ fontSize: 11, color: colors.textDim }}>
                    {label}
                  </T>
                </View>
              ))}
            </View>

            <T weight="bold" style={{ fontSize: 18, marginTop: 24, marginBottom: 12 }}>
              {projects.length ? 'Your projects' : 'No projects yet'}
            </T>
            {!projects.length ? <T style={{ color: colors.textMute, marginBottom: 12 }}>Your videos will show up here.</T> : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => {
              tap();
              router.push({ pathname: '/editor/[id]', params: { id: item.id } });
            }}
            onLongPress={() => projectMenu(item)}
            style={({ pressed }) => [{ width: cardW, opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient colors={CARD_GRADIENTS[index % CARD_GRADIENTS.length]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { height: cardW * 1.3 }]}>
              <View style={styles.cardTop}>
                <View style={styles.pill}>
                  <T weight="bold" style={{ fontSize: 11 }}>
                    {formatTime(item.duration)}
                  </T>
                </View>
                <Pressable hitSlop={10} onPress={() => projectMenu(item)}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
                </Pressable>
              </View>
              <Ionicons name="film-outline" size={34} color="rgba(255,255,255,0.85)" style={{ alignSelf: 'center' }} />
              <View style={styles.pill}>
                <Ionicons name={item.captionCount ? 'checkmark-circle' : 'sparkles-outline'} size={12} color="#fff" />
                <T weight="semibold" style={{ fontSize: 11 }}>
                  {item.captionCount ? `${item.captionCount} captions` : 'No captions'}
                </T>
              </View>
            </LinearGradient>
            <T weight="semibold" numberOfLines={1} style={{ marginTop: 8 }}>
              {item.name}
            </T>
            <T style={{ color: colors.textMute, fontSize: 12 }}>{new Date(item.updatedAt).toLocaleDateString()}</T>
          </Pressable>
        )}
      />
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color="#fff" size="large" />
          <T weight="semibold" style={{ marginTop: 12 }}>
            Importing video…
          </T>
        </View>
      ) : null}
      <RenameModal project={renaming} onClose={() => setRenaming(null)} />
    </View>
  );
}

function RenameModal({ project, onClose }: { project: ProjectSummary | null; onClose: () => void }) {
  const [name, setName] = useState('');
  return (
    <Modal transparent visible={!!project} animationType="fade" onShow={() => setName(project?.name ?? '')} onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <View style={styles.modal}>
          <T weight="bold" style={{ fontSize: 17, marginBottom: 12 }}>
            Rename project
          </T>
          <TextInput value={name} onChangeText={setName} autoFocus style={styles.input} placeholderTextColor={colors.textMute} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <SoftButton label="Cancel" onPress={onClose} style={{ flex: 1 }} />
            <SoftButton
              label="Save"
              active
              style={{ flex: 1 }}
              onPress={() => {
                if (project && name.trim()) useLibrary.getState().rename(project.id, name.trim());
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  logo: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#3A2A60' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(198,255,61,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  keyCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#2A2210', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#4A3B12' },
  features: { flexDirection: 'row', gap: 8, marginTop: 14 },
  feature: { flex: 1, alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  card: { borderRadius: 20, padding: 12, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  busy: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border },
  input: { backgroundColor: colors.surface2, color: colors.text, borderRadius: 12, padding: 12, fontSize: 16, borderWidth: 1, borderColor: colors.border },
});
