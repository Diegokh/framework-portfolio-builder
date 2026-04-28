import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProjectsService } from '../../../core/services/projects.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { ProjectStatus } from '../../../core/models/project.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEdit ? 'Editar proyecto' : 'Nuevo proyecto' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="name" />
              @if (form.get('name')?.hasError('required')) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
              @if (form.get('name')?.hasError('minlength')) {
                <mat-error>Mínimo 2 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>URL del repositorio</mat-label>
              <input matInput formControlName="repoUrl" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>URL de la demo</mat-label>
              <input matInput formControlName="liveUrl" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="status">
                <mat-option value="in_progress">En desarrollo</mat-option>
                <mat-option value="published">Publicado</mat-option>
                <mat-option value="archived">Archivado</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option [value]="null">Sin categoría</mat-option>
                @for (cat of categories(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="date-row">
              <mat-form-field appearance="outline">
                <mat-label>Fecha de inicio</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
                <mat-datepicker-toggle matSuffix [for]="startPicker" />
                <mat-datepicker #startPicker />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha de finalización</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
                <mat-datepicker-toggle matSuffix [for]="endPicker" />
                <mat-datepicker #endPicker />
              </mat-form-field>
            </div>

            <div class="actions">
              <button mat-button type="button" (click)="cancel()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                {{ isEdit ? 'Guardar cambios' : 'Crear proyecto' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }
    mat-form-field {
      width: 100%;
      margin-top: 12px;
    }
    .date-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `,
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProjectsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  categories = signal<Category[]>([]);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    repoUrl: [''],
    liveUrl: [''],
    status: ['in_progress' as ProjectStatus],
    startDate: [''],
    endDate: [''],
    categoryId: [null as number | null],
  });

  isEdit = false;
  private id?: number;

  ngOnInit() {
    this.categoriesService.getAll().subscribe(res => this.categories.set(res.data));

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.isEdit = true;
      this.id = +paramId;
      this.service.getById(this.id).subscribe(res => {
        const { name, description, repoUrl, liveUrl, status, startDate, endDate, categoryId } = res.data;
        this.form.patchValue({
          name,
          description,
          repoUrl,
          liveUrl,
          status,
          startDate: startDate || '',
          endDate: endDate || '',
          categoryId: categoryId ?? null
        });
      });
    }
  }

  submit() {
    const formValue = this.form.value;
    
    // Convertir fechas a formato ISO string si son objetos Date
    const payload = {
      ...formValue,
      startDate: this.formatDateForSubmit(formValue.startDate),
      endDate: this.formatDateForSubmit(formValue.endDate),
    };

    if (this.isEdit && this.id) {
      this.service.update(this.id, payload).subscribe(() =>
        this.router.navigate(['/projects', this.id, 'detail'])
      );
    } else {
      this.service.create(payload).subscribe(res =>
        this.router.navigate(['/projects', res.id, 'detail'])
      );
    }
  }

  private formatDateForSubmit(date: any): string | undefined {
    if (!date) return undefined;
    
    // Si es un objeto Date, convertir a ISO (YYYY-MM-DD)
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // Si ya es un string, devolverlo tal cual
    if (typeof date === 'string') {
      return date || undefined;
    }
    
    return undefined;
  }

  cancel() {
    this.router.navigate(['/projects']);
  }
}
