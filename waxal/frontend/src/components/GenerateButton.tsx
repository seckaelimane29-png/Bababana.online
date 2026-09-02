import { Sparkles } from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';

export function GenerateButton() {
  const t = useSettingsStore((s) => s.t);
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const { imageId, isUploading, isGenerating, generate } = useCaptionStore();

  const disabled = imageId == null || isUploading || isGenerating;

  const handleClick = () => {
    if (!user) {
      openAuthModal('register');
      return;
    }
    void generate({ success: t('toast.generated'), error: t('toast.error') });
  };

  return (
    <div className="sticky bottom-3 z-10 sm:static">
      <button
        onClick={handleClick}
        disabled={user ? disabled : imageId == null || isUploading}
        title={imageId == null ? t('generate.needImage') : undefined}
        className={[
          'btn-press relative h-14 w-full overflow-hidden rounded-2xl text-base font-semibold transition-all',
          disabled && user
            ? 'cursor-not-allowed bg-[#E5E7EB] text-[#9CA3AF] dark:bg-[#27272A] dark:text-[#6B7280]'
            : 'bg-gradient-to-br from-primary-500 to-[#8B5CF6] text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.45)]',
        ].join(' ')}
      >
        {isGenerating && (
          <span className="shimmer-bg absolute inset-0 animate-shimmer" aria-hidden="true" />
        )}
        <span className="relative flex items-center justify-center gap-2">
          <Sparkles
            className={['h-5 w-5', isGenerating ? 'animate-sparkle' : ''].join(' ')}
            aria-hidden="true"
          />
          {isGenerating
            ? t('generate.loading')
            : user
              ? t('generate.cta')
              : t('generate.needLogin')}
        </span>
      </button>
      {user && (
        <p
          className="mt-2 text-center text-xs text-[#9CA3AF]"
          aria-live="polite"
        >
          {t('quota.left', {
            n: Math.max(0, user.generations_limit - user.generations_used),
          })}
        </p>
      )}
    </div>
  );
}
