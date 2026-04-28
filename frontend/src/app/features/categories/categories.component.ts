import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models/category.model';

const PRESET_COLORS = [
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#8b5cf6', label: 'Violeta' },
  { hex: '#22c55e', label: 'Verde' },
  { hex: '#f97316', label: 'Naranja' },
  { hex: '#ef4444', label: 'Rojo' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#eab308', label: 'Amarillo' },
];

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="px-8 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-[var(--app-text-primary)]">Categorías</h1>
          <p class="text-sm text-[var(--app-text-muted)] mt-1">Organiza tus proyectos por categoría</p>
        </div>
        <button (click)="showForm.set(!showForm())"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                [class]="showForm() ? 'bg-[var(--app-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]' : 'bg-cyan-500 text-white hover:bg-cyan-400'">
          <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancelar' : 'Nueva categoría' }}
        </button>
      </div>

      @if (categories().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 mb-8">
          <mat-icon class="text-[var(--app-text-subtle)] mb-3" style="font-size:48px;width:48px;height:48px;line-height:48px">label</mat-icon>
          <p class="text-[var(--app-text-muted)]">Crea tu primera categoría para organizar proyectos</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
          @for (cat of categories(); track cat.id) {
            <div class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-4 flex flex-col gap-3 hover:border-[var(--app-accent)] transition-colors group">

              @if (editingId() === cat.id) {
                <form [formGroup]="editForm" (ngSubmit)="saveEdit(cat.id)" class="flex flex-col gap-2">
                  <input formControlName="name"
                         class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-1.5 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors" />
                  <div class="flex flex-wrap gap-1.5">
                    @for (color of presetColors; track color.hex) {
                      <button type="button" (click)="editForm.patchValue({ color: color.hex })"
                              [style.background]="color.hex"
                              [class]="editForm.value.color === color.hex ? 'ring-2 ring-white ring-offset-1 ring-offset-[var(--app-surface)]' : ''"
                              class="w-5 h-5 rounded-full transition-all"
                              [title]="color.label">
                      </button>
                    }
                  </div>
                  <input formControlName="description" placeholder="Descripción (opcional)"
                         class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-1.5 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)]" />
                  <div class="flex gap-2">
                    <button type="submit" [disabled]="editForm.invalid"
                            class="flex-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-medium hover:bg-cyan-400 disabled:opacity-40 transition-colors">
                      Guardar
                    </button>
                    <button type="button" (click)="cancelEdit()"
                            class="px-3 py-1.5 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] text-xs hover:text-[var(--app-text-primary)] transition-colors">
                      Cancelar
                    </button>
                  </div>
                </form>
              } @else {
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-3 h-3 rounded-full shrink-0" [style.background]="cat.color"></span>
                    <p class="font-semibold text-[var(--app-text-primary)] text-sm">{{ cat.name }}</p>
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="startEdit(cat)"
                            class="p-1 rounded-md hover:bg-[var(--app-hover)] text-[var(--app-text-subtle)] hover:text-[var(--app-text-primary)] transition-colors">
                      <mat-icon style="font-size:15px;width:15px;height:15px;line-height:15px">edit</mat-icon>
                    </button>
                    <button (click)="delete(cat.id)"
                            class="p-1 rounded-md hover:bg-red-500/10 text-[var(--app-text-subtle)] hover:text-red-400 transition-colors">
                      <mat-icon style="font-size:15px;width:15px;height:15px;line-height:15px">close</mat-icon>
                    </button>
                  </div>
                </div>

                @if (cat.description) {
                  <p class="text-xs text-[var(--app-text-muted)] leading-relaxed -mt-1">{{ cat.description }}</p>
                }

                <div class="flex items-center gap-1.5 mt-auto pt-1 border-t border-[var(--app-border)]">
                  <mat-icon style="font-size:13px;width:13px;height:13px;line-height:13px" class="text-[var(--app-text-subtle)]">folder</mat-icon>
                  <span class="text-xs text-[var(--app-text-muted)]">
                    {{ cat.projectCount }} {{ cat.projectCount === 1 ? 'proyecto' : 'proyectos' }}
                  </span>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Formulario de creación -->
      @if (showForm()) {
      <div class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5 max-w-xl">
        <h3 class="text-[var(--app-text-primary)] font-semibold text-sm mb-4">Nueva categoría</h3>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">Nombre *</label>
            <input formControlName="name" placeholder="Web App, API REST, Mobile..."
                   class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)]" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">Color</label>
            <div class="flex flex-wrap gap-2">
              @for (color of presetColors; track color.hex) {
                <button type="button" (click)="form.patchValue({ color: color.hex })"
                        [style.background]="color.hex"
                        [class]="form.value.color === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--app-surface)] scale-110' : 'hover:scale-105'"
                        class="w-6 h-6 rounded-full transition-all"
                        [title]="color.label">
                </button>
              }
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">Descripción <span class="text-[var(--app-text-subtle)]">(opcional)</span></label>
            <input formControlName="description" placeholder="Breve descripción de esta categoría"
                   class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors placeholder-[var(--app-text-subtle)]" />
          </div>

          @if (error()) {
            <p class="text-xs text-red-400">{{ error() }}</p>
          }

          <button type="submit" [disabled]="form.invalid"
                  class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1">
            <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">add</mat-icon>
            Añadir categoría
          </button>
        </form>
      </div>
      }
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  private readonly service = inject(CategoriesService);
  private readonly fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  editingId = signal<number | null>(null);
  error = signal<string | null>(null);
  showForm = signal(false);

  readonly presetColors = PRESET_COLORS;

  form = this.fb.group({
    name: ['', Validators.required],
    color: ['#06b6d4'],
    description: [''],
  });

  editForm = this.fb.group({
    name: ['', Validators.required],
    color: ['#06b6d4'],
    description: [''],
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    this.service.getAll().subscribe(res => this.categories.set(res.data));
  }

  submit() {
    const { name, color, description } = this.form.value;
    this.error.set(null);
    this.service.create(name!, color!, description || undefined).subscribe({
      next: res => {
        this.categories.update(list => [
          ...list,
          { id: res.id, userId: 0, name: name!, color: color!, description: description || undefined, projectCount: 0, createdAt: new Date().toISOString() },
        ]);
        this.form.reset({ name: '', color: '#06b6d4', description: '' });
        this.showForm.set(false);
      },
      error: err => this.error.set(err.error?.message ?? 'Error al crear la categoría'),
    });
  }

  startEdit(cat: Category) {
    this.editingId.set(cat.id);
    this.editForm.setValue({ name: cat.name, color: cat.color, description: cat.description ?? '' });
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(id: number) {
    const { name, color, description } = this.editForm.value;
    this.service.update(id, name!, color!, description || undefined).subscribe({
      next: () => {
        this.categories.update(list =>
          list.map(c => c.id === id ? { ...c, name: name!, color: color!, description: description || undefined } : c)
        );
        this.editingId.set(null);
      },
      error: err => this.error.set(err.error?.message ?? 'Error al actualizar'),
    });
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() =>
      this.categories.update(list => list.filter(c => c.id !== id))
    );
  }
}
