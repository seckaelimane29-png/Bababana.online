import { Clock, LogOut, Moon, Sparkles, Sun } from 'lucide-react';

import { UI_LANGUAGES } from '../i18n';
import { useAuthStore } from '../store/authStore';
import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';
import type { UiLanguage } from '../types';

export function Navbar() {
  const { t, uiLanguage, setUiLanguage, theme, toggleTheme } = useSettingsStore();
  const { user, openAuthModal, logout } = useAuthStore();
  const toggleHistory = useCaptionStore((s) => s.toggleHistory);
  const setUpgradeOpen = useCaptionStore((s) => s.setUpgradeOpen);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#E5E7EB] bg-white/90 backdrop-blur dark:border-[#3F3F46] dark:bg-[#1A1A1E]/90">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-500" aria-hidden="true" />
          <span className="text-lg font-semibold">Waxal</span>
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          <select
            aria-label="Language / Làkk"
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value as UiLanguage)}
            className="h-9 rounded-lg border border-[#E5E7EB] bg-transparent px-1.5 text-sm dark:border-[#3F3F46] dark:bg-[#1A1A1E]"
          >
            {UI_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={toggleTheme}
            aria-label={t('theme.toggle')}
            className="btn-press flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {user && (
            <button
              onClick={toggleHistory}
              className="btn-press flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('nav.history')}</span>
            </button>
          )}

          {user ? (
            <>
              {user.plan !== 'pro' && (
                <button
                  onClick={() => setUpgradeOpen(true)}
                  className="btn-press hidden h-9 items-center rounded-lg bg-gradient-to-r from-primary-500 to-[#8B5CF6] px-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)] sm:flex"
                >
                  {t('nav.upgrade')}
                </button>
              )}
              <span
                className="ml-1 hidden max-w-[120px] truncate text-sm text-[#6B7280] dark:text-[#A1A1AA] md:inline"
                title={user.email}
              >
                {user.display_name}
                {user.plan === 'pro' && ' ⭐'}
              </span>
              <button
                onClick={logout}
                aria-label={t('nav.logout')}
                title={t('nav.logout')}
                className="btn-press flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="btn-press h-9 rounded-lg px-3 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
              >
                {t('nav.login')}
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="btn-press h-9 rounded-lg bg-primary-500 px-3 text-sm font-semibold text-white hover:bg-primary-600"
              >
                {t('nav.register')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
