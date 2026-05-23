/**
 * Site-wide constants.
 *
 * A non-developer should be able to update couple names, the date,
 * and the two gift URLs here without touching any React code.
 *
 * See CLAUDE.md §"Site copy lives in constants/MDX, not JSX".
 */

export const COUPLE = {
  partnerOne: 'Emily Rose Davis',
  partnerTwo: 'Leif Emmanuel Hetland',
  /** Human-readable date displayed in the hero. */
  dateDisplay: 'May 20, 2026',
  /** ISO 8601 date string for metadata / structured data. */
  dateISO: '2026-05-20 14:30:00.000',
} as const;

export const SITE = {
  url: 'https://example.com',
  title: `${COUPLE.partnerOne} + ${COUPLE.partnerTwo}`,
  description: `${COUPLE.partnerOne} + ${COUPLE.partnerTwo}.`,
} as const;

export const GIFT_LINKS = {
  honeyfund: 'https://www.honeyfund.com/site/davis-hetland-05-20-2026',
} as const;

export const GIFT_COPY = {
  heading: 'Your presence in our lives has been the greatest gift. For those who wish to invest in future adventures, a honeymoon fund awaits. ',
  body: `The couple will be planning a bucket-list trip to Japan for our honeymoon! There are no expectations for monetary support. However, if you are in a position to give, we would appreciate contributions toward our honeymoon and our home. 
We've partnered with Honeyfund to make it easy. Honeyfund supports both domestic and international transactions, so this should work for friends and family in the US and Norway alike.`,
} as const;

/**
 * Spotify playlist embedded in the bottom-pinned player bar.
 * Update `embedUrl` to swap the playlist (use the `/embed/playlist/...` URL
 * from Spotify's "Share → Embed playlist" dialog).
 */
export const PLAYLIST = {
  embedUrl:
    'https://open.spotify.com/embed/playlist/2nACHum35lEAC2uyu5wn3K?utm_source=generator&theme=0',
  title: 'Curated with love ❤️',
} as const;

/**
 * Palette — keep this in sync with globals.css custom properties.
 *
 * Antique-invite palette:
 *   void    → warm cream / antique paper — page background
 *   peach   → brick red / oxblood — body text + primary accent
 *   terra   → darker oxblood — strokes, secondary accent, bolder hits
 *   blue    → muted sage — tertiary accent (illustration, soft contrast)
 *   ink     → oxblood (same as peach) — body text token alias
 */
export const PALETTE = {
  void: '#E8DCCB',
  peach: '#A63838',
  terra: '#903634',
  blue: '#A9B78C',
  ink: '#A63838',
} as const;
