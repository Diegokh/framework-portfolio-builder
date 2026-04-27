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

  update(data: Partial<Profile>) {
    return this.http.put<{ success: boolean; message: string }>(this.apiUrl, data);
  }
}
