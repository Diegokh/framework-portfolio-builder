import { Component, inject, signal, OnInit } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ProjectsService } from '../../../core/services/projects.service';
import { TechnologiesService } from '../../../core/services/technologies.service';
import { ScreenshotsService } from '../../../core/services/screenshots.service';
import { Project } from '../../../core/models/project.model';
import { Technology, TechnologyRole } from '../../../core/models/technology.model';
import { Screenshot } from '../../../core/models/screenshot.model';
import { environment } from '../../../../environments/environment';

const backendBase = environment.apiUrl.replace('/api', '');

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    SlicePipe,
  ],
  template: `
    @if (project()) {
      <div class="container">
        <!-- Cabecera -->
        <div class="page-header">
          <div>
            <h2>{{ project()!.name }}</h2>
            <mat-chip [class]="project()!.status">{{ statusLabel(project()!.status) }}</mat-chip>
          </div>
          <div class="header-actions">
            <button mat-stroked-button [routerLink]="['/projects', project()!.id]">
              <mat-icon>edit</mat-icon> Editar
            </button>
            <button mat-button routerLink="/projects">
              <mat-icon>arrow_back</mat-icon> Volver
            </button>
          </div>
        </div>

        <!-- Info del proyecto -->
        <mat-card class="section-card">
          <mat-card-content>
            <p class="description">{{ project()!.description || 'Sin descripción.' }}</p>
            <div class="links">
              @if (project()!.repoUrl) {
                <a mat-stroked-button [href]="project()!.repoUrl" target="_blank">
                  <mat-icon>code</mat-icon> Repositorio
                </a>
              }
              @if (project()!.liveUrl) {
                <a mat-stroked-button [href]="project()!.liveUrl" target="_blank">
                  <mat-icon>open_in_new</mat-icon> Demo
                </a>
              }
            </div>
            @if (project()!.startDate) {
              <p class="dates">
                <mat-icon>calendar_today</mat-icon>
                {{ project()!.startDate | slice:0:10 }}
                @if (project()!.endDate) { → {{ project()!.endDate | slice:0:10 }} }
              </p>
            }
          </mat-card-content>
        </mat-card>

        <mat-divider />

        <!-- Tecnologías -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>Tecnologías</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="tech-chips">
              @for (tech of technologies(); track tech.id) {
                <mat-chip class="tech-chip">
                  <span>{{ tech.technology }}</span>
                  <span class="tech-role">{{ roleLabel(tech.role) }}</span>
                  <button matChipRemove (click)="deleteTech(tech.id)">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip>
              }
              @if (technologies().length === 0) {
                <p class="empty-hint">No hay tecnologías añadidas.</p>
              }
            </div>

            <form [formGroup]="techForm" (ngSubmit)="addTech()" class="add-form">
              <mat-form-field appearance="outline">
                <mat-label>Tecnología</mat-label>
                <input matInput formControlName="technology" placeholder="Angular, Node.js..." />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Rol</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="frontend">Frontend</mat-option>
                  <mat-option value="backend">Backend</mat-option>
                  <mat-option value="db">Base de datos</mat-option>
                  <mat-option value="devops">DevOps</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="accent" type="submit" [disabled]="techForm.invalid">
                <mat-icon>add</mat-icon> Añadir
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-divider />

        <!-- Screenshots -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>Capturas de pantalla</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="screenshots-grid">
              @for (shot of screenshots(); track shot.id) {
                <div class="screenshot-item">
                  <img [src]="backendUrl + shot.imageUrl" [alt]="shot.caption" />
                  <p class="caption">{{ shot.caption }}</p>
                  <button mat-icon-button color="warn" (click)="deleteScreenshot(shot.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>

            <form [formGroup]="shotForm" (ngSubmit)="uploadScreenshot()" class="add-form">
              <mat-form-field appearance="outline">
                <mat-label>Descripción</mat-label>
                <input matInput formControlName="caption" placeholder="Vista principal..." />
              </mat-form-field>
              <div class="file-row">
                <input type="file" accept="image/*" (change)="onFileSelected($event)" #fileInput />
                <button mat-raised-button color="accent" type="submit" [disabled]="!selectedFile">
                  <mat-icon>upload</mat-icon> Subir imagen
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <p class="loading">Cargando proyecto...</p>
    }
  `,
  styles: `
    .container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .header-actions { display: flex; gap: 8px; }
    .section-card { margin: 16px 0; }
    .description { color: #444; margin-bottom: 12px; }
    .links { display: flex; gap: 8px; margin-bottom: 12px; }
    .dates { display: flex; align-items: center; gap: 6px; color: #666; font-size: 0.875rem; }
    .tech-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .tech-chip { display: flex; align-items: center; gap: 4px; }
    .tech-role { font-size: 0.75rem; opacity: 0.7; margin-left: 4px; }
    .add-form { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; margin-top: 8px; }
    .add-form mat-form-field { flex: 1; min-width: 150px; }
    .screenshots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .screenshot-item { position: relative; text-align: center; }
    .screenshot-item img { width: 100%; border-radius: 4px; border: 1px solid #ddd; }
    .caption { font-size: 0.8rem; color: #666; margin: 4px 0; }
    .file-row { display: flex; align-items: center; gap: 12px; }
    .empty-hint { color: #aaa; font-size: 0.875rem; }
    .loading { text-align: center; padding: 40px; color: #888; }
    .in_progress { background: #fff3e0 !important; color: #e65100 !important; }
    .published   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .archived    { background: #f5f5f5 !important; color: #616161 !important; }
  `,
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsService = inject(ProjectsService);
  private readonly techService = inject(TechnologiesService);
  private readonly screenshotsService = inject(ScreenshotsService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly backendUrl = backendBase;

  project = signal<Project | null>(null);
  technologies = signal<Technology[]>([]);
  screenshots = signal<Screenshot[]>([]);
  selectedFile: File | null = null;

  techForm = this.fb.group({
    technology: ['', Validators.required],
    role: ['frontend' as TechnologyRole],
  });

  shotForm = this.fb.group({
    caption: [''],
  });

  private projectId!: number;

  ngOnInit() {
    this.projectId = +this.route.snapshot.params['id'];
    this.loadAll();
  }

  private loadAll() {
    this.projectsService.getById(this.projectId).subscribe(res => this.project.set(res.data));
    this.techService.getAll(this.projectId).subscribe(res => this.technologies.set(res.data));
    this.screenshotsService.getAll(this.projectId).subscribe(res => this.screenshots.set(res.data));
  }

  addTech() {
    const { technology, role } = this.techForm.value;
    this.techService.create(this.projectId, technology!, role as TechnologyRole).subscribe(res => {
      this.technologies.update(list => [
        ...list,
        { id: res.id, projectId: this.projectId, technology: technology!, role: role as TechnologyRole },
      ]);
      this.techForm.reset({ technology: '', role: 'frontend' });
    });
  }

  deleteTech(id: number) {
    this.techService.delete(this.projectId, id).subscribe(() =>
      this.technologies.update(list => list.filter(t => t.id !== id))
    );
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadScreenshot() {
    if (!this.selectedFile) return;
    const caption = this.shotForm.value.caption ?? '';
    const order = this.screenshots().length;

    this.screenshotsService.upload(this.projectId, this.selectedFile, caption, order).subscribe(res => {
      this.screenshots.update(list => [
        ...list,
        { id: res.id, projectId: this.projectId, imageUrl: res.imageUrl, caption, order },
      ]);
      this.shotForm.reset({ caption: '' });
      this.selectedFile = null;
    });
  }

  deleteScreenshot(id: number) {
    this.screenshotsService.delete(this.projectId, id).subscribe(() =>
      this.screenshots.update(list => list.filter(s => s.id !== id))
    );
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      in_progress: 'En desarrollo',
      published: 'Publicado',
      archived: 'Archivado',
    };
    return labels[status] ?? status;
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      frontend: 'Frontend',
      backend: 'Backend',
      db: 'BD',
      devops: 'DevOps',
    };
    return labels[role] ?? role;
  }
}
