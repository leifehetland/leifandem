import type { Metadata, Viewport } from 'next';
import { Boldonse, Pinyon_Script, Roboto } from 'next/font/google';

import './globals.css';
import { MotionProvider } from '@/components/shared/MotionProvider';
import { COUPLE, SITE } from '@/lib/constants';

/**
 * h1 display font: Boldonse — condensed bold sans with ink-trap details,
 * matching the antique invite's all-caps banner. Single weight (400).
 * Exposed as --font-display; applied to h1 in globals.css.
 */
const boldonse = Boldonse({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
  display: 'swap',
  // Boldonse isn't in next/font's size-adjust DB yet — opt out of the warning.
  adjustFontFallback: false,
});

/**
 * h2–h6 script font: Pinyon Script — formal italic with Spencerian swash
 * capitals, matching the "please join us / Montauk / May" copy on the invite.
 * Single weight (400). Exposed as --font-script.
 */
const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  variable: '--font-script',
  weight: '400',
  display: 'swap',
});

/** Body font: Roboto for all prose, captions, labels, and links. */
const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
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
    <html lang="en" suppressHydrationWarning className={`${boldonse.variable} ${pinyonScript.variable} ${roboto.variable}`}>
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
