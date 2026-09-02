import { ArrowUpLeft, Heart, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';

import { imageUrl } from '../services/api';
import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';

export function HistorySidebar() {
  const t = useSettingsStore((s) => s.t);
  const {
    isHistoryOpen,
    toggleHistory,
    history,
    removeFromHistory,
    toggleFavorite,
    loadHistoryItem,
  } = useCaptionStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useCaptionStore.getState().isHistoryOpen) {
        toggleHistory();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleHistory]);

  if (!isHistoryOpen) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-label={t('history.title')}>
      <button
        aria-label="Close"
        onClick={toggleHistory}
        className="absolute inset-0 bg-black/30"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full animate-slide-in-right flex-col border-l border-[#E5E7EB] bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)] dark:border-[#3F3F46] dark:bg-[#1A1A1E] sm:w-[380px]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#F3F4F6] px-6 dark:border-[#27272A]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{t('history.title')}</h2>
            <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs text-[#6B7280] dark:bg-[#27272A] dark:text-[#A1A1AA]">
              {t('history.count', { n: history.length })}
            </span>
          </div>
          <button
            onClick={toggleHistory}
            aria-label="Close"
            className="btn-press flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-[#27272A]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {history.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
            <span className="text-4xl" aria-hidden="true">
              🖼️
            </span>
            <p className="mt-2 font-medium text-[#6B7280] dark:text-[#A1A1AA]">
              {t('history.empty')}
            </p>
            <p className="text-sm text-[#9CA3AF]">{t('history.emptySub')}</p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {history.map((item) => (
              <li
                key={item.id}
                className="group flex gap-3 border-b border-[#F3F4F6] px-6 py-4 hover:bg-[#FAFBFC] dark:border-[#27272A] dark:hover:bg-[#27272A]/50"
              >
                {item.image_url ? (
                  <img
                    src={imageUrl(item.image_url)}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] dark:bg-[#27272A]">
                    🖼️
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-[#374151] dark:text-[#A1A1AA]">
                    {item.captions[0]?.text ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    {new Date(item.created_at + 'Z').toLocaleDateString()} ·{' '}
                    {item.platform}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-center justify-center gap-1">
                  <button
                    onClick={() => void toggleFavorite(item.id)}
                    aria-label={t('history.favorite')}
                    title={t('history.favorite')}
                    className="btn-press flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#3F3F46]"
                  >
                    <Heart
                      className={[
                        'h-4 w-4 transition-transform active:scale-125',
                        item.is_favorite ? 'fill-error text-error' : 'text-[#9CA3AF]',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    onClick={() => loadHistoryItem(item)}
                    aria-label={t('history.load')}
                    title={t('history.load')}
                    className="btn-press flex h-7 w-7 items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#3F3F46]"
                  >
                    <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => void removeFromHistory(item.id, t('toast.deleted'))}
                    aria-label={t('history.delete')}
                    title={t('history.delete')}
                    className="btn-press flex h-7 w-7 items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-error dark:hover:bg-[#3F3F46]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
