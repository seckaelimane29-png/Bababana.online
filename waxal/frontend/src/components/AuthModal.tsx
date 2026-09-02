import { X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { useAuthStore } from '../store/authStore';
import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';

export function AuthModal() {
  const t = useSettingsStore((s) => s.t);
  const {
    isAuthModalOpen,
    authMode,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    isSubmitting,
    authError,
  } = useAuthStore();
  const showToast = useCaptionStore((s) => s.showToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isAuthModalOpen) return null;

  const isRegister = authMode === 'register';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = isRegister
      ? await register(email, password, name)
      : await login(email, password);
    if (ok) {
      const user = useAuthStore.getState().user;
      showToast(t('auth.welcome', { name: user?.display_name ?? '' }), 'success');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
    >
      <button
        aria-label="Close"
        onClick={closeAuthModal}
        className="absolute inset-0 bg-black/40"
      />
      <div className="card relative w-full max-w-sm animate-slide-up p-6">
        <button
          onClick={closeAuthModal}
          aria-label="Close"
          className="btn-press absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-[#27272A]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <h2 className="mb-4 pr-8 text-lg font-bold">
          {isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
        </h2>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          {isRegister && (
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.name')}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm outline-none focus:border-primary-500 dark:border-[#3F3F46] dark:bg-[#27272A]"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm outline-none focus:border-primary-500 dark:border-[#3F3F46] dark:bg-[#27272A]"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password')}
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm outline-none focus:border-primary-500 dark:border-[#3F3F46] dark:bg-[#27272A]"
          />

          {authError && (
            <p className="animate-shake text-sm font-medium text-error">{authError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-press h-11 w-full rounded-xl bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {isSubmitting ? '…' : isRegister ? t('auth.registerBtn') : t('auth.loginBtn')}
          </button>
        </form>

        <button
          onClick={() => openAuthModal(isRegister ? 'login' : 'register')}
          className="mt-3 w-full text-center text-sm text-primary-500 hover:underline"
        >
          {isRegister ? t('auth.switchToLogin') : t('auth.switchToRegister')}
        </button>
      </div>
    </div>
  );
}
