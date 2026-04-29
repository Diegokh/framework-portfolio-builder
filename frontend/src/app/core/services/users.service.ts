import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  skills?: string;
  projectsCount?: number;
}

export interface UsersResponse {
  success: boolean;
  data: PublicUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  search(query: string) {
    return this.http.get<UsersResponse>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }

  getAll(page = 1, limit = 20) {
    return this.http.get<UsersResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getById(id: number) {
    return this.http.get<{ success: boolean; data: PublicUser }>(`${this.apiUrl}/${id}`);
  }
}
