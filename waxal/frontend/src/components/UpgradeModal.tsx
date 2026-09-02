import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api, RequestError } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useCaptionStore } from '../store/captionStore';
import { useSettingsStore } from '../store/settingsStore';
import type { PlansResponse } from '../types';

export function UpgradeModal() {
  const t = useSettingsStore((s) => s.t);
  const { isUpgradeOpen, setUpgradeOpen, showToast } = useCaptionStore();
  const { user, setUser } = useAuthStore();
  const [plans, setPlans] = useState<PlansResponse | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isUpgradeOpen && !plans) {
      api.plans().then(setPlans).catch(() => undefined);
    }
  }, [isUpgradeOpen, plans]);

  if (!isUpgradeOpen) return null;

  const handleUpgrade = async () => {
    setBusy(true);
    try {
      const updated = await api.upgrade();
      setUser(updated);
      setUpgradeOpen(false);
      showToast(t('plans.upgraded'), 'success');
    } catch (e) {
      showToast(
        e instanceof RequestError && e.code === 'PAYMENT_NOT_CONFIGURED'
          ? t('plans.notReady')
          : t('toast.error'),
        e instanceof RequestError && e.code === 'PAYMENT_NOT_CONFIGURED'
          ? 'info'
          : 'error',
      );
    } finally {
      setBusy(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString('fr-FR');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('plans.title')}
    >
      <button
        aria-label="Close"
        onClick={() => setUpgradeOpen(false)}
        className="absolute inset-0 bg-black/40"
      />
      <div className="card relative w-full max-w-md animate-slide-up p-6">
        <button
          onClick={() => setUpgradeOpen(false)}
          aria-label="Close"
          className="btn-press absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-[#27272A]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <h2 className="mb-4 text-lg font-bold">{t('plans.title')}</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-[1.5px] border-[#E5E7EB] p-4 dark:border-[#3F3F46]">
            <div className="text-sm font-semibold text-[#6B7280] dark:text-[#A1A1AA]">
              {t('plans.free')}
            </div>
            <div className="mt-1 text-2xl font-extrabold">
              0 <span className="text-sm font-medium">{t('plans.fcfa')}</span>
            </div>
            <div className="mt-2 flex items-start gap-1.5 text-sm text-[#374151] dark:text-[#A1A1AA]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              {t('plans.captionsPerMonth', { n: plans?.free.monthly_generations ?? 10 })}
            </div>
            {user?.plan !== 'pro' && (
              <div className="mt-3 text-xs font-medium text-[#9CA3AF]">
                {t('plans.current')} ✓
              </div>
            )}
          </div>

          <div className="rounded-2xl border-2 border-primary-500 bg-[#EEF2FF] p-4 dark:bg-primary-500/10">
            <div className="text-sm font-semibold text-primary-600 dark:text-primary-500">
              {t('plans.pro')} ⭐
            </div>
            <div className="mt-1 text-2xl font-extrabold">
              {fmt(plans?.pro.price_fcfa ?? 2500)}{' '}
              <span className="text-sm font-medium">
                {t('plans.fcfa')} {t('plans.perMonth')}
              </span>
            </div>
            <div className="mt-2 flex items-start gap-1.5 text-sm text-[#374151] dark:text-[#A1A1AA]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              {t('plans.captionsPerMonth', { n: plans?.pro.monthly_generations ?? 500 })}
            </div>
            {user?.plan === 'pro' ? (
              <div className="mt-3 text-xs font-medium text-primary-600 dark:text-primary-500">
                {t('plans.current')} ✓
              </div>
            ) : (
              <button
                onClick={() => void handleUpgrade()}
                disabled={busy}
                className="btn-press mt-3 h-9 w-full rounded-lg bg-gradient-to-r from-primary-500 to-[#8B5CF6] text-sm font-semibold text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)] disabled:opacity-60"
              >
                {busy ? '…' : t('plans.upgradeBtn')}
              </button>
            )}
          </div>
        </div>

        {plans && !plans.payment_ready && (
          <p className="mt-4 text-center text-xs text-[#9CA3AF]">{t('plans.notReady')}</p>
        )}
      </div>
    </div>
  );
}
