import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LinksService } from '../../core/services/links.service';
import { ProjectsService } from '../../core/services/projects.service';
import { Link, LinkPreview, LinkType } from '../../core/models/link.model';
import { Project } from '../../core/models/project.model';

const LINK_TYPE_META: Record<LinkType, { label: string; icon: string; color: string }> = {
  repo:        { label: 'Repositorio',  icon: 'code',              color: 'text-cyan-400' },
  demo:        { label: 'Demo',         icon: 'open_in_new',       color: 'text-green-400' },
  article:     { label: 'Artículo',     icon: 'article',           color: 'text-blue-400' },
  video:       { label: 'Video',        icon: 'play_circle',       color: 'text-red-400' },
  docs:        { label: 'Docs',         icon: 'description',       color: 'text-purple-400' },
  certificate: { label: 'Certificado',  icon: 'workspace_premium', color: 'text-yellow-400' },
  other:       { label: 'Otro',         icon: 'link',              color: 'text-[var(--app-text-muted)]' },
};

const LINK_TYPES: LinkType[] = ['repo', 'demo', 'article', 'video', 'docs', 'certificate', 'other'];

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="px-8 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-[var(--app-text-primary)]">Links</h1>
          <p class="text-sm text-[var(--app-text-muted)] mt-1">Gestiona los enlaces de tus proyectos y recursos</p>
        </div>
        <button (click)="showForm.set(!showForm())"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                [class]="showForm() ? 'bg-[var(--app-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]' : 'bg-cyan-500 text-white hover:bg-cyan-400'">
          <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancelar' : 'Añadir link' }}
        </button>
      </div>

      <!-- Filtro por proyecto -->
      @if (links().length > 0) {
        <div class="flex gap-2 flex-wrap mb-6">
          <button (click)="filterProject.set(null)"
                  [class]="filterProject() === null ? 'bg-[var(--app-accent)] text-white border-[var(--app-accent)]' : 'bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] border-[var(--app-border)]'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border">
            Todos ({{ links().length }})
          </button>
          @for (group of groupedLinks(); track group.projectId) {
            <button (click)="filterProject.set(group.projectId)"
                    [class]="filterProject() === group.projectId ? 'bg-[var(--app-accent)] text-white border-[var(--app-accent)]' : 'bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] border-[var(--app-border)]'"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border">
              {{ group.projectName }} ({{ group.links.length }})
            </button>
          }
        </div>
      }

      <!-- Lista de links -->
      @if (filteredLinks().length === 0 && links().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 mb-8">
          <mat-icon class="text-[var(--app-text-subtle)] mb-3" style="font-size:48px;width:48px;height:48px;line-height:48px">link</mat-icon>
          <p class="text-[var(--app-text-muted)]">Añade tu primer link</p>
        </div>
      }

      @if (filteredLinks().length > 0) {
        <div class="flex flex-col gap-3 mb-8">
          @for (link of filteredLinks(); track link.id) {

            @if (editingId() === link.id) {
              <!-- Modo edición inline -->
              <div class="bg-[var(--app-surface)] border border-[var(--app-accent)] rounded-xl p-4">
                <form [formGroup]="editForm" (ngSubmit)="saveEdit(link.id)" class="flex flex-wrap gap-2 items-end">
                  <input formControlName="title" placeholder="Título"
                         class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-1.5 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors flex-1 min-w-32" />
                  <input formControlName="url" placeholder="https://..."
                         class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-1.5 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors flex-[2] min-w-48" />
                  <select formControlName="type"
                          class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-1.5 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors cursor-pointer">
                    @for (t of linkTypes; track t) {
                      <option [value]="t">{{ typeMeta(t).label }}</option>
                    }
                  </select>
                  <select formControlName="projectId"
                          class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-1.5 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors cursor-pointer">
                    <option [ngValue]="null">Sin proyecto</option>
                    @for (p of projects(); track p.id) {
                      <option [ngValue]="p.id">{{ p.name }}</option>
                    }
                  </select>
                  <div class="flex gap-2">
                    <button type="submit" [disabled]="editForm.invalid"
                            class="px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-medium hover:bg-cyan-400 disabled:opacity-40 transition-colors">
                      Guardar
                    </button>
                    <button type="button" (click)="cancelEdit()"
                            class="px-3 py-1.5 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] text-xs hover:text-[var(--app-text-primary)] transition-colors">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            } @else {
              <!-- Tarjeta de link con preview -->
              <div class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl overflow-hidden hover:border-[var(--app-accent)] transition-colors group">

                @if (link.previewImage) {
                  <!-- Vista con imagen de preview -->
                  <div class="flex gap-0">
                    <div class="w-40 shrink-0 relative overflow-hidden bg-[var(--app-hover)]">
                      <img [src]="link.previewImage" [alt]="link.previewTitle ?? link.title"
                           class="w-full h-full object-cover"
                           (error)="onImgError($event)" />
                    </div>
                    <div class="flex flex-1 min-w-0 items-center gap-4 px-4 py-3">
                      <mat-icon class="shrink-0 {{ typeMeta(link.type).color }}" style="font-size:20px;width:20px;height:20px;line-height:20px">
                        {{ typeMeta(link.type).icon }}
                      </mat-icon>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-[var(--app-text-primary)] text-sm truncate">
                          {{ link.previewTitle || link.title }}
                        </p>
                        @if (link.previewDescription) {
                          <p class="text-xs text-[var(--app-text-muted)] line-clamp-2 mt-0.5">{{ link.previewDescription }}</p>
                        }
                        <a [href]="link.url" target="_blank"
                           class="text-xs text-[var(--app-text-subtle)] hover:text-[var(--app-accent)] transition-colors truncate block mt-1">
                          {{ link.url }}
                        </a>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        @if (link.projectName) {
                          <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--app-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                            {{ link.projectName }}
                          </span>
                        }
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--app-hover)] border border-[var(--app-border)] {{ typeMeta(link.type).color }}">
                          {{ typeMeta(link.type).label }}
                        </span>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button (click)="startEdit(link)"
                                  class="p-1.5 rounded-lg hover:bg-[var(--app-hover)] text-[var(--app-text-subtle)] hover:text-[var(--app-text-primary)] transition-colors">
                            <mat-icon style="font-size:15px;width:15px;height:15px;line-height:15px">edit</mat-icon>
                          </button>
                          <button (click)="delete(link.id)"
                                  class="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--app-text-subtle)] hover:text-red-400 transition-colors">
                            <mat-icon style="font-size:15px;width:15px;height:15px;line-height:15px">delete</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- Vista simple sin preview -->
                  <div class="flex items-center gap-4 px-4 py-3">
                    <mat-icon class="shrink-0 {{ typeMeta(link.type).color }}" style="font-size:20px;width:20px;height:20px;line-height:20px">
                      {{ typeMeta(link.type).icon }}
                    </mat-icon>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-[var(--app-text-primary)] text-sm truncate">{{ link.title }}</p>
                      <a [href]="link.url" target="_blank"
                         class="text-xs text-[var(--app-text-muted)] hover:text-[var(--app-accent)] transition-colors truncate block">
                        {{ link.url }}
                      </a>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      @if (link.projectName) {
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--app-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                          {{ link.projectName }}
                        </span>
                      }
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--app-hover)] border border-[var(--app-border)] {{ typeMeta(link.type).color }}">
                        {{ typeMeta(link.type).label }}
                      </span>
                      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="startEdit(link)"
                                class="p-1.5 rounded-lg hover:bg-[var(--app-hover)] text-[var(--app-text-subtle)] hover:text-[var(--app-text-primary)] transition-colors">
                          <mat-icon style="font-size:15px;width:15px;height:15px;line-height:15px">edit</mat-icon>
                        </button>
                        <button (click)="delete(link.id)"
                                class="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--app-text-subtle)] hover:text-red-400 transition-colors">
                          <mat-icon style="font-size:15px;width:15px;height:15px;line-height:15px">delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      }

      <!-- Formulario de creación -->
      @if (showForm()) {
      <div class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5 max-w-2xl">
        <h3 class="text-[var(--app-text-primary)] font-semibold text-sm mb-4">Añadir link</h3>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3">

          <div class="flex gap-3">
            <div class="flex flex-col gap-1 flex-1">
              <label class="text-xs text-[var(--app-text-muted)]">Título *</label>
              <input formControlName="title" placeholder="Mi artículo en Medium..."
                     class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)]" />
            </div>
            <div class="flex flex-col gap-1 w-36">
              <label class="text-xs text-[var(--app-text-muted)]">Tipo</label>
              <select formControlName="type"
                      class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors cursor-pointer">
                @for (t of linkTypes; track t) {
                  <option [value]="t">{{ typeMeta(t).label }}</option>
                }
              </select>
            </div>
          </div>

          <!-- URL con fetch automático de preview -->
          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">URL *</label>
            <div class="flex gap-2">
              <input formControlName="url" placeholder="https://..."
                     (blur)="onUrlBlur()"
                     class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)] flex-1" />
              <button type="button" (click)="fetchPreview()"
                      [disabled]="!form.value.url || previewLoading()"
                      class="px-3 py-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] text-xs hover:border-[var(--app-accent)] hover:text-[var(--app-accent)] disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1.5">
                @if (previewLoading()) {
                  <div class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                } @else {
                  <mat-icon style="font-size:14px;width:14px;height:14px;line-height:14px">image_search</mat-icon>
                }
                Preview
              </button>
            </div>
          </div>

          <!-- Tarjeta de preview -->
          @if (preview()) {
            <div class="rounded-xl border border-[var(--app-border)] overflow-hidden flex">
              @if (preview()!.image) {
                <img [src]="preview()!.image!" alt="preview"
                     class="w-32 h-20 object-cover shrink-0"
                     (error)="onImgError($event)" />
              }
              <div class="p-3 flex flex-col justify-center min-w-0">
                @if (preview()!.title) {
                  <p class="text-sm font-medium text-[var(--app-text-primary)] truncate">{{ preview()!.title }}</p>
                }
                @if (preview()!.description) {
                  <p class="text-xs text-[var(--app-text-muted)] line-clamp-2 mt-0.5">{{ preview()!.description }}</p>
                }
                @if (preview()!.siteName) {
                  <p class="text-[10px] text-[var(--app-text-subtle)] mt-1">{{ preview()!.siteName }}</p>
                }
              </div>
              <button type="button" (click)="clearPreview()"
                      class="ml-auto mr-2 self-start mt-2 p-1 rounded text-[var(--app-text-subtle)] hover:text-[var(--app-text-primary)] transition-colors">
                <mat-icon style="font-size:14px;width:14px;height:14px;line-height:14px">close</mat-icon>
              </button>
            </div>
          }

          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">Proyecto <span class="text-[var(--app-text-subtle)]">(opcional)</span></label>
            <select formControlName="projectId"
                    class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors cursor-pointer">
              <option [ngValue]="null">Sin proyecto (link global)</option>
              @for (p of projects(); track p.id) {
                <option [ngValue]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>

          @if (error()) {
            <p class="text-xs text-red-400">{{ error() }}</p>
          }

          <button type="submit" [disabled]="form.invalid"
                  class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1">
            <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">add</mat-icon>
            Añadir link
          </button>
        </form>
      </div>
      }
    </div>
  `,
})
export class LinksComponent implements OnInit {
  private readonly service = inject(LinksService);
  private readonly projectsService = inject(ProjectsService);
  private readonly fb = inject(FormBuilder);

  links = signal<Link[]>([]);
  projects = signal<Project[]>([]);
  editingId = signal<number | null>(null);
  filterProject = signal<number | null>(null);
  error = signal<string | null>(null);
  preview = signal<LinkPreview | null>(null);
  previewLoading = signal(false);
  showForm = signal(false);

  private previewDebounce: ReturnType<typeof setTimeout> | null = null;

  readonly linkTypes = LINK_TYPES;

  groupedLinks = computed(() => {
    const map = new Map<number | null, { projectId: number | null; projectName: string; links: Link[] }>();
    for (const link of this.links()) {
      const key = link.projectId;
      if (!map.has(key)) {
        map.set(key, { projectId: key, projectName: link.projectName ?? 'Sin proyecto', links: [] });
      }
      map.get(key)!.links.push(link);
    }
    return Array.from(map.values());
  });

  filteredLinks = computed(() => {
    const f = this.filterProject();
    if (f === null) return this.links();
    return this.links().filter(l => l.projectId === f);
  });

  form = this.fb.group({
    title: ['', Validators.required],
    url: ['', Validators.required],
    type: ['other' as LinkType],
    projectId: [null as number | null],
  });

  editForm = this.fb.group({
    title: ['', Validators.required],
    url: ['', Validators.required],
    type: ['other' as LinkType],
    projectId: [null as number | null],
  });

  ngOnInit() {
    this.service.getAll().subscribe(res => this.links.set(res.data));
    this.projectsService.getAll().subscribe(res => this.projects.set(res.data));
  }

  onUrlBlur() {
    const url = this.form.value.url?.trim();
    if (url && !this.preview()) this.fetchPreview();
  }

  fetchPreview() {
    const url = this.form.value.url?.trim();
    if (!url) return;
    this.previewLoading.set(true);
    this.service.fetchPreview(url).subscribe({
      next: res => { this.preview.set(res.data); this.previewLoading.set(false); },
      error: () => { this.preview.set(null); this.previewLoading.set(false); },
    });
  }

  clearPreview() { this.preview.set(null); }

  submit() {
    const { title, url, type, projectId } = this.form.value;
    const p = this.preview();
    this.error.set(null);
    this.service.create({
      title: title!, url: url!, type: type as LinkType, projectId: projectId ?? null,
      previewTitle: p?.title ?? null,
      previewDescription: p?.description ?? null,
      previewImage: p?.image ?? null,
    }).subscribe({
      next: res => {
        const project = this.projects().find(pr => pr.id === projectId);
        this.links.update(list => [{
          id: res.id, userId: 0,
          projectId: projectId ?? null, projectName: project?.name ?? null,
          title: title!, url: url!, type: type as LinkType,
          previewTitle: p?.title ?? null,
          previewDescription: p?.description ?? null,
          previewImage: p?.image ?? null,
          createdAt: new Date().toISOString(),
        }, ...list]);
        this.form.reset({ title: '', url: '', type: 'other', projectId: null });
        this.preview.set(null);
        this.showForm.set(false);
      },
      error: err => this.error.set(err.error?.message ?? 'Error al crear el link'),
    });
  }

  startEdit(link: Link) {
    this.editingId.set(link.id);
    this.editForm.setValue({ title: link.title, url: link.url, type: link.type, projectId: link.projectId });
  }

  cancelEdit() { this.editingId.set(null); }

  saveEdit(id: number) {
    const { title, url, type, projectId } = this.editForm.value;
    const original = this.links().find(l => l.id === id);
    this.service.update(id, {
      title: title!, url: url!, type: type as LinkType, projectId: projectId ?? null,
      previewTitle: original?.previewTitle ?? null,
      previewDescription: original?.previewDescription ?? null,
      previewImage: original?.previewImage ?? null,
    }).subscribe({
      next: () => {
        const project = this.projects().find(p => p.id === projectId);
        this.links.update(list => list.map(l => l.id === id
          ? { ...l, title: title!, url: url!, type: type as LinkType, projectId: projectId ?? null, projectName: project?.name ?? null }
          : l
        ));
        this.editingId.set(null);
      },
      error: err => this.error.set(err.error?.message ?? 'Error al actualizar'),
    });
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() =>
      this.links.update(list => list.filter(l => l.id !== id))
    );
  }

  typeMeta(type: LinkType) { return LINK_TYPE_META[type] ?? LINK_TYPE_META.other; }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
