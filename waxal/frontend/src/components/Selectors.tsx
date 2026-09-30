import {
  Briefcase,
  Coffee,
  Feather,
  Instagram,
  Languages,
  Lightbulb,
  Linkedin,
  Music2,
  Rocket,
  Twitter,
} from 'lucide-react';
import type { ComponentType } from 'react';

import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';
import type { CaptionLanguage, Platform, Tone } from '../types';

const TONES: { tone: Tone; Icon: ComponentType<{ className?: string }>; gradient: string; shadow: string }[] = [
  { tone: 'witty', Icon: Lightbulb, gradient: 'from-[#F59E0B] to-[#EF4444]', shadow: 'shadow-[0_2px_8px_rgba(245,158,11,0.3)]' },
  { tone: 'professional', Icon: Briefcase, gradient: 'from-[#1E40AF] to-[#3B82F6]', shadow: 'shadow-[0_2px_8px_rgba(59,130,246,0.3)]' },
  { tone: 'poetic', Icon: Feather, gradient: 'from-[#8B5CF6] to-[#EC4899]', shadow: 'shadow-[0_2px_8px_rgba(139,92,246,0.3)]' },
  { tone: 'casual', Icon: Coffee, gradient: 'from-[#10B981] to-[#3B82F6]', shadow: 'shadow-[0_2px_8px_rgba(16,185,129,0.3)]' },
  { tone: 'hype', Icon: Rocket, gradient: 'from-[#EF4444] to-[#F97316]', shadow: 'shadow-[0_2px_8px_rgba(239,68,68,0.3)]' },
];

export function ToneSelector() {
  const t = useSettingsStore((s) => s.t);
  const selected = useCaptionStore((s) => s.selectedTone);
  const setTone = useCaptionStore((s) => s.setTone);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[#374151] dark:text-[#A1A1AA]">
        {t('tone.label')}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {TONES.map(({ tone, Icon, gradient, shadow }) => {
          const isSelected = selected === tone;
          return (
            <button
              key={tone}
              onClick={() => setTone(tone)}
              aria-pressed={isSelected}
              className={[
                'btn-press flex h-10 shrink-0 items-center gap-1.5 rounded-full px-5 text-sm transition-all',
                isSelected
                  ? `bg-gradient-to-r ${gradient} ${shadow} scale-[1.02] font-semibold text-white`
                  : 'border-[1.5px] border-[#E5E7EB] bg-white font-medium text-[#374151] hover:-translate-y-px hover:border-[#D1D5DB] hover:bg-[#F9FAFB] dark:border-[#3F3F46] dark:bg-[#1A1A1E] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]',
              ].join(' ')}
            >
              <Icon
                className={['h-4 w-4', isSelected ? 'text-white' : 'text-[#9CA3AF]'].join(' ')}
                aria-hidden="true"
              />
              {t(`tone.${tone}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PLATFORMS: { platform: Platform; Icon: ComponentType<{ className?: string }>; name: string }[] = [
  { platform: 'instagram', Icon: Instagram, name: 'Instagram' },
  { platform: 'tiktok', Icon: Music2, name: 'TikTok' },
  { platform: 'twitter', Icon: Twitter, name: 'Twitter / X' },
  { platform: 'linkedin', Icon: Linkedin, name: 'LinkedIn' },
];

export function PlatformSelector() {
  const t = useSettingsStore((s) => s.t);
  const selected = useCaptionStore((s) => s.selectedPlatform);
  const setPlatform = useCaptionStore((s) => s.setPlatform);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[#374151] dark:text-[#A1A1AA]">
        {t('platform.label')}
      </h3>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {PLATFORMS.map(({ platform, Icon, name }) => {
          const isSelected = selected === platform;
          return (
            <button
              key={platform}
              onClick={() => setPlatform(platform)}
              aria-pressed={isSelected}
              className={[
                'btn-press relative min-h-[100px] rounded-2xl p-5 text-left transition-all',
                isSelected
                  ? 'border-2 border-primary-500 bg-[#EEF2FF] dark:bg-primary-500/10'
                  : 'border-[1.5px] border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:border-[#3F3F46] dark:bg-[#1A1A1E]',
              ].join(' ')}
            >
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  ✓
                </span>
              )}
              <Icon
                className={[
                  'mb-2 h-7 w-7',
                  isSelected ? 'text-primary-500' : 'text-[#6B7280] dark:text-[#A1A1AA]',
                ].join(' ')}
                aria-hidden="true"
              />
              <div className="text-[15px] font-semibold">{name}</div>
              <div className="text-xs text-[#6B7280] dark:text-[#A1A1AA]">
                {t(`platform.${platform}`)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const CAPTION_LANGS: CaptionLanguage[] = ['wolof', 'wolof_pure', 'french'];

export function CaptionLanguageSelector() {
  const t = useSettingsStore((s) => s.t);
  const selected = useCaptionStore((s) => s.captionLanguage);
  const setCaptionLanguage = useCaptionStore((s) => s.setCaptionLanguage);

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#374151] dark:text-[#A1A1AA]">
        <Languages className="h-4 w-4" aria-hidden="true" />
        {t('lang.label')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {CAPTION_LANGS.map((lang) => {
          const isSelected = selected === lang;
          return (
            <button
              key={lang}
              onClick={() => setCaptionLanguage(lang)}
              aria-pressed={isSelected}
              className={[
                'btn-press h-8 rounded-full px-4 text-[13px] font-medium transition-all',
                isSelected
                  ? 'border border-primary-500 bg-[#EEF2FF] text-primary-600 dark:bg-primary-500/10 dark:text-primary-500'
                  : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] dark:bg-[#27272A] dark:text-[#A1A1AA] dark:hover:bg-[#3F3F46]',
              ].join(' ')}
            >
              {t(`lang.${lang}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
