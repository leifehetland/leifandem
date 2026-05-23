/**
 * All translatable UI strings for English and Bokmål Norwegian.
 *
 * Usage: import { useT } from '@/hooks/useT' in any client component.
 * To add a string: add the key to both `en` and `no` objects.
 */

export const translations = {
  en: {
    // Loading screen
    surpriseTagline: 'Surprise! We tied the knot…',
    tapToEnter: 'Tap to enter',

    // Navigation
    ourStory: 'Our Story',
    ceremony: 'Ceremony',
    throwbacks: 'Throwbacks',
    registry: 'Registry',

    // Panels / modals — shared
    close: 'Close',
    skipToGifts: 'Skip to gift links',

    // Ceremony grid
    ceremonyTitle: 'Ceremony',
    ceremonyAriaLabel: 'Ceremony photos',

    // Throwbacks grid
    throwbacksTitle: 'Throwbacks',
    throwbacksAriaLabel: 'Throwback photos',

    // Gift modal
    giftHeading:
      'Your presence in our lives has been the greatest gift. For those who wish to invest in future adventures, a honeymoon fund awaits.',
    giftBody:
      'The couple will be planning a bucket-list trip to Japan for our honeymoon! There are no expectations for monetary support. However, if you are in a position to give, we would appreciate contributions toward our honeymoon and our home.\nWe’ve partnered with Honeyfund to make it easy. Honeyfund supports both domestic and international transactions, so this should work for friends and family in the US and Norway alike.',
    closeGiftOptions: 'Close support options',

    // Locale toggle
    switchToNorwegian: 'Switch to Norwegian',
    switchToEnglish: 'Switch to English',

    // Bunz secret gallery
    bunzTitle: 'Bunz 🐱',
    bunzAriaLabel: 'Bunz photo gallery',
  },

  no: {
    // Loading screen
    surpriseTagline: 'Overraskelse! Vi giftet oss…',
    tapToEnter: 'Trykk for å gå inn',

    // Navigation
    ourStory: 'Vår Historie',
    ceremony: 'Seremonien',
    throwbacks: 'Tilbakeblikk',
    registry: 'Ønskeliste',

    // Panels / modals — shared
    close: 'Lukk',
    skipToGifts: 'Hopp til gavelenkene',

    // Ceremony grid
    ceremonyTitle: 'Seremonien',
    ceremonyAriaLabel: 'Seremoniebilder',

    // Throwbacks grid
    throwbacksTitle: 'Tilbakeblikk',
    throwbacksAriaLabel: 'Tilbakeblikk-bilder',

    // Gift modal
    giftHeading:
      'Din tilstedeværelse i livene våre har vært den største gaven. For de som ønsker å bidra til fremtidige eventyr, venter et bråndsreisefond.',
    giftBody:
      'Paret planlegger en drømmereise til Japan for bråndsreisen! Vi forventer ingen pengegaver. Men hvis du ønsker å gi noe, setter vi stor pris på bidrag til bråndsreisen vår og hjemmet vårt.\nVi har samarbeidet med Honeyfund for å gjøre det enkelt. Honeyfund støtter både nasjonale og internasjonale transaksjoner, så dette bør fungere for venner og familie i USA og Norge.',
    closeGiftOptions: 'Lukk støttealternativer',

    // Locale toggle
    switchToNorwegian: 'Bytt til norsk',
    switchToEnglish: 'Bytt til engelsk',

    // Bunz secret gallery
    bunzTitle: 'Bunz 🐱',
    bunzAriaLabel: 'Bildegalleri for Bunz',
  },
} as const;

export type Translations = typeof translations.en;
export type TranslationKey = keyof Translations;
