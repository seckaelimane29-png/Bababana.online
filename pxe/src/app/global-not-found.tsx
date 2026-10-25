import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = { title: 'Page not found · PXE' };

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <p className="eyebrow">404</p>
          <h1 className="mt-3 text-3xl font-semibold">Page not found · Page introuvable</h1>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/en" className="btn btn-primary">Home</Link>
            <Link href="/fr" className="btn btn-secondary">Accueil</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
