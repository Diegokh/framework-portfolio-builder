import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person</mat-icon> Mi perfil profesional
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()">
            <mat-form-field appearance="outline">
              <mat-label>Bio</mat-label>
              <textarea matInput formControlName="bio" rows="4"
                placeholder="Desarrollador full-stack con experiencia en..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>GitHub</mat-label>
              <mat-icon matPrefix>code</mat-icon>
              <input matInput formControlName="github" placeholder="https://github.com/usuario" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>LinkedIn</mat-label>
              <mat-icon matPrefix>work</mat-icon>
              <input matInput formControlName="linkedin" placeholder="https://linkedin.com/in/usuario" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Web personal</mat-label>
              <mat-icon matPrefix>language</mat-icon>
              <input matInput formControlName="website" placeholder="https://miweb.com" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Skills</mat-label>
              <input matInput formControlName="skills"
                placeholder="Angular, Node.js, MySQL, Docker..." />
              <mat-hint>Separadas por coma</mat-hint>
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit">
                <mat-icon>save</mat-icon> Guardar perfil
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
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    mat-form-field {
      width: 100%;
      margin-top: 12px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
  `,
})
export class ProfileComponent implements OnInit {
  private readonly service = inject(ProfileService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  saved = signal(false);

  form = this.fb.group({
    bio: [''],
    github: [''],
    linkedin: [''],
    website: [''],
    skills: [''],
  });

  ngOnInit() {
    this.service.get().subscribe(res => {
      if (res.data) this.form.patchValue(res.data);
    });
  }

  save() {
    this.service.update(this.form.value).subscribe(() => {
      this.snackBar.open('Perfil guardado correctamente', 'Cerrar', { duration: 3000 });
    });
  }
}
