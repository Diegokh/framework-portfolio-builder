import { Component, inject, signal, OnInit, computed, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScreenshotsService } from '../../core/services/screenshots.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Screenshot } from '../../core/models/screenshot.model';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-captures',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="px-8 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-[var(--app-text-primary)]">Capturas</h1>
          <p class="text-sm text-[var(--app-text-muted)] mt-1">Galería de imágenes de tus proyectos</p>
        </div>
        <button (click)="showForm.set(!showForm())"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                [class]="showForm() ? 'bg-[var(--app-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]' : 'bg-cyan-500 text-white hover:bg-cyan-400'">
          <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">{{ showForm() ? 'close' : 'upload' }}</mat-icon>
          {{ showForm() ? 'Cancelar' : 'Subir captura' }}
        </button>
      </div>

      <!-- Filtros por proyecto -->
      @if (screenshots().length > 0) {
        <div class="flex gap-2 flex-wrap mb-6">
          <button (click)="filterProject.set(null)"
                  [class]="filterProject() === null ? 'bg-[var(--app-accent)] text-white border-[var(--app-accent)]' : 'bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] border-[var(--app-border)]'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border">
            Todos ({{ screenshots().length }})
          </button>
          @for (group of groupedScreenshots(); track group.projectId) {
            <button (click)="filterProject.set(group.projectId)"
                    [class]="filterProject() === group.projectId ? 'bg-[var(--app-accent)] text-white border-[var(--app-accent)]' : 'bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] border-[var(--app-border)]'"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border">
              {{ group.projectName }} ({{ group.screenshots.length }})
            </button>
          }
        </div>
      }

      <!-- Galería -->
      @if (screenshots().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 mb-8">
          <mat-icon class="text-[var(--app-text-subtle)] mb-3" style="font-size:48px;width:48px;height:48px;line-height:48px">photo_camera</mat-icon>
          <p class="text-[var(--app-text-muted)]">Sube tu primera captura de pantalla</p>
        </div>
      }

      @if (filteredScreenshots().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
          @for (shot of filteredScreenshots(); track shot.id; let i = $index) {
            <div class="relative group rounded-xl overflow-hidden border border-[var(--app-border)] hover:border-[var(--app-accent)] transition-colors bg-[var(--app-surface)] cursor-pointer aspect-video"
                 (click)="openLightbox(i)">
              <img [src]="apiBase + shot.imageUrl" [alt]="shot.caption"
                   class="w-full h-full object-cover" />

              <!-- Overlay -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                @if (shot.caption) {
                  <p class="text-white text-xs line-clamp-2 leading-tight">{{ shot.caption }}</p>
                }
                <div class="flex items-center justify-between">
                  @if (shot.projectName) {
                    <span class="text-white/70 text-[10px] truncate">{{ shot.projectName }}</span>
                  }
                  <button (click)="$event.stopPropagation(); delete(shot)"
                          class="ml-auto p-1 rounded-md bg-red-500/80 text-white hover:bg-red-500 transition-colors shrink-0">
                    <mat-icon style="font-size:13px;width:13px;height:13px;line-height:13px">delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Formulario de subida -->
      @if (showForm()) {
      <div class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5 max-w-xl">
        <h3 class="text-[var(--app-text-primary)] font-semibold text-sm mb-4">Subir captura</h3>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3">

          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">Proyecto *</label>
            <select formControlName="projectId"
                    class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors cursor-pointer">
              <option [ngValue]="null" disabled>Seleccionar proyecto...</option>
              @for (p of projects(); track p.id) {
                <option [ngValue]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">Imagen *</label>
            <div class="relative">
              <input type="file" accept="image/*" (change)="onFileChange($event)"
                     class="block w-full text-sm text-[var(--app-text-muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 file:cursor-pointer file:transition-colors cursor-pointer" />
            </div>
            @if (previewUrl()) {
              <img [src]="previewUrl()!" alt="preview"
                   class="mt-2 rounded-lg h-32 object-cover border border-[var(--app-border)]" />
            }
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">Descripción <span class="text-[var(--app-text-subtle)]">(opcional)</span></label>
            <input formControlName="caption" placeholder="Pantalla de inicio, vista de detalle..."
                   class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)]" />
          </div>

          @if (uploading()) {
            <div class="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
              <div class="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              Subiendo...
            </div>
          }

          <button type="submit" [disabled]="form.invalid || !selectedFile() || uploading()"
                  class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1">
            <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">upload</mat-icon>
            Subir captura
          </button>
        </form>
      </div>
      }
    </div>

    <!-- Lightbox -->
    @if (lightboxIndex() !== null) {
      <div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
           (click)="closeLightbox()">
        <button (click)="closeLightbox()"
                class="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <mat-icon>close</mat-icon>
        </button>

        <button (click)="$event.stopPropagation(); prevImage()"
                class="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <div class="max-w-5xl max-h-[85vh] px-16" (click)="$event.stopPropagation()">
          <img [src]="apiBase + currentLightboxShot()!.imageUrl"
               [alt]="currentLightboxShot()!.caption"
               class="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
          @if (currentLightboxShot()!.caption) {
            <p class="text-white/80 text-sm text-center mt-3">{{ currentLightboxShot()!.caption }}</p>
          }
          @if (currentLightboxShot()!.projectName) {
            <p class="text-white/50 text-xs text-center mt-1">{{ currentLightboxShot()!.projectName }}</p>
          }
        </div>

        <button (click)="$event.stopPropagation(); nextImage()"
                class="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <mat-icon>chevron_right</mat-icon>
        </button>

        <p class="absolute bottom-4 text-white/40 text-xs">
          {{ (lightboxIndex() ?? 0) + 1 }} / {{ filteredScreenshots().length }}
        </p>
      </div>
    }
  `,
})
export class CapturesComponent implements OnInit {
  private readonly service = inject(ScreenshotsService);
  private readonly projectsService = inject(ProjectsService);
  private readonly fb = inject(FormBuilder);

  readonly apiBase = 'http://localhost:3001';

  screenshots = signal<Screenshot[]>([]);
  projects = signal<Project[]>([]);
  filterProject = signal<number | null>(null);
  lightboxIndex = signal<number | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  uploading = signal(false);
  showForm = signal(false);

  groupedScreenshots = computed(() => {
    const map = new Map<number, { projectId: number; projectName: string; screenshots: Screenshot[] }>();
    for (const s of this.screenshots()) {
      if (!map.has(s.projectId)) {
        map.set(s.projectId, { projectId: s.projectId, projectName: s.projectName ?? '', screenshots: [] });
      }
      map.get(s.projectId)!.screenshots.push(s);
    }
    return Array.from(map.values());
  });

  filteredScreenshots = computed(() => {
    const f = this.filterProject();
    return f === null ? this.screenshots() : this.screenshots().filter(s => s.projectId === f);
  });

  currentLightboxShot = computed(() => {
    const i = this.lightboxIndex();
    return i !== null ? this.filteredScreenshots()[i] : null;
  });

  form = this.fb.group({
    projectId: [null as number | null, Validators.required],
    caption: [''],
  });

  ngOnInit() {
    this.service.getAllForUser().subscribe(res => this.screenshots.set(res.data));
    this.projectsService.getAll().subscribe(res => this.projects.set(res.data));
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
  }

  submit() {
    const { projectId, caption } = this.form.value;
    const file = this.selectedFile();
    if (!file || !projectId) return;

    this.uploading.set(true);
    const order = this.screenshots().filter(s => s.projectId === projectId).length;

    this.service.upload(projectId, file, caption ?? '', order).subscribe({
      next: res => {
        const project = this.projects().find(p => p.id === projectId);
        this.screenshots.update(list => [...list, {
          id: res.id, projectId: projectId!, projectName: project?.name,
          imageUrl: res.imageUrl, caption: caption ?? '', order,
        }]);
        this.form.reset({ projectId: null, caption: '' });
        this.selectedFile.set(null);
        this.previewUrl.set(null);
        this.uploading.set(false);
        this.showForm.set(false);
      },
      error: () => this.uploading.set(false),
    });
  }

  delete(shot: Screenshot) {
    this.service.delete(shot.projectId, shot.id).subscribe(() => {
      this.screenshots.update(list => list.filter(s => s.id !== shot.id));
      if (this.lightboxIndex() !== null) this.closeLightbox();
    });
  }

  openLightbox(index: number) { this.lightboxIndex.set(index); }
  closeLightbox() { this.lightboxIndex.set(null); }

  prevImage() {
    const i = this.lightboxIndex() ?? 0;
    this.lightboxIndex.set(i > 0 ? i - 1 : this.filteredScreenshots().length - 1);
  }

  nextImage() {
    const i = this.lightboxIndex() ?? 0;
    this.lightboxIndex.set(i < this.filteredScreenshots().length - 1 ? i + 1 : 0);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.lightboxIndex() === null) return;
    if (e.key === 'ArrowLeft') this.prevImage();
    if (e.key === 'ArrowRight') this.nextImage();
    if (e.key === 'Escape') this.closeLightbox();
  }
}
