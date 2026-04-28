import { Component, inject, signal, OnInit, HostListener, computed } from '@angular/core';
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

const TECHNOLOGY_SUGGESTIONS: { role: TechnologyRole; technologies: string[] }[] = [
  {
    role: 'frontend',
    technologies: ['Angular', 'React', 'Vue.js', 'Next.js', 'Svelte', 'Astro', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'SASS', 'Bootstrap', 'Redux', 'Vite', 'Webpack'],
  },
  {
    role: 'backend',
    technologies: ['Node.js', 'Express', 'NestJS', 'Python', 'Django', 'FastAPI', 'Flask', 'PHP', 'Laravel', 'Java', 'Spring Boot', 'C#', '.NET', 'Go', 'Rust', 'Ruby on Rails', 'GraphQL', 'REST API'],
  },
  {
    role: 'db',
    technologies: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase', 'MariaDB', 'DynamoDB', 'Prisma', 'TypeORM', 'Sequelize', 'ElasticSearch'],
  },
  {
    role: 'devops',
    technologies: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Nginx', 'Linux', 'Git', 'Terraform', 'Ansible', 'Apache'],
  },
];

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
              <!-- Dropdown buscable de tecnologías -->
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs text-[var(--app-text-muted)]">Tecnología *</label>
                <div class="relative">
                  <div class="flex items-center gap-2 bg-[var(--app-input-bg)] border rounded-lg px-3 py-2 transition-colors"
                       [class]="techDropdownOpen() ? 'border-[var(--app-accent)]' : 'border-[var(--app-border)]'">
                    <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px" class="text-[var(--app-text-subtle)] shrink-0">search</mat-icon>
                    <input
                      [value]="techSearchText()"
                      (input)="onTechSearchInput($event)"
                      (focus)="techDropdownOpen.set(true)"
                      (blur)="onTechBlur()"
                      placeholder="Buscar o escribe una tecnología..."
                      class="bg-transparent text-[var(--app-text-primary)] text-sm outline-none w-full placeholder-[var(--app-text-subtle)]" />
                    @if (techSearchText()) {
                      <button type="button" (mousedown)="clearTechSearch()"
                              class="text-[var(--app-text-subtle)] hover:text-[var(--app-text-primary)] transition-colors shrink-0">
                        <mat-icon style="font-size:14px;width:14px;height:14px;line-height:14px">close</mat-icon>
                      </button>
                    }
                  </div>

                  <!-- Panel de sugerencias -->
                  @if (techDropdownOpen() && filteredTechSuggestions().length > 0) {
                    <div class="absolute top-full left-0 right-0 z-50 mt-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-xl overflow-auto max-h-48">
                      @for (tech of filteredTechSuggestions(); track tech) {
                        <button type="button"
                                (mousedown)="selectTechSuggestion(tech)"
                                class="w-full text-left px-4 py-1.5 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text-primary)] transition-colors">
                          {{ tech }}
                        </button>
                      }
                    </div>
                  }

                  @if (techDropdownOpen() && techSearchText() && filteredTechSuggestions().length === 0) {
                    <div class="absolute top-full left-0 right-0 z-50 mt-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-xl px-4 py-3">
                      <p class="text-xs text-[var(--app-text-muted)]">No hay sugerencias — se usará "<span class="text-[var(--app-text-primary)]">{{ techSearchText() }}</span>" como nombre</p>
                    </div>
                  }
                </div>

                @if (techForm.get('technology')?.value) {
                  <p class="text-[11px] text-[var(--app-text-subtle)] mt-0.5">
                    Seleccionado: <span class="text-[var(--app-text-primary)] font-medium">{{ techForm.get('technology')?.value }}</span>
                  </p>
                }
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Rol</mat-label>
                <mat-select formControlName="role" (change)="onRoleChange()">
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
              @for (shot of screenshots(); track shot.id; let i = $index) {
                <div class="screenshot-item">
                  <img [src]="backendUrl + shot.imageUrl" [alt]="shot.caption"
                       (click)="openLightbox(i)"
                       loading="lazy"
                       width="400" height="225"
                       style="cursor:zoom-in;object-fit:cover" />
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
      <!-- Lightbox -->
      @if (lightboxIndex() !== null) {
        <div class="lightbox-overlay" (click)="closeLightbox()">

          <!-- Contador -->
          <div class="lightbox-counter">
            {{ lightboxIndex()! + 1 }} / {{ screenshots().length }}
          </div>

          <!-- Cerrar -->
          <button class="lightbox-close" (click)="closeLightbox()">
            <mat-icon>close</mat-icon>
          </button>

          <!-- Imagen -->
          <img class="lightbox-img"
               [src]="backendUrl + screenshots()[lightboxIndex()!].imageUrl"
               [alt]="screenshots()[lightboxIndex()!].caption"
               loading="eager"
               (click)="$event.stopPropagation()" />

          <!-- Caption -->
          @if (screenshots()[lightboxIndex()!].caption) {
            <div class="lightbox-caption">{{ screenshots()[lightboxIndex()!].caption }}</div>
          }

          <!-- Anterior -->
          @if (lightboxIndex()! > 0) {
            <button class="lightbox-nav lightbox-prev" (click)="$event.stopPropagation(); prevImage()">
              <mat-icon>chevron_left</mat-icon>
            </button>
          }

          <!-- Siguiente -->
          @if (lightboxIndex()! < screenshots().length - 1) {
            <button class="lightbox-nav lightbox-next" (click)="$event.stopPropagation(); nextImage()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          }
        </div>
      }

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

    /* Lightbox */
    .lightbox-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0,0,0,0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

    .lightbox-img {
      max-height: 85vh;
      max-width: 88vw;
      object-fit: contain;
      border-radius: 6px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      animation: zoomIn 0.15s ease;
    }
    @keyframes zoomIn { from { transform: scale(0.95) } to { transform: scale(1) } }

    .lightbox-counter {
      position: absolute;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,0.7);
      font-size: 0.875rem;
      background: rgba(0,0,0,0.4);
      padding: 4px 12px;
      border-radius: 20px;
    }

    .lightbox-close {
      position: absolute;
      top: 12px;
      right: 12px;
      color: rgba(255,255,255,0.7);
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
    }
    .lightbox-close:hover { background: rgba(255,255,255,0.2); color: #fff; }

    .lightbox-caption {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,0.85);
      font-size: 0.875rem;
      background: rgba(0,0,0,0.5);
      padding: 6px 16px;
      border-radius: 20px;
      max-width: 80vw;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255,255,255,0.8);
      background: rgba(255,255,255,0.12);
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .lightbox-nav:hover { background: rgba(255,255,255,0.25); color: #fff; }
    .lightbox-prev { left: 16px; }
    .lightbox-next { right: 16px; }
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
  lightboxIndex = signal<number | null>(null);
  
  // Signals para el dropdown de tecnologías
  techDropdownOpen = signal(false);
  techSearchText = signal('');

  techForm = this.fb.group({
    technology: ['', Validators.required],
    role: ['frontend' as TechnologyRole],
  });

  shotForm = this.fb.group({
    caption: [''],
  });

  private projectId!: number;

  // Computed para filtrar sugerencias de tecnologías
  filteredTechSuggestions = computed(() => {
    const q = this.techSearchText().toLowerCase().trim();
    const selectedRole = this.techForm.get('role')?.value as TechnologyRole;
    const existing = new Set(this.technologies().map(t => t.technology.toLowerCase()));

    const group = TECHNOLOGY_SUGGESTIONS.find(g => g.role === selectedRole);
    if (!group) return [];

    return group.technologies.filter(t =>
      (!q || t.toLowerCase().includes(q)) && !existing.has(t.toLowerCase())
    );
  });

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

  // Métodos para el dropdown de tecnologías
  onTechSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.techSearchText.set(value);
    this.techForm.patchValue({ technology: value });
    this.techDropdownOpen.set(true);
  }

  onTechBlur() {
    setTimeout(() => this.techDropdownOpen.set(false), 150);
  }

  clearTechSearch() {
    this.techSearchText.set('');
    this.techForm.patchValue({ technology: '' });
  }

  selectTechSuggestion(technology: string) {
    this.techSearchText.set(technology);
    this.techForm.patchValue({ technology });
    this.techDropdownOpen.set(false);
  }

  onRoleChange() {
    this.techSearchText.set('');
    this.techForm.patchValue({ technology: '' });
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
    this.screenshotsService.delete(this.projectId, id).subscribe(() => {
      this.screenshots.update(list => list.filter(s => s.id !== id));
      this.closeLightbox();
    });
  }

  openLightbox(index: number) { this.lightboxIndex.set(index); }
  closeLightbox() { this.lightboxIndex.set(null); }

  prevImage() {
    const i = this.lightboxIndex();
    if (i !== null && i > 0) this.lightboxIndex.set(i - 1);
  }

  nextImage() {
    const i = this.lightboxIndex();
    if (i !== null && i < this.screenshots().length - 1) this.lightboxIndex.set(i + 1);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (this.lightboxIndex() === null) return;
    if (e.key === 'ArrowRight') this.nextImage();
    else if (e.key === 'ArrowLeft') this.prevImage();
    else if (e.key === 'Escape') this.closeLightbox();
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
