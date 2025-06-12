export const EXPERIENCE_TYPE_ENUM = [
  'freelance',
  'employment',
  'internship',
  'volunteering',
  'contract',
] as const;

export type ExperienceType = (typeof EXPERIENCE_TYPE_ENUM)[number];
