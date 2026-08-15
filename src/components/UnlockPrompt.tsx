import { X } from "lucide-react";
import { PaywallHeader, PricingCards } from "@/components/PricingCards";

export function UnlockPrompt({
  bookTitle,
  insightCount,
  onClose,
}: {
  bookTitle: string;
  insightCount: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t px-5 pb-10 pt-6 duration-300 animate-in slide-in-from-bottom"
        style={{ background: "var(--navy)", borderColor: "var(--gold)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close and stay on the free plan"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-[11px] uppercase tracking-[0.25em] text-white/45">
          {bookTitle} · insight 1 of {insightCount}
        </div>
        <div className="mt-3">
          <PaywallHeader compact />
        </div>

        <PricingCards compact />
      </div>
    </div>
  );
}
