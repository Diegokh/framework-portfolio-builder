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
