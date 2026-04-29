import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LinksResponse, CreateLinkResponse, LinkPreview, LinkType } from '../models/link.model';

@Injectable({ providedIn: 'root' })
export class LinksService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/links`;

  getAll() {
    return this.http.get<LinksResponse>(this.url);
  }

  fetchPreview(url: string) {
    return this.http.get<{ success: boolean; data: LinkPreview }>(
      `${this.url}/preview?url=${encodeURIComponent(url)}`
    );
  }

  getPublic(userId: number) {
    return this.http.get<LinksResponse>(`${this.url}/public/${userId}`);
  }

  create(data: { title: string; url: string; type: LinkType; projectId?: number | null; isPublic?: boolean; previewTitle?: string | null; previewDescription?: string | null; previewImage?: string | null }) {
    return this.http.post<CreateLinkResponse>(this.url, data);
  }

  update(id: number, data: { title: string; url: string; type: LinkType; projectId?: number | null; isPublic?: boolean; previewTitle?: string | null; previewDescription?: string | null; previewImage?: string | null }) {
    return this.http.put<{ success: boolean }>(`${this.url}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`);
  }
}
