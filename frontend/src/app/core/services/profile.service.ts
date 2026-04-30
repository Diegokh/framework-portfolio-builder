import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProfileResponse, Profile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  get() {
    return this.http.get<ProfileResponse>(this.apiUrl);
  }

  getPublic(userId: number) {
    return this.http.get<ProfileResponse>(`${environment.apiUrl}/profiles/public/${userId}`);
  }

  update(data: Partial<Profile>) {
    return this.http.put<{ success: boolean; message: string }>(this.apiUrl, data);
  }

  uploadCv(file: File) {
    const form = new FormData();
    form.append('cv', file);
    return this.http.post<{ success: boolean; cvUrl: string }>(`${this.apiUrl}/cv`, form);
  }

  deleteCv() {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/cv`);
  }

  uploadAvatar(file: File) {
    const form = new FormData();
    form.append('avatar', file);
    return this.http.post<{ success: boolean; url: string }>(`${this.apiUrl}/avatar`, form);
  }

  deleteAvatar() {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/avatar`);
  }

  uploadCover(file: File) {
    const form = new FormData();
    form.append('cover', file);
    return this.http.post<{ success: boolean; url: string }>(`${this.apiUrl}/cover`, form);
  }

  deleteCover() {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/cover`);
  }
}
