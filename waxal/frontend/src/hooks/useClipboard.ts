import { useCallback, useRef, useState } from 'react';

export function useClipboard(timeoutMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for older browsers / non-secure contexts
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        try {
          document.execCommand('copy');
        } catch {
          document.body.removeChild(el);
          return false;
        }
        document.body.removeChild(el);
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), timeoutMs);
      return true;
    },
    [timeoutMs],
  );

  return { copied, copy };
}
