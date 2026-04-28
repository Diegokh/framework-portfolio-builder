import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MessagesResponse } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/contact`;

  getInbox() {
    return this.http.get<MessagesResponse>(this.url);
  }

  markAsRead(id: number) {
    return this.http.patch<{ success: boolean }>(`${this.url}/${id}/read`, {});
  }

  delete(id: number) {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`);
  }

  send(userId: number, fromName: string, fromEmail: string, body: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.url}/send/${userId}`,
      { fromName, fromEmail, body }
    );
  }
}
