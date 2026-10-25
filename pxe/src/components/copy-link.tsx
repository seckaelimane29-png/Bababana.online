'use client';

import { useState, useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/** Shows a shareable URL with a copy button; the URL stays selectable without JS. */
export function CopyLink({ path, copyLabel, copiedLabel }: { path: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  // Origin is only known in the browser; the server renders the path alone.
  const origin = useSyncExternalStore(noSubscribe, () => window.location.origin, () => '');
  const url = `${origin}${path}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the text stays selectable */
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas p-1.5 pl-3">
      <code className="min-w-0 flex-1 truncate text-xs text-muted select-all">{url.replace(/^https?:\/\//, '')}</code>
      <button type="button" onClick={copy} className="btn btn-primary min-h-9 px-3 text-xs" aria-live="polite">
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
