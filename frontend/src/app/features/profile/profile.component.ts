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

      <!-- CABECERA ESTILO LINKEDIN -->
      <mat-card class="header-card">

        <!-- Foto de portada -->
        <div class="cover-area" [style.backgroundImage]="coverUrl() ? 'url(' + apiBase + coverUrl() + ')' : null">
          <div class="cover-overlay"></div>
          <div class="cover-actions">
            <label class="img-btn" title="Cambiar portada">
              <mat-icon>photo_camera</mat-icon>
              <input type="file" accept="image/*" (change)="onCoverSelected($event)" hidden />
            </label>
            <button *ngIf="coverUrl()" class="img-btn" (click)="deleteCover()" title="Eliminar portada">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>

        <!-- Avatar + botón quitar -->
        <div class="avatar-row">
          <div class="avatar-wrap">
            <div class="avatar" [style.backgroundImage]="avatarUrl() ? 'url(' + apiBase + avatarUrl() + ')' : null">
              <mat-icon *ngIf="!avatarUrl()">person</mat-icon>
            </div>
            <label class="avatar-btn" title="Cambiar foto">
              <mat-icon>photo_camera</mat-icon>
              <input type="file" accept="image/*" (change)="onAvatarSelected($event)" hidden />
            </label>
          </div>
          <div class="avatar-meta">
            <span class="avatar-hint">Foto de perfil</span>
            <button *ngIf="avatarUrl()" class="remove-avatar-btn" (click)="deleteAvatar()">
              <mat-icon>delete_outline</mat-icon> Quitar foto
            </button>
          </div>
        </div>

      </mat-card>

      <!-- FORMULARIO -->
      <mat-card class="form-card">
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
              <input matInput formControlName="skills" placeholder="Angular, Node.js, MySQL, Docker..." />
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
          <mat-card-title><mat-icon>description</mat-icon> Currículum Vitae</mat-card-title>
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
              {{ selectedCv() ? selectedCv()!.name : 'Seleccionar archivo (PDF, DOC, DOCX · máx. 10 MB)' }}
              <input type="file" accept=".pdf,.doc,.docx" (change)="onCvSelected($event)" hidden />
            </label>
            <button mat-raised-button color="primary" [disabled]="!selectedCv() || uploadingCv()" (click)="uploadCv()">
              <mat-icon>cloud_upload</mat-icon>
              {{ uploadingCv() ? 'Subiendo...' : 'Subir CV' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: `
    .container { padding: 24px; max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }

    /* HEADER */
    .header-card { overflow: visible; padding: 0 0 20px; }

    /* Portada */
    .cover-area {
      height: 200px;
      border-radius: 8px 8px 0 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 60%, #f64f59 100%);
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
    }
    .cover-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.35) 100%);
      pointer-events: none;
    }
    .cover-actions {
      position: absolute; bottom: 12px; right: 12px;
      display: flex; gap: 8px; opacity: 0; transition: opacity .2s;
    }
    .cover-area:hover .cover-actions { opacity: 1; }
    .img-btn {
      display: flex; align-items: center; justify-content: center;
      width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(0,0,0,.5); color: white; transition: background .15s;
      backdrop-filter: blur(4px);
    }
    .img-btn:hover { background: rgba(0,0,0,.75); }
    .img-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Avatar */
    .avatar-row {
      display: flex; align-items: flex-end; gap: 16px;
      padding: 0 24px; margin-top: -52px;
    }
    .avatar-wrap { position: relative; flex-shrink: 0; }
    .avatar {
      width: 100px; height: 100px; border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      background-size: cover; background-position: center;
      border: 4px solid var(--mat-card-container-color, #1e1e2e);
      display: flex; align-items: center; justify-content: center;
      color: white; box-shadow: 0 4px 16px rgba(0,0,0,.4);
    }
    .avatar mat-icon { font-size: 44px; width: 44px; height: 44px; }
    .avatar-btn {
      position: absolute; bottom: 2px; right: 2px;
      width: 30px; height: 30px; border-radius: 50%;
      border: 2px solid var(--mat-card-container-color, #1e1e2e);
      background: #667eea; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,.3); transition: background .15s;
    }
    .avatar-btn:hover { background: #764ba2; }
    .avatar-btn mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .avatar-meta {
      display: flex; flex-direction: column; gap: 4px; padding-bottom: 6px;
    }
    .avatar-hint { font-size: 12px; color: var(--mat-sys-on-surface-variant, #94a3b8); }
    .remove-avatar-btn {
      display: flex; align-items: center; gap: 4px; padding: 4px 10px;
      border-radius: 6px; border: 1px solid rgba(255,107,107,.5); color: #ff6b6b;
      background: rgba(255,107,107,.08); cursor: pointer; font-size: 12px;
      transition: background .15s;
    }
    .remove-avatar-btn:hover { background: rgba(255,107,107,.18); }
    .remove-avatar-btn mat-icon { font-size: 14px; width: 14px; height: 14px; }

    /* FORM */
    .form-card {}
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    mat-form-field { width: 100%; margin-top: 12px; }
    .actions { display: flex; justify-content: flex-end; margin-top: 16px; }

    /* CV */
    .cv-card {}
    .cv-current { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: #4caf50; }
    .cv-current mat-icon { color: #4caf50; }
    .cv-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #999; padding: 16px 0; }
    .cv-empty mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .cv-upload { display: flex; align-items: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
    .upload-label {
      display: flex; align-items: center; gap: 8px; padding: 8px 14px;
      border: 1px dashed #aaa; border-radius: 8px; cursor: pointer;
      font-size: 14px; color: #666; flex: 1; min-width: 200px;
    }
    .upload-label:hover { border-color: #667eea; color: #667eea; }
  `,
})
export class ProfileComponent implements OnInit {
  private readonly service = inject(ProfileService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly apiBase = environment.apiUrl.replace('/api', '');

  avatarUrl = signal<string | null>(null);
  coverUrl  = signal<string | null>(null);
  cvUrl     = signal<string | null>(null);
  selectedCv = signal<File | null>(null);
  uploadingCv = signal(false);

  form = this.fb.group({
    bio: [''], github: [''], linkedin: [''], website: [''], skills: [''],
  });

  ngOnInit() {
    this.service.get().subscribe(res => {
      if (res.data) {
        this.form.patchValue(res.data);
        this.cvUrl.set(res.data.cvUrl ?? null);
        this.avatarUrl.set(res.data.avatarUrl ?? null);
        this.coverUrl.set(res.data.coverUrl ?? null);
      }
    });
  }

  save() {
    this.service.update(this.form.value).subscribe(() =>
      this.snackBar.open('Perfil guardado correctamente', 'Cerrar', { duration: 3000 })
    );
  }

  // Avatar
  onAvatarSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.service.uploadAvatar(file).subscribe({
      next: (res) => { this.avatarUrl.set(res.url); this.snackBar.open('Foto actualizada', 'Cerrar', { duration: 2500 }); },
      error: () => this.snackBar.open('Error al subir la foto', 'Cerrar', { duration: 2500 }),
    });
  }

  deleteAvatar() {
    this.service.deleteAvatar().subscribe({
      next: () => { this.avatarUrl.set(null); this.snackBar.open('Foto eliminada', 'Cerrar', { duration: 2500 }); },
      error: () => this.snackBar.open('Error al eliminar la foto', 'Cerrar', { duration: 2500 }),
    });
  }

  // Cover
  onCoverSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.service.uploadCover(file).subscribe({
      next: (res) => { this.coverUrl.set(res.url); this.snackBar.open('Portada actualizada', 'Cerrar', { duration: 2500 }); },
      error: () => this.snackBar.open('Error al subir la portada', 'Cerrar', { duration: 2500 }),
    });
  }

  deleteCover() {
    this.service.deleteCover().subscribe({
      next: () => { this.coverUrl.set(null); this.snackBar.open('Portada eliminada', 'Cerrar', { duration: 2500 }); },
      error: () => this.snackBar.open('Error al eliminar la portada', 'Cerrar', { duration: 2500 }),
    });
  }

  // CV
  onCvSelected(e: Event) {
    this.selectedCv.set((e.target as HTMLInputElement).files?.[0] ?? null);
  }

  uploadCv() {
    const file = this.selectedCv();
    if (!file) return;
    this.uploadingCv.set(true);
    this.service.uploadCv(file).subscribe({
      next: (res) => { this.cvUrl.set(res.cvUrl); this.selectedCv.set(null); this.uploadingCv.set(false); this.snackBar.open('CV subido correctamente', 'Cerrar', { duration: 3000 }); },
      error: () => { this.uploadingCv.set(false); this.snackBar.open('Error al subir el CV', 'Cerrar', { duration: 3000 }); },
    });
  }

  deleteCv() {
    this.service.deleteCv().subscribe({
      next: () => { this.cvUrl.set(null); this.snackBar.open('CV eliminado', 'Cerrar', { duration: 3000 }); },
      error: () => this.snackBar.open('Error al eliminar el CV', 'Cerrar', { duration: 3000 }),
    });
  }
}
