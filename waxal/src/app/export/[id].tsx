import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Row, Toggle } from '@/components/Sheet';
import { Chip, GradientButton, IconButton, Section, SoftButton, T } from '@/components/ui';
import { toPlainText, toSRT, toVTT } from '@/lib/captions';
import { renderVideo, type RenderOptions, type RenderStage } from '@/lib/render';
import { serverBase, useSettings } from '@/lib/settings';
import { formatTime, timelineDuration } from '@/lib/timeline';
import { loadProject } from '@/store/projects';
import { colors } from '@/theme';
import type { Project } from '@/types';

const STAGE_LABEL: Record<RenderStage['stage'], string> = {
  upload: 'Uploading video',
  render: 'Rendering captions',
  download: 'Downloading',
  done: 'Done',
};

function alertMsg(title: string, msg: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
}

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const serverUrl = useSettings((s) => (s.loaded ? serverBase() : ''));
  const [project, setProject] = useState<Project | null>(null);
  const [opts, setOpts] = useState<RenderOptions>({ quality: '1080', burnCaptions: true });
  const [stage, setStage] = useState<RenderStage | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const cancel = useRef({ cancelled: false });

  useEffect(() => {
    loadProject(id).then(setProject);
    const c = cancel.current;
    return () => {
      c.cancelled = true;
    };
  }, [id]);

  if (!project) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const length = timelineDuration(project.clips) / project.speed;

  const exportVideo = async () => {
    setOutput(null);
    setSaved(false);
    cancel.current = { cancelled: false };
    try {
      const uri = await renderVideo(project, opts, setStage, cancel.current);
      setOutput(uri);
    } catch (e) {
      setStage(null);
      if (!cancel.current.cancelled) alertMsg('Export failed', e instanceof Error ? e.message : String(e));
    }
  };

  const saveToPhotos = async () => {
    if (!output) return;
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = output;
      a.download = `${project.name}.mp4`;
      a.click();
      return;
    }
    // Loaded lazily: the media library module only exists on iOS/Android.
    const MediaLibrary = await import('expo-media-library');
    const perm = await MediaLibrary.requestPermissionsAsync(true, ['video']);
    if (!perm.granted) return alertMsg('Permission needed', 'Allow access to Photos to save your video.');
    await MediaLibrary.Asset.create(output);
    setSaved(true);
  };

  const share = async (uri: string, mimeType: string) => {
    if (Platform.OS === 'web') {
      window.open(uri, '_blank');
      return;
    }
    await Sharing.shareAsync(uri, { mimeType });
  };

  const shareText = async (ext: 'srt' | 'vtt' | 'txt') => {
    if (!project.captions.length) return alertMsg('No captions', 'Generate captions in the editor first.');
    const body = ext === 'srt' ? toSRT(project.captions, project.clips, project.speed) : ext === 'vtt' ? toVTT(project.captions, project.clips, project.speed) : toPlainText(project.captions);
    const name = `${project.name.replace(/[^\w-]+/g, '_')}.${ext}`;
    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      return;
    }
    const f = new File(Paths.cache, name);
    if (f.exists) f.delete();
    f.create();
    f.write(body);
    await Sharing.shareAsync(f.uri, { mimeType: ext === 'vtt' ? 'text/vtt' : 'text/plain', dialogTitle: name });
  };

  const working = stage && stage.stage !== 'done';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <IconButton icon="chevron-down" onPress={() => router.back()} label="Close" />
        <T weight="bold" style={{ fontSize: 17 }}>
          Export
        </T>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={styles.summary}>
          <Stat icon="time-outline" label="Length" value={formatTime(length)} />
          <Stat icon="chatbox-ellipses-outline" label="Captions" value={`${project.captions.length}`} />
          <Stat icon="text-outline" label="Texts" value={`${project.texts.length}`} />
          <Stat icon="cut-outline" label="Clips" value={`${project.clips.length}`} />
        </View>

        <Section title="Video">
          <Row>
            {(['720', '1080', 'source'] as const).map((q) => (
              <Chip key={q} label={q === 'source' ? 'Original' : `${q}p`} active={opts.quality === q} onPress={() => setOpts({ ...opts, quality: q })} />
            ))}
          </Row>
          <Toggle label="Burn in captions" value={opts.burnCaptions} onChange={(v) => setOpts({ ...opts, burnCaptions: v })} />
        </Section>

        {!serverUrl ? (
          <Pressable onPress={() => router.push('/settings')} style={styles.warn}>
            <Ionicons name="server-outline" size={18} color={colors.warning} />
            <T style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
              MP4 export runs on your Waxal render server (ffmpeg). Add its URL in Settings. Caption files below work without it.
            </T>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </Pressable>
        ) : null}

        {stage ? (
          <View style={styles.progressCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {working ? <ActivityIndicator color={colors.lime} /> : <Ionicons name="checkmark-circle" size={22} color={colors.success} />}
              <T weight="bold">{STAGE_LABEL[stage.stage]}</T>
              <T style={{ marginLeft: 'auto', color: colors.textDim }}>{working ? `${Math.round(stage.progress * 100)}%` : ''}</T>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${Math.round((stage.stage === 'done' ? 1 : stage.progress) * 100)}%` }]} />
            </View>
            {working ? <SoftButton small label="Cancel" onPress={() => { cancel.current.cancelled = true; setStage(null); }} style={{ marginTop: 12, alignSelf: 'flex-start' }} /> : null}
          </View>
        ) : null}

        {output ? (
          <View style={{ gap: 10, marginBottom: 18 }}>
            <GradientButton icon={saved ? 'checkmark' : 'download'} label={saved ? 'Saved to Photos' : Platform.OS === 'web' ? 'Download MP4' : 'Save to Photos'} onPress={saveToPhotos} disabled={saved} />
            <SoftButton icon="share-outline" label="Share video" onPress={() => share(output, 'video/mp4')} />
          </View>
        ) : (
          <GradientButton icon="rocket" label={working ? 'Exporting…' : 'Export video'} onPress={exportVideo} loading={!!working} disabled={!serverUrl} style={{ marginBottom: 22 }} />
        )}

        <Section title="Caption files">
          <View style={{ gap: 10 }}>
            <FileRow icon="document-text-outline" title="SRT subtitles" desc="YouTube, Premiere, CapCut, Final Cut" onPress={() => shareText('srt')} />
            <FileRow icon="globe-outline" title="WebVTT" desc="Websites and HTML5 players" onPress={() => shareText('vtt')} />
            <FileRow icon="reader-outline" title="Plain transcript" desc="Text only, for blogs and descriptions" onPress={() => shareText('txt')} />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Stat({ icon, label, value }: { icon: 'time-outline'; label: string; value: string } | { icon: string; label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon as 'time-outline'} size={18} color={colors.accent} />
      <T weight="bold" style={{ fontSize: 16 }}>
        {value}
      </T>
      <T style={{ fontSize: 11, color: colors.textMute }}>{label}</T>
    </View>
  );
}

function FileRow({ icon, title, desc, onPress }: { icon: string; title: string; desc: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fileRow, pressed && { opacity: 0.8 }]}>
      <Ionicons name={icon as 'reader-outline'} size={22} color={colors.text} />
      <View style={{ flex: 1 }}>
        <T weight="semibold">{title}</T>
        <T style={{ fontSize: 12, color: colors.textMute }}>{desc}</T>
      </View>
      <Ionicons name="share-outline" size={18} color={colors.textDim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, height: 52 },
  summary: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 20, paddingVertical: 16, marginBottom: 22, borderWidth: 1, borderColor: colors.border },
  warn: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#2A2210', borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#4A3B12' },
  progressCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.surface3, marginTop: 12, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.lime, borderRadius: 4 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border },
});
