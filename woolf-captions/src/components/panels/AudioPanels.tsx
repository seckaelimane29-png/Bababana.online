import { Row, Sheet, Toggle } from '@/components/Sheet';
import { Chip, Section, Slider, T } from '@/components/ui';
import { useEditor } from '@/store/projects';
import { colors } from '@/theme';

export function VolumePanel({ onClose }: { onClose: () => void }) {
  const project = useEditor((s) => s.project!);
  const update = useEditor((s) => s.update);
  const checkpoint = useEditor((s) => s.checkpoint);
  return (
    <Sheet title="Volume" onClose={onClose} maxHeight="40%">
      <Section title="Original audio">
        <Slider value={project.volume} min={0} max={2} step={0.05} onStart={checkpoint} onChange={(v) => update((p) => ({ ...p, volume: v, muted: false }), { history: false })} format={(v) => `${Math.round(v * 100)}%`} />
        {project.volume > 1 ? <T style={{ color: colors.textDim, fontSize: 12, marginTop: 6 }}>Boost above 100% is applied when you export.</T> : null}
      </Section>
      <Row>
        {[0, 0.5, 1, 1.5, 2].map((v) => (
          <Chip key={v} label={`${v * 100}%`} active={Math.abs(project.volume - v) < 0.01} onPress={() => update((p) => ({ ...p, volume: v, muted: false }))} />
        ))}
      </Row>
      <Toggle label="Mute video" value={project.muted} onChange={(v) => update((p) => ({ ...p, muted: v }))} />
    </Sheet>
  );
}

export function SpeedPanel({ onClose }: { onClose: () => void }) {
  const project = useEditor((s) => s.project!);
  const update = useEditor((s) => s.update);
  const checkpoint = useEditor((s) => s.checkpoint);
  return (
    <Sheet title="Speed" onClose={onClose} maxHeight="38%">
      <Section title="Playback speed">
        <Slider value={project.speed} min={0.25} max={3} step={0.05} onStart={checkpoint} onChange={(v) => update((p) => ({ ...p, speed: v }), { history: false })} format={(v) => `${v.toFixed(2)}x`} />
      </Section>
      <Row>
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((v) => (
          <Chip key={v} label={`${v}x`} active={Math.abs(project.speed - v) < 0.01} onPress={() => update((p) => ({ ...p, speed: v }))} />
        ))}
      </Row>
    </Sheet>
  );
}
