/**
 * Payment provider abstraction. No provider is integrated yet: the candidates
 * below are under evaluation and have NOT been verified for merchant
 * eligibility, currencies, fees, settlement, refunds or webhooks. See
 * docs/ARCHITECTURE.md §5. Checkout stays closed until an adapter is
 * implemented, configured with credentials, and verified end to end.
 */
import type { Currency } from '@/lib/money';

export type ProviderId = 'paydunya' | 'modempay' | 'paytech' | 'stripe';

export interface CheckoutInput {
  orderId: string;
  amountMinor: number;
  currency: Currency;
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface VerifiedEvent {
  providerEventId: string;
  reference: string;
  type: 'payment.succeeded' | 'payment.failed' | 'payment.cancelled' | 'refund.succeeded' | 'other';
  raw: unknown;
}

export interface ProviderPaymentStatus {
  reference: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  amountMinor: number;
  currency: Currency;
  providerFeeMinor?: number;
}

/** What every provider adapter must implement. All methods run server-side only. */
export interface PaymentProvider {
  id: ProviderId;
  supports(currency: Currency): boolean;
  createCheckout(input: CheckoutInput): Promise<{ reference: string; redirectUrl: string }>;
  /** Must throw if the signature is invalid. */
  verifyWebhook(request: Request): Promise<VerifiedEvent>;
  /** Re-read the payment from the provider before trusting any webhook. */
  fetchPayment(reference: string): Promise<ProviderPaymentStatus>;
  refund?(reference: string, amountMinor: number): Promise<{ status: 'succeeded' | 'pending' | 'failed' }>;
}

export interface ProviderCandidate {
  id: ProviderId;
  name: string;
  /** Expected coverage from preliminary research — unverified. */
  expectedCurrencies: Currency[];
  /** Env vars the adapter will need (names only; values never reach the browser). */
  requiredEnv: string[];
  /** Adapter written and tested? */
  implemented: boolean;
}

export const PROVIDER_CANDIDATES: ProviderCandidate[] = [
  { id: 'paydunya', name: 'PayDunya', expectedCurrencies: ['XOF'], requiredEnv: ['PAYDUNYA_MASTER_KEY', 'PAYDUNYA_PRIVATE_KEY', 'PAYDUNYA_TOKEN'], implemented: false },
  { id: 'paytech', name: 'PayTech', expectedCurrencies: ['XOF'], requiredEnv: ['PAYTECH_API_KEY', 'PAYTECH_API_SECRET'], implemented: false },
  { id: 'modempay', name: 'Modem Pay', expectedCurrencies: ['GMD'], requiredEnv: ['MODEMPAY_SECRET_KEY', 'MODEMPAY_WEBHOOK_SECRET'], implemented: false },
  { id: 'stripe', name: 'Stripe', expectedCurrencies: ['EUR'], requiredEnv: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'], implemented: false },
];

const adapters: Partial<Record<ProviderId, PaymentProvider>> = {
  // Adapters register here once implemented and verified.
};

function isConfigured(candidate: ProviderCandidate, env: Record<string, string | undefined>): boolean {
  return candidate.requiredEnv.every((key) => Boolean(env[key]?.trim()));
}

/**
 * Providers that can actually take a payment in `currency` right now:
 * implemented AND configured AND registered. Today this is always empty.
 */
export function availableProviders(
  currency: Currency,
  env: Record<string, string | undefined> = process.env,
): PaymentProvider[] {
  return PROVIDER_CANDIDATES.flatMap((candidate) => {
    const adapter = adapters[candidate.id];
    if (!candidate.implemented || !adapter || !isConfigured(candidate, env)) return [];
    return adapter.supports(currency) ? [adapter] : [];
  });
}

export function isCheckoutOpen(currencies: Currency[], env?: Record<string, string | undefined>): boolean {
  return currencies.some((c) => availableProviders(c, env).length > 0);
}
