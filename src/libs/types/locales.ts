export const LOCALE_ENUM = ['en', 'es'] as const;
export type LocaleType = (typeof LOCALE_ENUM)[number];
