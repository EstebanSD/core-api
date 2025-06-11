export const ROLES_ENUM = ['Admin', 'User'] as const;
export type RolesType = (typeof ROLES_ENUM)[number];
