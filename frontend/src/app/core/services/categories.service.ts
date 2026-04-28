import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CategoriesResponse, CreateCategoryResponse } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/categories`;

  getAll() {
    return this.http.get<CategoriesResponse>(this.url);
  }

  create(name: string, color: string, description?: string) {
    return this.http.post<CreateCategoryResponse>(this.url, { name, color, description });
  }

  update(id: number, name: string, color: string, description?: string) {
    return this.http.put<{ success: boolean }>(`${this.url}/${id}`, { name, color, description });
  }

  delete(id: number) {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`);
  }
}
