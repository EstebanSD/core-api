export const TECH_STACK = ['react', 'nextjs', 'nestjs', 'mongodb', 'docker'] as const;
export type TechStack = (typeof TECH_STACK)[number];
