export type TechnologyRole = 'frontend' | 'backend' | 'db' | 'devops';

export interface Technology {
  id: number;
  projectId: number;
  technology: string;
  role: TechnologyRole;
}

export interface TechnologiesResponse {
  success: boolean;
  data: Technology[];
}

export interface CreateTechnologyResponse {
  success: boolean;
  id: number;
}
