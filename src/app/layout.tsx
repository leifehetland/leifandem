import type { Metadata, Viewport } from 'next';
import {
  Bebas_Neue,
  Cormorant_Garamond,
  Outfit,
  Playwrite_US_Trad,
} from 'next/font/google';

import './globals.css';
import { MotionProvider } from '@/components/shared/MotionProvider';
import { COUPLE, SITE } from '@/lib/constants';

/**
 * h1 display font: Bebas Neue — all-caps condensed grotesque, bold and
 * architectural. Used for the couple's names in the hero and loading screen.
 * Exposed as --font-display.
 */
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
  display: 'swap',
  adjustFontFallback: false,
});

/**
 * h2–h6 heading font: Cormorant Garamond — elegant high-contrast serif with
 * gorgeous italic cuts. Used for section titles, panel mastheads, and all
 * sub-display headings. Exposed as --font-heading.
 */
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

/**
 * Body + UI font: Outfit — clean geometric sans-serif with a warm, modern
 * feel. Used for prose, captions, nav labels, and all UI text.
 * Exposed as --font-body.
 */
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

/**
 * Accent font: Playwrite US Trad — American grade-school cursive. Reserved
 * for romantic handwritten moments: the loading screen "Surprise!" and
 * "Tap to enter", and the couple's names in special contexts.
 * Exposed as --font-accent.
 *
 * Note: no italic style and no `subsets` other than `latin` are supported by
 * Google Fonts for this family — it's a handwriting-instruction font.
 */
const playwriteUSTrad = Playwrite_US_Trad({
  variable: '--font-accent',
  weight: ['100', '200', '300', '400'],
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

  /*
   * favicon.ico and apple-icon.png live in src/app/.
   * Next.js automatically emits the proper <link> tags.
   */
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#e8dccb',
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom remains enabled globally.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${bebasNeue.variable}
        ${cormorantGaramond.variable}
        ${outfit.variable}
        ${playwriteUSTrad.variable}
      `}
    >
      <body data-couple={`${COUPLE.partnerOne}-${COUPLE.partnerTwo}`}>
        <a
          href="#gifts"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink/10 focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to gift links / Hopp til gavelenkene
        </a>

        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
