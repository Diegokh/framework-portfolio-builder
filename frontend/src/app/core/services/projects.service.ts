import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ProjectsResponse,
  ProjectResponse,
  CreateProjectResponse,
  Project,
} from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  getAll() {
    return this.http.get<ProjectsResponse>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Project>) {
    return this.http.post<CreateProjectResponse>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Project>) {
    return this.http.put<ProjectResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }
}
