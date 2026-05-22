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
 * Warm pastel wedding theme:
 *   void    → warm ivory background
 *   peach   → terracotta / deep peach — primary accent (hero text, interactive)
 *   terra   → reddish brown — secondary accent (italic emphasis)
 *   blue    → muted dusty blue — tertiary accent
 *   ink     → warm espresso — body text
 */
export const PALETTE = {
  void: '#FDF6F0',
  peach: '#C4724E',
  terra: '#8A3E2A',
  blue: '#8FADBF',
  ink: '#2E1812',
} as const;
