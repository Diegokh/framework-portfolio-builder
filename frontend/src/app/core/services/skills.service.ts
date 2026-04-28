import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Skill, SkillCategory, SkillsResponse } from '../models/skill.model';

@Injectable({ providedIn: 'root' })
export class SkillsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/skills`;

  getAll() {
    return this.http.get<SkillsResponse>(this.url);
  }

  create(name: string, category: SkillCategory, level: number) {
    return this.http.post<{ success: boolean; id: number }>(this.url, { name, category, level });
  }

  delete(id: number) {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`);
  }
}
