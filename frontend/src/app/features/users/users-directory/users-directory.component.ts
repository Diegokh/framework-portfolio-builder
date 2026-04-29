import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { UsersService, PublicUser } from '../../../core/services/users.service';

@Component({
  selector: 'app-users-directory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatGridListModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1><mat-icon>people</mat-icon> Directorio de Desarrolladores</h1>
        <p class="subtitle">Encuentra y conoce a otros desarrolladores</p>
      </div>

      <!-- Búsqueda -->
      <div class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar desarrollador</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()"
            placeholder="Nombre, skill, tecnología..."
          />
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="search()">
          <mat-icon>search</mat-icon> Buscar
        </button>
        <button mat-stroked-button (click)="clearSearch()" *ngIf="searchQuery">
          <mat-icon>clear</mat-icon> Limpiar
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="spinner-container">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Resultados vacíos -->
      <div *ngIf="!loading() && users().length === 0" class="empty-state">
        <mat-card>
          <mat-icon class="empty-icon">group</mat-icon>
          <h2>{{ searchQuery ? 'Sin resultados' : 'No hay desarrolladores aún' }}</h2>
          <p>{{ searchQuery ? 'Intenta con otra búsqueda' : 'Sé el primero en compartir tu perfil' }}</p>
        </mat-card>
      </div>

      <!-- Grid de usuarios -->
      <div *ngIf="!loading() && users().length > 0" class="users-grid">
        <mat-card *ngFor="let user of users()" class="user-card" @slideIn>
          <div class="card-avatar">
            <div class="avatar">{{ getUserInitials(user.name) }}</div>
          </div>

          <mat-card-header>
            <mat-card-title>{{ user.name }}</mat-card-title>
            <mat-card-subtitle *ngIf="user.bio" [title]="user.bio">
              {{ truncate(user.bio, 60) }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="stats">
              <div class="stat" *ngIf="user.projectsCount">
                <mat-icon>folder_special</mat-icon>
                <span>{{ user.projectsCount }} proyecto<span *ngIf="user.projectsCount !== 1">s</span></span>
              </div>
              <div class="stat" *ngIf="user.skills as skills">
                <mat-icon>star</mat-icon>
                <span>{{ skills.split(',').length }} skills</span>
              </div>
            </div>

            <div class="skills" *ngIf="user.skills as skills">
              <span class="skill-tag" *ngFor="let skill of skills.split(',').slice(0, 3)">
                {{ skill.trim() }}
              </span>
              <span class="skill-tag more" *ngIf="skills.split(',').length > 3">
                +{{ skills.split(',').length - 3 }}
              </span>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <a [routerLink]="['/profiles', user.id]" mat-stroked-button>
              <mat-icon>person</mat-icon> Ver Perfil
            </a>
            <a *ngIf="user.github" [href]="user.github" target="_blank" rel="noopener" mat-icon-button>
              <mat-icon class="social-icon">code</mat-icon>
            </a>
            <a *ngIf="user.linkedin" [href]="user.linkedin" target="_blank" rel="noopener" mat-icon-button>
              <mat-icon class="social-icon">work</mat-icon>
            </a>
            <a *ngIf="user.website" [href]="user.website" target="_blank" rel="noopener" mat-icon-button>
              <mat-icon class="social-icon">language</mat-icon>
            </a>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Paginador -->
      <div *ngIf="!loading() && !searchQuery && pagination()" class="paginator-container">
        <mat-paginator
          [length]="pagination()?.total || 0"
          [pageSize]="pagination()?.limit || 20"
          [pageSizeOptions]="[10, 20, 50]"
          [pageIndex]="(pagination()?.page || 1) - 1"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 32px;
      font-weight: 500;
      margin: 0 0 8px;
    }

    .header h1 mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #667eea;
    }

    .subtitle {
      color: #999;
      font-size: 16px;
      margin: 0;
    }

    .search-section {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-state mat-card {
      max-width: 400px;
      margin: 0 auto;
      padding: 40px;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ddd;
      margin: 0 auto 16px;
    }

    .empty-state h2 {
      margin: 16px 0 8px;
      color: #333;
    }

    .empty-state p {
      color: #999;
      margin: 0;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .user-card {
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .user-card:hover {
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
      transform: translateY(-4px);
    }

    .card-avatar {
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      font-weight: bold;
      font-size: 24px;
      color: white;
    }

    mat-card-header {
      margin-top: 16px;
    }

    mat-card-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    mat-card-subtitle {
      color: #999;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 4px;
    }

    mat-card-content {
      padding: 16px;
      flex-grow: 1;
    }

    .stats {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
    }

    .stat mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #667eea;
    }

    .skills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .skill-tag {
      display: inline-block;
      background: #f0f0f0;
      color: #333;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .skill-tag.more {
      background: #667eea;
      color: white;
    }

    mat-card-actions {
      padding: 8px 16px;
      display: flex;
      gap: 8px;
      justify-content: space-between;
      margin-top: auto;
    }

    mat-card-actions a {
      flex: 1;
    }

    mat-card-actions a[mat-stroked-button] {
      margin-right: auto;
    }

    .social-icon {
      color: #667eea;
    }

    .paginator-container {
      display: flex;
      justify-content: center;
      margin-top: 32px;
    }

    @media (max-width: 768px) {
      .users-grid {
        grid-template-columns: 1fr;
      }

      .search-section {
        flex-direction: column;
      }

      .search-field {
        min-width: 100%;
      }
    }
  `,
})
export class UserDirectoryComponent implements OnInit {
  private readonly service = inject(UsersService);

  loading = signal(false);
  users = signal<PublicUser[]>([]);
  pagination = signal<any>(null);
  searchQuery = '';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page = 1) {
    this.loading.set(true);
    this.service.getAll(page).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      },
    });
  }

  search() {
    if (!this.searchQuery.trim()) {
      this.loadUsers();
      return;
    }

    this.loading.set(true);
    this.service.search(this.searchQuery).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.pagination.set(null); // No pagination for search results
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.loading.set(false);
      },
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadUsers();
  }

  onPageChange(event: PageEvent) {
    this.loadUsers(event.pageIndex + 1);
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  truncate(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
