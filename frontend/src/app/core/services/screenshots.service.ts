import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ScreenshotsResponse } from '../models/screenshot.model';

@Injectable({ providedIn: 'root' })
export class ScreenshotsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAllForUser() {
    return this.http.get<ScreenshotsResponse>(`${this.apiUrl}/screenshots`);
  }

  getAll(projectId: number) {
    return this.http.get<ScreenshotsResponse>(`${this.apiUrl}/projects/${projectId}/screenshots`);
  }

  upload(projectId: number, file: File, caption: string, order: number) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);
    formData.append('order', order.toString());
    return this.http.post<{ success: boolean; id: number; imageUrl: string }>(
      `${this.apiUrl}/projects/${projectId}/screenshots`,
      formData
    );
  }

  delete(projectId: number, id: number) {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/projects/${projectId}/screenshots/${id}`
    );
  }
}
