import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
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

      <!-- CV -->
      <mat-card class="cv-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>description</mat-icon> Currículum Vitae
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="cvUrl()" class="cv-current">
            <mat-icon>check_circle</mat-icon>
            <span>CV subido</span>
            <a [href]="apiBase + cvUrl()" target="_blank" rel="noopener" mat-stroked-button>
              <mat-icon>download</mat-icon> Ver / Descargar
            </a>
            <button mat-stroked-button color="warn" (click)="deleteCv()">
              <mat-icon>delete</mat-icon> Eliminar
            </button>
          </div>
          <div *ngIf="!cvUrl()" class="cv-empty">
            <mat-icon>upload_file</mat-icon>
            <p>No has subido ningún CV todavía</p>
          </div>
          <div class="cv-upload">
            <label class="upload-label">
              <mat-icon>attach_file</mat-icon>
              {{ selectedFile() ? selectedFile()!.name : 'Seleccionar archivo (PDF, DOC, DOCX · máx. 10 MB)' }}
              <input type="file" accept=".pdf,.doc,.docx" (change)="onFileSelected($event)" hidden />
            </label>
            <button mat-raised-button color="primary" [disabled]="!selectedFile() || uploading()" (click)="uploadCv()">
              <mat-icon>cloud_upload</mat-icon>
              {{ uploading() ? 'Subiendo...' : 'Subir CV' }}
            </button>
          </div>
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
    .cv-card {
      margin-top: 24px;
    }
    .cv-current {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      color: #4caf50;
    }
    .cv-current mat-icon { color: #4caf50; }
    .cv-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #999;
      padding: 16px 0;
    }
    .cv-empty mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .cv-upload {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .upload-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border: 1px dashed #aaa;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      flex: 1;
      min-width: 200px;
    }
    .upload-label:hover { border-color: #667eea; color: #667eea; }
  `,
})
export class ProfileComponent implements OnInit {
  private readonly service = inject(ProfileService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly apiBase = environment.apiUrl.replace('/api', '');

  cvUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  uploading = signal(false);

  form = this.fb.group({
    bio: [''],
    github: [''],
    linkedin: [''],
    website: [''],
    skills: [''],
  });

  ngOnInit() {
    this.service.get().subscribe(res => {
      if (res.data) {
        this.form.patchValue(res.data);
        this.cvUrl.set(res.data.cvUrl ?? null);
      }
    });
  }

  save() {
    this.service.update(this.form.value).subscribe(() => {
      this.snackBar.open('Perfil guardado correctamente', 'Cerrar', { duration: 3000 });
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  uploadCv() {
    const file = this.selectedFile();
    if (!file) return;
    this.uploading.set(true);
    this.service.uploadCv(file).subscribe({
      next: (res) => {
        this.cvUrl.set(res.cvUrl);
        this.selectedFile.set(null);
        this.uploading.set(false);
        this.snackBar.open('CV subido correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.uploading.set(false);
        this.snackBar.open('Error al subir el CV', 'Cerrar', { duration: 3000 });
      },
    });
  }

  deleteCv() {
    this.service.deleteCv().subscribe({
      next: () => {
        this.cvUrl.set(null);
        this.snackBar.open('CV eliminado', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al eliminar el CV', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
