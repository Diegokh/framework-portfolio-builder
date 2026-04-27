import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { ProjectsService } from '../../../core/services/projects.service';
import { Project, ProjectStatus } from '../../../core/models/project.model';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h2>Mis proyectos</h2>
        <button mat-raised-button color="primary" routerLink="/projects/new">
          <mat-icon>add</mat-icon> Nuevo proyecto
        </button>
      </div>

      <!-- Filtros avanzados -->
      <form [formGroup]="filterForm" class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput formControlName="search" placeholder="Nombre del proyecto..." />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="">Todos</mat-option>
            <mat-option value="in_progress">En desarrollo</mat-option>
            <mat-option value="published">Publicado</mat-option>
            <mat-option value="archived">Archivado</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button type="button" (click)="clearFilters()">
          <mat-icon>clear</mat-icon> Limpiar
        </button>
      </form>

      <table mat-table [dataSource]="filteredProjects()">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let project">{{ project.name }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let project">
            <mat-chip [class]="project.status">{{ statusLabel(project.status) }}</mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let project">
            <button mat-icon-button [routerLink]="['/projects', project.id]">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="delete(project.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>

      @if (filteredProjects().length === 0) {
        <p class="empty">
          {{ projects().length === 0 ? '¡Crea tu primer proyecto!' : 'No hay proyectos con esos filtros.' }}
        </p>
      }
    </div>
  `,
  styles: `
    .container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .filters {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .filters mat-form-field { flex: 1; min-width: 160px; }
    table { width: 100%; }
    .empty { text-align: center; color: #888; margin-top: 32px; }
    .in_progress { background: #fff3e0 !important; color: #e65100 !important; }
    .published   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .archived    { background: #f5f5f5 !important; color: #616161 !important; }
  `,
})
export class ProjectsListComponent implements OnInit {
  private readonly service = inject(ProjectsService);
  private readonly fb = inject(FormBuilder);

  projects = signal<Project[]>([]);
  filteredProjects = signal<Project[]>([]);
  displayedColumns = ['name', 'status', 'actions'];

  filterForm = this.fb.group({
    search: [''],
    status: [''],
  });

  ngOnInit() {
    this.service.getAll().subscribe(res => {
      this.projects.set(res.data);
      this.filteredProjects.set(res.data);
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters() {
    const { search, status } = this.filterForm.value;
    let filtered = this.projects();

    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filtered = filtered.filter(p => p.status === (status as ProjectStatus));
    }

    this.filteredProjects.set(filtered);
  }

  clearFilters() {
    this.filterForm.reset({ search: '', status: '' });
  }

  delete(id: number) {
    if (confirm('¿Eliminar este proyecto?')) {
      this.service.delete(id).subscribe(() => {
        this.projects.update(list => list.filter(p => p.id !== id));
        this.applyFilters();
      });
    }
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
