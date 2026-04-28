export type SkillCategory = 'frontend' | 'backend' | 'db' | 'devops' | 'soft' | 'other';

export interface Skill {
  id: number;
  userId: number;
  name: string;
  category: SkillCategory;
  level: number;
  createdAt: string;
}

export interface SkillsResponse {
  success: boolean;
  data: Skill[];
}
