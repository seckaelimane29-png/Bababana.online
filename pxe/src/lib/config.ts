/**
 * Runtime configuration read from environment variables (server-only values
 * never use the NEXT_PUBLIC_ prefix). See .env.example.
 */

/**
 * Demo mode serves the fictional catalogue in src/lib/catalog/demo-data.ts.
 * On by default in development; in production it must be enabled explicitly
 * (e.g. for a preview deployment) and is never mixed with real data.
 */
export function isDemoMode(): boolean {
  const flag = process.env.PXE_DEMO_MODE;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

/** Public support contact. Contact links are hidden when unset — no placeholders. */
export function supportEmail(): string | null {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
