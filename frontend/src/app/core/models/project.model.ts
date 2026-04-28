export type ProjectStatus = 'in_progress' | 'published' | 'archived';

export interface Project {
  id: number;
  userId: number;
  name: string;
  description: string;
  repoUrl: string;
  liveUrl: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  coverStyle: string | null;
  coverIcon: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  visits: number;
  contacts: number;
  technologiesCount: number;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface CreateProjectResponse {
  success: boolean;
  id: number;
}
