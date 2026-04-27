import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { StatsService } from '../../core/services/stats.service';
import { StatsData } from '../../core/models/stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="dashboard">
      <div class="dash-header">
        <h1>Panel de control</h1>
        <button mat-raised-button color="primary" routerLink="/projects">
          <mat-icon>folder</mat-icon> Ver proyectos
        </button>
      </div>

      @if (stats()) {
        <!-- Métricas -->
        <div class="metrics-grid">
          <mat-card class="metric-card total">
            <mat-card-content>
              <div class="metric-value">{{ stats()!.total }}</div>
              <div class="metric-label">Total proyectos</div>
            </mat-card-content>
          </mat-card>

          @for (item of stats()!.byStatus; track item.status) {
            <mat-card class="metric-card" [class]="item.status">
              <mat-card-content>
                <div class="metric-value">{{ item.count }}</div>
                <div class="metric-label">{{ statusLabel(item.status) }}</div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <!-- Actividad reciente -->
        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>Actividad reciente</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (stats()!.recent.length === 0) {
              <p class="empty">No hay proyectos aún. ¡Crea el primero!</p>
            }
            @for (project of stats()!.recent; track project.id) {
              <div class="recent-item">
                <span class="recent-name">{{ project.name }}</span>
                <mat-chip [class]="project.status">{{ statusLabel(project.status) }}</mat-chip>
              </div>
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <p class="loading">Cargando métricas...</p>
      }
    </div>
  `,
  styles: `
    .dashboard {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card mat-card-content {
      text-align: center;
      padding: 16px;
    }
    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
    }
    .metric-label {
      color: #666;
      font-size: 0.875rem;
      margin-top: 6px;
    }
    .total .metric-value { color: #1976d2; }
    .in_progress .metric-value { color: #e65100; }
    .published .metric-value  { color: #2e7d32; }
    .archived .metric-value   { color: #616161; }

    .recent-card { margin-top: 8px; }
    .recent-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .recent-item:last-child { border-bottom: none; }
    .recent-name { font-size: 0.95rem; }
    .in_progress { background: #fff3e0 !important; color: #e65100 !important; }
    .published   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .archived    { background: #f5f5f5 !important; color: #616161 !important; }
    .loading, .empty { color: #888; text-align: center; padding: 16px; }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly statsService = inject(StatsService);

  stats = signal<StatsData | null>(null);

  ngOnInit() {
    this.statsService.getStats().subscribe(res => this.stats.set(res.data));
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      in_progress: 'En desarrollo',
      published: 'Publicado',
      archived: 'Archivado',
    };
    return labels[status] ?? status;
  }
}
