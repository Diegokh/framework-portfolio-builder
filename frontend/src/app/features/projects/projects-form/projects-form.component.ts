import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ProjectsService } from '../../../core/services/projects.service';
import { ProjectStatus } from '../../../core/models/project.model';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    repoUrl: [''],
    liveUrl: [''],
    status: ['in_progress' as ProjectStatus],
  });

  isEdit = false;
  private id?: number;

  ngOnInit() {
    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.isEdit = true;
      this.id = +paramId;
      this.service.getById(this.id).subscribe(res => this.form.patchValue(res.data));
    }
  }

  submit() {
    if (this.isEdit && this.id) {
      this.service.update(this.id, this.form.value).subscribe(() =>
        this.router.navigate(['/projects'])
      );
    } else {
      this.service.create(this.form.value).subscribe(() =>
        this.router.navigate(['/projects'])
      );
    }
  }

  cancel() {
    this.router.navigate(['/projects']);
  }
}
