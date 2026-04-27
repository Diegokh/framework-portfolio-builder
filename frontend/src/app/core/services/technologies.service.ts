import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TechnologiesResponse, CreateTechnologyResponse, TechnologyRole } from '../models/technology.model';

@Injectable({ providedIn: 'root' })
export class TechnologiesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(projectId: number) {
    return this.http.get<TechnologiesResponse>(`${this.apiUrl}/projects/${projectId}/technologies`);
  }

  create(projectId: number, technology: string, role: TechnologyRole) {
    return this.http.post<CreateTechnologyResponse>(
      `${this.apiUrl}/projects/${projectId}/technologies`,
      { technology, role }
    );
  }

  delete(projectId: number, id: number) {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/projects/${projectId}/technologies/${id}`
    );
  }
}
