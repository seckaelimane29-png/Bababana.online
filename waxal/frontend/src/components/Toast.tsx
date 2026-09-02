import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

import { useCaptionStore } from '../store/captionStore';

const STYLES = {
  success: { border: 'border-l-success', Icon: CheckCircle2, icon: 'text-success' },
  error: { border: 'border-l-error', Icon: AlertCircle, icon: 'text-error' },
  info: { border: 'border-l-[#3B82F6]', Icon: Info, icon: 'text-[#3B82F6]' },
} as const;

export function Toast() {
  const toast = useCaptionStore((s) => s.toast);
  if (!toast) return null;

  const { border, Icon, icon } = STYLES[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-8 left-1/2 z-50 flex min-w-[280px] max-w-[480px] -translate-x-1/2 animate-slide-up items-center gap-3 rounded-xl border border-[#E5E7EB] border-l-4 bg-white px-5 py-4 shadow-[0_24px_48px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.08)] dark:border-[#3F3F46] dark:bg-[#1A1A1E] ${border}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${icon}`} aria-hidden="true" />
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}
