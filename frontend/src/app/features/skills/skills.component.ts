import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SkillsService } from '../../core/services/skills.service';
import { Skill, SkillCategory } from '../../core/models/skill.model';

const CATEGORY_META: Record<SkillCategory, { label: string; color: string; bg: string }> = {
  frontend: { label: 'Frontend',       color: 'text-cyan-400',    bg: 'bg-cyan-400/10 border-cyan-400/30' },
  backend:  { label: 'Backend',        color: 'text-green-400',   bg: 'bg-green-400/10 border-green-400/30' },
  db:       { label: 'Base de datos',  color: 'text-purple-400',  bg: 'bg-purple-400/10 border-purple-400/30' },
  devops:   { label: 'DevOps',         color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/30' },
  soft:     { label: 'Soft Skills',    color: 'text-pink-400',    bg: 'bg-pink-400/10 border-pink-400/30' },
  other:    { label: 'Otros',          color: 'text-[var(--app-text-muted)]', bg: 'bg-[var(--app-hover)] border-[var(--app-border)]' },
};

const CATEGORIES: SkillCategory[] = ['frontend', 'backend', 'db', 'devops', 'soft', 'other'];

const SKILL_SUGGESTIONS: { category: SkillCategory; skills: string[] }[] = [
  {
    category: 'frontend',
    skills: ['Angular', 'React', 'Vue.js', 'Next.js', 'Svelte', 'Astro', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'SASS', 'Bootstrap', 'Redux', 'Vite', 'Webpack', 'Storybook'],
  },
  {
    category: 'backend',
    skills: ['Node.js', 'Express', 'NestJS', 'Python', 'Django', 'FastAPI', 'Flask', 'PHP', 'Laravel', 'Java', 'Spring Boot', 'C#', '.NET', 'Go', 'Rust', 'Ruby on Rails', 'GraphQL', 'REST API'],
  },
  {
    category: 'db',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase', 'MariaDB', 'DynamoDB', 'Prisma', 'TypeORM', 'Sequelize', 'ElasticSearch'],
  },
  {
    category: 'devops',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Nginx', 'Linux', 'Git', 'Terraform', 'Ansible'],
  },
  {
    category: 'soft',
    skills: ['Comunicación', 'Trabajo en equipo', 'Liderazgo', 'Resolución de problemas', 'Adaptabilidad', 'Gestión del tiempo', 'Creatividad', 'Pensamiento crítico', 'Proactividad', 'Empatía', 'Aprendizaje continuo', 'Organización', 'Autonomía', 'Gestión de conflictos'],
  },
  {
    category: 'other',
    skills: ['Scrum', 'Kanban', 'Agile', 'Jira', 'Figma', 'Adobe XD', 'Postman', 'Swagger', 'Notion', 'Confluence'],
  },
];

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="px-8 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-[var(--app-text-primary)]">Mis Habilidades</h1>
          <p class="text-sm text-[var(--app-text-muted)] mt-1">Gestiona tus competencias técnicas y personales</p>
        </div>
        <button (click)="showForm.set(!showForm())"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                [class]="showForm() ? 'bg-[var(--app-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]' : 'bg-cyan-500 text-white hover:bg-cyan-400'">
          <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancelar' : 'Añadir habilidad' }}
        </button>
      </div>

      <!-- Filtros por categoría -->
      <div class="flex gap-2 flex-wrap mb-6">
        <button (click)="activeCategory.set(null)"
                [class]="!activeCategory() ? 'bg-[var(--app-accent)] text-white border-[var(--app-accent)]' : 'bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] border-[var(--app-border)]'"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border">
          Todos ({{ skills().length }})
        </button>
        @for (cat of categories; track cat) {
          @if (countByCategory(cat) > 0) {
            <button (click)="activeCategory.set(cat)"
                    [class]="activeCategory() === cat ? 'bg-[var(--app-accent)] text-white border-[var(--app-accent)]' : 'bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] border-[var(--app-border)]'"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border">
              {{ categoryMeta(cat).label }} ({{ countByCategory(cat) }})
            </button>
          }
        }
      </div>

      <!-- Cards de habilidades -->
      @if (filteredSkills().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
          @for (skill of filteredSkills(); track skill.id) {
            <div class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-4 flex flex-col gap-3 hover:border-[var(--app-accent)] transition-colors group">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-semibold text-[var(--app-text-primary)] text-sm">{{ skill.name }}</p>
                  <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium border {{ categoryMeta(skill.category).color }} {{ categoryMeta(skill.category).bg }}">
                    {{ categoryMeta(skill.category).label }}
                  </span>
                </div>
                <button (click)="delete(skill.id)"
                        class="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-[var(--app-text-subtle)] hover:text-red-400 transition-all">
                  <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">close</mat-icon>
                </button>
              </div>

              <div class="flex gap-1.5 items-center">
                @for (dot of [1,2,3,4,5]; track dot) {
                  <div class="h-1.5 flex-1 rounded-full transition-colors"
                       [class]="dot <= skill.level ? levelColor(skill.level) : 'bg-[var(--app-border)]'">
                  </div>
                }
                <span class="text-[11px] text-[var(--app-text-muted)] ml-1 shrink-0">{{ levelLabel(skill.level) }}</span>
              </div>
            </div>
          }
        </div>
      } @else if (skills().length > 0) {
        <p class="text-[var(--app-text-muted)] text-sm mb-8">No hay habilidades en esta categoría.</p>
      }

      @if (skills().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 mb-8">
          <mat-icon class="text-[var(--app-text-subtle)] mb-3" style="font-size:48px;width:48px;height:48px;line-height:48px">psychology</mat-icon>
          <p class="text-[var(--app-text-muted)]">Añade tu primera habilidad</p>
        </div>
      }

      <!-- Formulario -->
      @if (showForm()) {
      <div class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5 max-w-xl">
        <h3 class="text-[var(--app-text-primary)] font-semibold text-sm mb-4">Añadir habilidad</h3>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3">

          <!-- Dropdown buscable -->
          <div class="flex flex-col gap-1">
            <label class="text-xs text-[var(--app-text-muted)]">Habilidad *</label>
            <div class="relative">
              <div class="flex items-center gap-2 bg-[var(--app-input-bg)] border rounded-lg px-3 py-2 transition-colors"
                   [class]="dropdownOpen() ? 'border-[var(--app-accent)]' : 'border-[var(--app-border)]'">
                <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px" class="text-[var(--app-text-subtle)] shrink-0">search</mat-icon>
                <input
                  [value]="searchText()"
                  (input)="onSearchInput($event)"
                  (focus)="dropdownOpen.set(true)"
                  (blur)="onBlur()"
                  placeholder="Buscar o escribe una habilidad..."
                  class="bg-transparent text-[var(--app-text-primary)] text-sm outline-none w-full placeholder-[var(--app-text-subtle)]" />
                @if (searchText()) {
                  <button type="button" (mousedown)="clearSearch()"
                          class="text-[var(--app-text-subtle)] hover:text-[var(--app-text-primary)] transition-colors shrink-0">
                    <mat-icon style="font-size:14px;width:14px;height:14px;line-height:14px">close</mat-icon>
                  </button>
                }
              </div>

              <!-- Panel de sugerencias -->
              @if (dropdownOpen() && filteredSuggestions().length > 0) {
                <div class="absolute top-full left-0 right-0 z-50 mt-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-xl overflow-auto max-h-64">
                  @for (skill of filteredSuggestions(); track skill) {
                    <button type="button"
                            (mousedown)="selectSuggestion(skill, $any(form.get('category')?.value))"
                            class="w-full text-left px-4 py-1.5 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text-primary)] transition-colors">
                      {{ skill }}
                    </button>
                  }
                </div>
              }

              @if (dropdownOpen() && searchText() && filteredSuggestions().length === 0) {
                <div class="absolute top-full left-0 right-0 z-50 mt-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-xl px-4 py-3">
                  <p class="text-xs text-[var(--app-text-muted)]">No hay sugerencias — se usará "<span class="text-[var(--app-text-primary)]">{{ searchText() }}</span>" como nombre</p>
                </div>
              }
            </div>

            @if (form.get('name')?.value) {
              <p class="text-[11px] text-[var(--app-text-subtle)] mt-0.5">
                Seleccionado: <span class="text-[var(--app-text-primary)] font-medium">{{ form.get('name')?.value }}</span>
              </p>
            }
          </div>

          <div class="flex gap-3">
            <div class="flex flex-col gap-1 flex-1">
              <label class="text-xs text-[var(--app-text-muted)]">Categoría</label>
              <select formControlName="category"
                      (change)="onCategoryChange()"
                      class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors cursor-pointer">
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ categoryMeta(cat).label }}</option>
                }
              </select>
            </div>

            <div class="flex flex-col gap-1 flex-1">
              <label class="text-xs text-[var(--app-text-muted)]">Nivel (1–5)</label>
              <select formControlName="level"
                      class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors cursor-pointer">
                <option value="1">1 – Básico</option>
                <option value="2">2 – Elemental</option>
                <option value="3">3 – Intermedio</option>
                <option value="4">4 – Avanzado</option>
                <option value="5">5 – Experto</option>
              </select>
            </div>
          </div>

          <button type="submit" [disabled]="form.invalid"
                  class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1">
            <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">add</mat-icon>
            Añadir habilidad
          </button>
        </form>
      </div>
      }
    </div>
  `,
})
export class SkillsComponent implements OnInit {
  private readonly service = inject(SkillsService);
  private readonly fb = inject(FormBuilder);

  skills = signal<Skill[]>([]);
  activeCategory = signal<SkillCategory | null>(null);
  dropdownOpen = signal(false);
  searchText = signal('');
  showForm = signal(false);

  readonly categories = CATEGORIES;

  filteredSkills = computed(() => {
    const cat = this.activeCategory();
    return cat ? this.skills().filter(s => s.category === cat) : this.skills();
  });

  filteredSuggestions = computed(() => {
    const q = this.searchText().toLowerCase().trim();
    const selectedCat = this.form.get('category')?.value as SkillCategory;
    const existing = new Set(this.skills().map(s => s.name.toLowerCase()));

    const group = SKILL_SUGGESTIONS.find(g => g.category === selectedCat);
    if (!group) return [];

    return group.skills.filter(s =>
      (!q || s.toLowerCase().includes(q)) && !existing.has(s.toLowerCase())
    );
  });

  form = this.fb.group({
    name: ['', Validators.required],
    category: ['frontend' as SkillCategory],
    level: [3],
  });

  ngOnInit() {
    this.service.getAll().subscribe(res => this.skills.set(res.data));
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
    this.form.patchValue({ name: value });
    this.dropdownOpen.set(true);
  }

  onBlur() {
    setTimeout(() => this.dropdownOpen.set(false), 150);
  }

  clearSearch() {
    this.searchText.set('');
    this.form.patchValue({ name: '' });
  }

  onCategoryChange() {
    this.searchText.set('');
    this.form.patchValue({ name: '' });
  }

  selectSuggestion(name: string, category: SkillCategory) {
    this.searchText.set(name);
    this.form.patchValue({ name, category });
    this.dropdownOpen.set(false);
  }

  submit() {
    const { name, category, level } = this.form.value;
    this.service.create(name!, category as SkillCategory, Number(level)).subscribe(res => {
      this.skills.update(list => [
        ...list,
        { id: res.id, userId: 0, name: name!, category: category as SkillCategory, level: Number(level), createdAt: new Date().toISOString() },
      ]);
      this.form.reset({ name: '', category: 'frontend', level: 3 });
      this.searchText.set('');
      this.showForm.set(false);
    });
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() =>
      this.skills.update(list => list.filter(s => s.id !== id))
    );
  }

  countByCategory(cat: SkillCategory): number {
    return this.skills().filter(s => s.category === cat).length;
  }

  categoryMeta(cat: SkillCategory) {
    return CATEGORY_META[cat] ?? CATEGORY_META.other;
  }

  levelLabel(level: number): string {
    return ['', 'Básico', 'Elemental', 'Intermedio', 'Avanzado', 'Experto'][level] ?? '';
  }

  levelColor(level: number): string {
    if (level <= 1) return 'bg-red-500';
    if (level === 2) return 'bg-orange-400';
    if (level === 3) return 'bg-yellow-400';
    if (level === 4) return 'bg-cyan-400';
    return 'bg-green-400';
  }
}
