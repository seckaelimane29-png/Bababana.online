import { Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { useClipboard } from '../hooks/useClipboard';
import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';
import type { CaptionVariant } from '../types';
import type { TranslationKey } from '../i18n';

const REFINE_CHIPS: { key: TranslationKey; instruction: string }[] = [
  { key: 'refine.shorter', instruction: 'Make it shorter' },
  { key: 'refine.funnier', instruction: 'Make it funnier' },
  { key: 'refine.creative', instruction: 'Make it more creative' },
  { key: 'refine.professional', instruction: 'Make it more professional' },
  { key: 'refine.punchier', instruction: 'Make it punchier' },
  { key: 'refine.storytelling', instruction: 'Turn it into a short story' },
];

export function CaptionCard({
  caption,
  index,
  total,
}: {
  caption: CaptionVariant;
  index: number;
  total: number;
}) {
  const t = useSettingsStore((s) => s.t);
  const { refine, refiningId, showToast } = useCaptionStore();
  const { copied, copy } = useClipboard();
  const [refineOpen, setRefineOpen] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');

  const isRefining = refiningId === caption.id;
  const fullText = [caption.text, caption.hashtags.join(' ')].filter(Boolean).join('\n\n');

  const handleCopy = async () => {
    if (await copy(fullText)) showToast(t('toast.copied'), 'success');
  };

  const handleRefine = (instruction: string) => {
    if (!instruction.trim() || isRefining) return;
    setCustomInstruction('');
    void refine(caption, instruction, t('toast.error'));
  };

  return (
    <article
      aria-label={`Caption ${index + 1} / ${total}`}
      className={[
        'card card-hover p-6 transition-opacity',
        isRefining ? 'opacity-40' : '',
      ].join(' ')}
    >
      <p className="whitespace-pre-wrap text-base leading-relaxed">{caption.text}</p>

      {caption.hashtags.length > 0 && (
        <p className="mt-2 text-sm font-semibold text-primary-500">
          {caption.hashtags.join(' ')}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-[#E5E7EB] pt-3 dark:border-[#3F3F46]">
        <button
          onClick={() => void handleCopy()}
          className={[
            'btn-press flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors',
            copied
              ? 'bg-success/15 text-success'
              : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] dark:bg-[#27272A] dark:text-[#A1A1AA] dark:hover:bg-[#3F3F46]',
          ].join(' ')}
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? t('caption.copied') : t('caption.copy')}
        </button>

        <button
          onClick={() => setRefineOpen((o) => !o)}
          aria-expanded={refineOpen}
          className="btn-press flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-[#6B7280] hover:bg-[#F3F4F6] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
        >
          <RefreshCw
            className={['h-4 w-4', isRefining ? 'animate-spin' : ''].join(' ')}
            aria-hidden="true"
          />
          {isRefining ? t('refine.loading') : t('caption.refine')}
        </button>

        <span className="ml-auto text-xs text-[#9CA3AF]" title="confidence">
          {Math.round(caption.confidence * 100)}%
        </span>
      </div>

      {refineOpen && (
        <div className="animate-fade-in pt-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {REFINE_CHIPS.map((chip) => (
              <button
                key={chip.key}
                disabled={isRefining}
                onClick={() => handleRefine(chip.instruction)}
                className="btn-press h-8 shrink-0 rounded-full bg-[#F3F4F6] px-3 text-[13px] font-medium text-[#374151] transition-transform hover:scale-105 hover:bg-[#E5E7EB] disabled:opacity-50 dark:bg-[#27272A] dark:text-[#A1A1AA] dark:hover:bg-[#3F3F46]"
              >
                {t(chip.key)}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRefine(customInstruction);
            }}
            placeholder={t('refine.placeholder')}
            disabled={isRefining}
            className="mt-2 h-8 w-full border-b border-[#E5E7EB] bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-primary-500 dark:border-[#3F3F46]"
          />
        </div>
      )}
    </article>
  );
}
