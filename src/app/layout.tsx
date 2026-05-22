import type { Metadata, Viewport } from 'next';
import { Amatic_SC, Bebas_Neue, Castoro, Petit_Formal_Script } from 'next/font/google';

import './globals.css';
import { MotionProvider } from '@/components/shared/MotionProvider';
import { COUPLE, SITE } from '@/lib/constants';

/**
 * h1 display font: Bebas Neue — all-caps condensed grotesque, bold and
 * architectural. Replaces Boldonse. Exposed as --font-display.
 */
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
  display: 'swap',
  adjustFontFallback: false,
});

/**
 * h2–h6 script font: Petit Formal Script — delicate connected script with
 * a light, airy stroke weight. Exposed as --font-script.
 */
const petitFormalScript = Petit_Formal_Script({
  subsets: ['latin'],
  variable: '--font-script',
  weight: '400',
  display: 'swap',
});

/**
 * Body font: Castoro — an elegant old-style serif with good reading rhythm.
 * Exposed as --font-body; replaces Roboto.
 */
const castoro = Castoro({
  subsets: ['latin'],
  variable: '--font-body',
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

/**
 * Accent font: Amatic SC — hand-lettered small caps. Available via
 * --font-accent for small uppercase tracking labels (e.g. "You're invited",
 * "Tap to enter"). Not applied globally; use the `font-accent` Tailwind
 * utility where needed.
 */
const amaticSC = Amatic_SC({
  subsets: ['latin'],
  variable: '--font-accent',
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s — ${SITE.title}`,
  },
  description: SITE.description,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.title,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#e8dccb',
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom stays enabled at the document level; the canvas opts out locally.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bebasNeue.variable} ${petitFormalScript.variable} ${castoro.variable} ${amaticSC.variable}`}>
      <body data-couple={`${COUPLE.partnerOne}-${COUPLE.partnerTwo}`}>
        <a
          href="#gifts"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink/10 focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to gift links
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
