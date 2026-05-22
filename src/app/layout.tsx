import type { Metadata, Viewport } from 'next';
import { Yellowtail, Playfair_Display, Roboto } from 'next/font/google';

import './globals.css';
import { MotionProvider } from '@/components/shared/MotionProvider';
import { COUPLE, SITE } from '@/lib/constants';

/**
 * h1 script font: Yellowtail — flowing, handwritten script for hero headlines.
 * Exposed as --font-script; applied to h1 in globals.css.
 */
const yellowtail = Yellowtail({
  subsets: ['latin'],
  variable: '--font-script',
  weight: '400',
  display: 'swap',
});

/**
 * Display/subheading font: Playfair Display — elegant editorial serif for h2–h6.
 * Exposed as --font-display; replaces the previous Josefin Sans geometric.
 * To swap back to Josefin Sans or a self-hosted font, change this import and
 * keep the same variable name so no other code needs updating.
 */
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
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
  themeColor: '#fdf6f0',
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom stays enabled at the document level; the canvas opts out locally.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${yellowtail.variable} ${playfairDisplay.variable} ${roboto.variable}`}>
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
