import { ProjectStatus } from './project.model';

export interface StatusCount {
  status: ProjectStatus;
  count: number;
}

export interface RecentProject {
  id: number;
  name: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface StatsData {
  total: number;
  byStatus: StatusCount[];
  recent: RecentProject[];
}

export interface StatsResponse {
  success: boolean;
  data: StatsData;
}
