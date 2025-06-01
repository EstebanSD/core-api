export const PROJECT_STATUSES = ['in_progress', 'completed', 'paused'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = ['personal', 'company', 'freelance'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];
