import { useEffect } from 'react';

import { AuthModal } from './components/AuthModal';
import { CaptionResults } from './components/CaptionResults';
import { GenerateButton } from './components/GenerateButton';
import { HistorySidebar } from './components/HistorySidebar';
import { Navbar } from './components/Navbar';
import {
  CaptionLanguageSelector,
  PlatformSelector,
  ToneSelector,
} from './components/Selectors';
import { Toast } from './components/Toast';
import { UpgradeModal } from './components/UpgradeModal';
import { UploadZone } from './components/UploadZone';
import { useAuthStore } from './store/authStore';
import { useCaptionStore } from './store/captionStore';
import { useSettingsStore } from './store/settingsStore';

export default function App() {
  const { t, theme } = useSettingsStore();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { includeHashtags, setIncludeHashtags, context, setContext } =
    useCaptionStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <section className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t('heroTitle')} <span aria-hidden="true">✨</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-[#6B7280] dark:text-[#A1A1AA]">
            {t('heroSubtitle')}
          </p>
        </section>

        <div className="mx-auto max-w-3xl space-y-6">
          <UploadZone />
          <ToneSelector />
          <PlatformSelector />
          <CaptionLanguageSelector />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#374151] dark:text-[#A1A1AA]">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="h-4 w-4 accent-primary-500"
              />
              {t('options.hashtags')}
            </label>
            <input
              type="text"
              value={context}
              maxLength={500}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t('options.contextPlaceholder')}
              aria-label={t('options.context')}
              className="h-10 flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-primary-500 dark:border-[#3F3F46] dark:bg-[#1A1A1E]"
            />
          </div>

          <GenerateButton />
        </div>

        <div className="mt-10">
          <CaptionResults />
        </div>
      </main>

      <footer className="border-t border-[#E5E7EB] py-6 text-center text-sm text-[#9CA3AF] dark:border-[#3F3F46]">
        Waxal · {t('footer.madeIn')}
      </footer>

      <HistorySidebar />
      <AuthModal />
      <UpgradeModal />
      <Toast />
    </div>
  );
}
