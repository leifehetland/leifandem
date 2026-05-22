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
  dateDisplay: 'May 16, 2026',
  /** ISO 8601 date string for metadata / structured data. */
  dateISO: '2026-05-16 14:30:00.000',
} as const;

export const SITE = {
  url: 'https://example.com',
  title: `${COUPLE.partnerOne} & ${COUPLE.partnerTwo}`,
  description: `Save the date — ${COUPLE.partnerOne} & ${COUPLE.partnerTwo}.`,
} as const;

export const GIFT_LINKS = {
  amazon: 'https://www.amazon.com/wedding/registry',
  honeyfund: 'https://www.honeyfund.com',
} as const;

export const GIFT_COPY = {
  heading: "If you'd like to celebrate with us…",
  body: 'Your presence is the gift. If you’d still like to give something, either of these works perfectly.',
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
