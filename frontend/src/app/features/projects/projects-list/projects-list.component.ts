import { Component, inject, signal, OnInit, computed, HostListener } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProjectsService } from '../../../core/services/projects.service';
import { StatsService } from '../../../core/services/stats.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { TechnologiesService } from '../../../core/services/technologies.service';
import { Project, ProjectStatus } from '../../../core/models/project.model';
import { StatsData } from '../../../core/models/stats.model';
import { Category } from '../../../core/models/category.model';

export const COVER_STYLES = [
  { id: 's1',  gradient: 'linear-gradient(135deg, #0d2137 0%, #0d3b2e 100%)' },
  { id: 's2',  gradient: 'linear-gradient(135deg, #1a0d37 0%, #0d1b37 100%)' },
  { id: 's3',  gradient: 'linear-gradient(135deg, #0d270d 0%, #0d3b2e 100%)' },
  { id: 's4',  gradient: 'linear-gradient(135deg, #37160d 0%, #370d2a 100%)' },
  { id: 's5',  gradient: 'linear-gradient(135deg, #1a0d0d 0%, #37160d 100%)' },
  { id: 's6',  gradient: 'linear-gradient(135deg, #0d1a37 0%, #0d2e3b 100%)' },
  { id: 's7',  gradient: 'linear-gradient(135deg, #0d3b5e 0%, #0d1b3f 100%)' },
  { id: 's8',  gradient: 'linear-gradient(135deg, #3d0066 0%, #1a0037 100%)' },
  { id: 's9',  gradient: 'linear-gradient(135deg, #134e5e 0%, #1b3a2d 100%)' },
  { id: 's10', gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 's11', gradient: 'linear-gradient(135deg, #5c0d0d 0%, #1a0505 100%)' },
  { id: 's12', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)' },
];

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, SlicePipe, MatIconModule, MatTooltipModule],
  template: `
    <div class="px-8 py-6">

      <!-- Page header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-[var(--app-text-primary)]">Mis Proyectos</h1>
          <p class="text-sm text-[var(--app-text-muted)] mt-1">Panel de administración de tu portfolio</p>
        </div>
      </div>

      <!-- Stats row -->
      @if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-[var(--app-surface)] rounded-xl p-4 border border-[var(--app-border)]">
            <p class="text-2xl font-bold text-cyan-400">{{ publishedCount() }}</p>
            <p class="text-sm text-[var(--app-text-muted)] mt-1">Proyectos publicados</p>
          </div>
          <div class="bg-[var(--app-surface)] rounded-xl p-4 border border-[var(--app-border)]">
            <p class="text-2xl font-bold text-[#f0883e]">{{ inProgressCount() }}</p>
            <p class="text-sm text-[var(--app-text-muted)] mt-1">En desarrollo</p>
          </div>
          <div class="bg-[var(--app-surface)] rounded-xl p-4 border border-[var(--app-border)]">
            <p class="text-2xl font-bold text-[var(--app-text-muted)]">{{ archivedCount() }}</p>
            <p class="text-sm text-[var(--app-text-muted)] mt-1">Archivados</p>
          </div>
          <div class="bg-[var(--app-surface)] rounded-xl p-4 border border-[var(--app-border)]">
            <p class="text-2xl font-bold text-[var(--app-text-primary)]">{{ stats()!.total }}</p>
            <p class="text-sm text-[var(--app-text-muted)] mt-1">Total proyectos</p>
          </div>
        </div>
      }

      <!-- Filters -->
      <form [formGroup]="filterForm" class="flex gap-3 items-center flex-wrap mb-6">
        <div class="flex items-center gap-2 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs focus-within:border-[var(--app-accent)] transition-colors">
          <mat-icon class="text-[var(--app-text-muted)] shrink-0" style="font-size:18px;width:18px;height:18px;line-height:18px">search</mat-icon>
          <input formControlName="search"
                 placeholder="Buscar proyecto..."
                 class="bg-transparent text-[var(--app-text-primary)] text-sm outline-none w-full placeholder-[var(--app-text-subtle)]" />
        </div>

        <select formControlName="status"
                class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-sm text-[var(--app-text-muted)] outline-none hover:border-[var(--app-accent)] transition-colors cursor-pointer">
          <option value="">Todos los estados</option>
          <option value="in_progress">En desarrollo</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>

        @if (categories().length > 0) {
          <select formControlName="categoryId"
                  class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-sm text-[var(--app-text-muted)] outline-none hover:border-[var(--app-accent)] transition-colors cursor-pointer">
            <option value="">Todas las categorías</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        }

        @if (filterForm.value.search || filterForm.value.status || filterForm.value.categoryId) {
          <button type="button" (click)="clearFilters()"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] hover:border-[var(--app-accent)] transition-colors text-sm">
            <mat-icon style="font-size:15px;width:15px;height:15px;line-height:15px">close</mat-icon>
            Limpiar
          </button>
        }
      </form>

      <!-- Project cards grid -->
      @if (filteredProjects().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (project of filteredProjects(); track project.id; let i = $index) {
            <div class="bg-[var(--app-surface)] rounded-xl border border-[var(--app-border)] overflow-hidden hover:border-[var(--app-accent)] transition-all hover:shadow-lg hover:shadow-black/20 flex flex-col">

              <!-- Card header -->
              <div class="h-28 relative flex items-center justify-center group/hdr"
                   [style.background]="resolveGradient(project, i)">

                <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-medium z-10"
                      [class]="statusChipClass(project.status)">
                  {{ statusLabel(project.status) }}
                </span>

                @if (project.coverIcon) {
                  <img [src]="getIconUrl(project.coverIcon)"
                       [alt]="project.coverIcon"
                       class="w-12 h-12 opacity-25 pointer-events-none"
                       style="filter:brightness(0) invert(1)"
                       (error)="onIconLoadError($event)" />
                } @else {
                  <mat-icon class="text-white/20 pointer-events-none" style="font-size:48px;width:48px;height:48px;line-height:48px">
                    {{ projectIcon(i) }}
                  </mat-icon>
                }

                <!-- Hover: botón cambiar portada -->
                @if (pickerOpenId() !== project.id) {
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/hdr:opacity-100 transition-opacity flex items-center justify-center">
                    <button (click)="$event.stopPropagation(); openPicker(project.id)"
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 text-white text-xs font-medium border border-white/20 hover:bg-black/60 transition-colors">
                      <mat-icon style="font-size:13px;width:13px;height:13px;line-height:13px">palette</mat-icon>
                      Cambiar portada
                    </button>
                  </div>
                }

                <!-- Picker de portadas e iconos -->
                @if (pickerOpenId() === project.id) {
                  <div class="absolute inset-0 bg-[color:var(--app-bg-overlay)] flex flex-col p-3 z-20 overflow-hidden"
                       (click)="$event.stopPropagation()">

                    <div class="grid grid-cols-6 gap-1 flex-1 content-start">
                      @for (cs of coverStyles; track cs.id) {
                        <button (click)="setCover(project, cs.id)"
                                class="h-6 rounded transition-all hover:scale-110"
                                [style.background]="cs.gradient"
                                [style.outline]="project.coverStyle === cs.id ? '2px solid white' : '2px solid transparent'"
                                [style.outline-offset]="'1px'">
                        </button>
                      }
                    </div>

                    <!-- Cancelar -->
                    <button (click)="closePicker()"
                            class="text-[var(--app-text-muted)] text-[11px] hover:text-[var(--app-text-primary)] transition-colors mt-1.5 shrink-0">
                      Cancelar
                    </button>
                  </div>
                }
              </div>

              <!-- Card body -->
              <div class="p-4 flex flex-col flex-1">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-bold text-[var(--app-text-primary)] text-base leading-tight">{{ project.name }}</h3>
                  @if (project.categoryName) {
                    <span class="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                          [style.color]="project.categoryColor ?? '#06b6d4'"
                          [style.border-color]="(project.categoryColor ?? '#06b6d4') + '55'"
                          [style.background]="(project.categoryColor ?? '#06b6d4') + '18'">
                      {{ project.categoryName }}
                    </span>
                  }
                </div>
                <p class="text-[var(--app-text-muted)] text-sm mt-1.5 line-clamp-2 flex-1">
                  {{ project.description || 'Sin descripción.' }}
                </p>

                @if (project.startDate) {
                  <p class="text-[var(--app-text-subtle)] text-xs mt-2">
                    {{ project.startDate | slice:0:7 }}
                    @if (project.endDate) { → {{ project.endDate | slice:0:7 }} }
                  </p>
                }

                <!-- Stats row -->
                <div class="flex gap-4 mt-3 pt-3 pb-2 border-t border-[var(--app-border)] flex-wrap">
                  <div class="flex flex-col gap-0.5">
                    <p class="text-[11px] text-[var(--app-text-subtle)]">Visitas</p>
                    <p class="font-semibold text-xs text-cyan-400">{{ project.visits || 0 }}</p>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <p class="text-[11px] text-[var(--app-text-subtle)]">Contactos</p>
                    <p class="font-semibold text-xs text-orange-400">{{ project.contacts || 0 }}</p>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <p class="text-[11px] text-[var(--app-text-subtle)]">Tecnologías</p>
                    <p class="font-semibold text-xs text-purple-400">{{ project.technologiesCount || 0 }}</p>
                  </div>
                </div>

                <!-- Bottom actions -->
                <div class="flex items-center gap-2 mt-2 pt-3 border-t border-[var(--app-border)]">
                  @if (project.repoUrl) {
                    <a [href]="project.repoUrl" target="_blank"
                       class="px-2.5 py-1 text-xs rounded-md bg-[var(--app-hover)] text-[var(--app-accent)] border border-[var(--app-border)] hover:bg-[var(--app-surface-2)] transition-colors no-underline">
                      GitHub
                    </a>
                  }
                  @if (project.liveUrl) {
                    <a [href]="project.liveUrl" target="_blank"
                       class="px-2.5 py-1 text-xs rounded-md bg-[var(--app-hover)] text-[var(--app-accent)] border border-[var(--app-border)] hover:bg-[var(--app-surface-2)] transition-colors no-underline">
                      Demo
                    </a>
                  }

                  <div class="flex gap-0.5 ml-auto">
                    <button [routerLink]="['/projects', project.id, 'detail']"
                            matTooltip="Ver detalles"
                            class="p-1.5 rounded-lg hover:bg-[var(--app-surface-2)] text-[var(--app-text-muted)] hover:text-[var(--app-accent)] transition-colors">
                      <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">visibility</mat-icon>
                    </button>
                    <button [routerLink]="['/projects', project.id]"
                            matTooltip="Editar"
                            class="p-1.5 rounded-lg hover:bg-[var(--app-surface-2)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] transition-colors">
                      <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">edit</mat-icon>
                    </button>
                    <button (click)="delete(project.id)"
                            matTooltip="Eliminar"
                            class="p-1.5 rounded-lg hover:bg-[var(--app-surface-2)] text-[var(--app-text-muted)] hover:text-red-400 transition-colors">
                      <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <mat-icon class="text-[var(--app-text-subtle)] mb-4" style="font-size:48px;width:48px;height:48px;line-height:48px">folder_open</mat-icon>
          <p class="text-[var(--app-text-muted)] text-base">
            {{ projects().length === 0 ? '¡Crea tu primer proyecto!' : 'No hay proyectos con esos filtros.' }}
          </p>
          @if (projects().length === 0) {
            <a routerLink="/projects/new"
               class="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-colors no-underline">
              + Nuevo proyecto
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,
})
export class ProjectsListComponent implements OnInit {
  private readonly service = inject(ProjectsService);
  private readonly statsService = inject(StatsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly technologiesService = inject(TechnologiesService);
  private readonly fb = inject(FormBuilder);

  projects = signal<Project[]>([]);
  filteredProjects = signal<Project[]>([]);
  stats = signal<StatsData | null>(null);
  categories = signal<Category[]>([]);
  pickerOpenId = signal<number | null>(null);

  // Caché de iconos validados para evitar reintentos
  private iconUrlCache = new Map<string, string>();

  readonly coverStyles = COVER_STYLES;

  publishedCount = computed(() => this.stats()?.byStatus.find(s => s.status === 'published')?.count ?? 0);
  inProgressCount = computed(() => this.stats()?.byStatus.find(s => s.status === 'in_progress')?.count ?? 0);
  archivedCount = computed(() => this.stats()?.byStatus.find(s => s.status === 'archived')?.count ?? 0);

  filterForm = this.fb.group({ search: [''], status: [''], categoryId: [''] });

  ngOnInit() {
    this.service.getAll().pipe(
      switchMap(res => this.attachTechnologyCounts(res.data))
    ).subscribe(projects => {
      this.projects.set(projects);
      this.filteredProjects.set(projects);
    });
    this.statsService.getStats().subscribe(res => this.stats.set(res.data));
    this.categoriesService.getAll().subscribe(res => this.categories.set(res.data));
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  private attachTechnologyCounts(projects: Project[]) {
    if (projects.length === 0) {
      return of(projects);
    }

    return forkJoin(
      projects.map(project =>
        this.technologiesService.getAll(project.id).pipe(
          map(res => ({
            ...project,
            technologiesCount: res.data.length,
          }))
        )
      )
    );
  }

  applyFilters() {
    const { search, status, categoryId } = this.filterForm.value;
    let filtered = this.projects();
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (status) filtered = filtered.filter(p => p.status === (status as ProjectStatus));
    if (categoryId) filtered = filtered.filter(p => p.categoryId === Number(categoryId));
    this.filteredProjects.set(filtered);
  }

  clearFilters() {
    this.filterForm.reset({ search: '', status: '', categoryId: '' });
  }

  delete(id: number) {
    if (confirm('¿Eliminar este proyecto?')) {
      this.service.delete(id).subscribe(() => {
        this.projects.update(list => list.filter(p => p.id !== id));
        this.applyFilters();
        this.statsService.getStats().subscribe(res => this.stats.set(res.data));
      });
    }
  }

  resolveGradient(project: Project, index: number): string {
    if (project.coverStyle) {
      return COVER_STYLES.find(s => s.id === project.coverStyle)?.gradient
        ?? COVER_STYLES[index % COVER_STYLES.length].gradient;
    }
    return COVER_STYLES[index % COVER_STYLES.length].gradient;
  }

  openPicker(id: number) {
    this.pickerOpenId.set(id);
  }
  closePicker() { this.pickerOpenId.set(null); }

  setCover(project: Project, styleId: string) {
    this.service.updateCover(project.id, { coverStyle: styleId }).subscribe(() => {
      this.projects.update(list =>
        list.map(p => p.id === project.id ? { ...p, coverStyle: styleId } : p)
      );
      this.applyFilters();
      this.closePicker();
    });
  }

  getIconUrl(slug: string): string {
    if (this.iconUrlCache.has(slug)) return this.iconUrlCache.get(slug)!;
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
    this.iconUrlCache.set(slug, url);
    return url;
  }

  onIconLoadError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const slug = img.src.split('/').pop()?.replace('.svg', '') ?? '';
    const candidates = this.getIconCandidates(slug);

    const tryNextCandidate = (index: number) => {
      if (index >= candidates.length) {
        img.style.opacity = '0.2';
        return;
      }
      const testImg = new Image();
      testImg.onload = () => { this.iconUrlCache.set(slug, candidates[index]); img.src = candidates[index]; };
      testImg.onerror = () => tryNextCandidate(index + 1);
      testImg.src = candidates[index];
    };

    if (candidates.length > 1) {
      tryNextCandidate(1);
    } else {
      img.style.opacity = '0.2';
    }
  }

  private getIconCandidates(slug: string): string[] {
    const base = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons';
    return [
      `${base}/${slug}.svg`,
      `${base}/${slug.replace(/\./g, '')}.svg`,
      `${base}/${slug.replace(/-/g, '')}.svg`,
      `${base}/${slug.replace(/[.\-]/g, '')}.svg`,
    ];
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.closePicker(); }

  projectIcon(index: number): string {
    const icons = ['shopping_cart', 'assignment', 'palette', 'code', 'cloud', 'devices'];
    return icons[index % icons.length];
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      in_progress: 'En desarrollo',
      published: 'Publicado',
      archived: 'Archivado',
    };
    return labels[status] ?? status;
  }

  statusChipClass(status: string): string {
    const map: Record<string, string> = {
      published: 'bg-[#1a4731] text-[#3fb950] border border-[#2ea043]',
      in_progress: 'bg-[#3a1a00] text-[#f0883e] border border-[#d1620a]',
      archived: 'bg-[var(--app-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]',
    };
    return map[status] ?? map['archived'];
  }
}
