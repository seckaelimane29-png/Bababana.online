import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';
import { CaptionCard } from './CaptionCard';

function SkeletonCard() {
  return (
    <div className="card p-6">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-full rounded-lg bg-[#E5E7EB] dark:bg-[#27272A]" />
        <div className="h-4 w-5/6 rounded-lg bg-[#E5E7EB] dark:bg-[#27272A]" />
        <div className="h-4 w-2/3 rounded-lg bg-[#E5E7EB] dark:bg-[#27272A]" />
        <div className="h-3 w-1/2 rounded-lg bg-[#EEF2FF] dark:bg-[#27272A]" />
        <div className="mt-4 h-8 w-24 rounded-lg bg-[#F3F4F6] dark:bg-[#27272A]" />
      </div>
    </div>
  );
}

export function CaptionResults() {
  const t = useSettingsStore((s) => s.t);
  const { captions, imageDescription, isGenerating } = useCaptionStore();

  if (isGenerating) {
    return (
      <section aria-live="polite" aria-label={t('generate.loading')}>
        <div className="stagger-children grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  if (captions.length === 0) return null;

  return (
    <section className="animate-fade-in">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold">{t('results.title')}</h2>
        {imageDescription && (
          <p className="text-xs italic text-[#9CA3AF]">
            {t('results.aiSees')} {imageDescription}
          </p>
        )}
      </div>
      <div className="stagger-children grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {captions.map((caption, i) => (
          <CaptionCard
            key={caption.id}
            caption={caption}
            index={i}
            total={captions.length}
          />
        ))}
      </div>
    </section>
  );
}
