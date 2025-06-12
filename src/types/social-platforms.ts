export const SOCIAL_PLATFORM_ENUM = [
  'github',
  'linkedin',
  'twitter',
  'instagram',
  'website',
] as const;
export type SocialPlatformType = (typeof SOCIAL_PLATFORM_ENUM)[number];
