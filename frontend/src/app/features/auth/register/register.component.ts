import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">

        <!-- Estado: email enviado -->
        <div *ngIf="sent()" class="success-state">
          <div class="success-icon">
            <mat-icon>mark_email_read</mat-icon>
          </div>
          <h2>¡Revisa tu email!</h2>
          <p>Te hemos enviado un enlace de verificación a <strong>{{ sentEmail() }}</strong>.</p>
          <p class="hint">Haz clic en el enlace del email para activar tu cuenta y poder iniciar sesión.</p>
          <a routerLink="/login" mat-stroked-button>Ir al inicio de sesión</a>
        </div>

        <!-- Formulario de registro -->
        <ng-container *ngIf="!sent()">
          <mat-card-header>
            <mat-card-title>Crear cuenta</mat-card-title>
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
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
                @if (form.get('email')?.hasError('required')) {
                  <mat-error>El email es obligatorio</mat-error>
                }
                @if (form.get('email')?.hasError('email')) {
                  <mat-error>Email no válido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Contraseña</mat-label>
                <input matInput type="password" formControlName="password" />
                @if (form.get('password')?.hasError('required')) {
                  <mat-error>La contraseña es obligatoria</mat-error>
                }
                @if (form.get('password')?.hasError('minlength')) {
                  <mat-error>Mínimo 6 caracteres</mat-error>
                }
              </mat-form-field>

              @if (errorMsg) {
                <p class="error-msg">{{ errorMsg }}</p>
              }

              <div class="actions">
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="form.invalid || loading()">
                  {{ loading() ? 'Registrando...' : 'Registrarse' }}
                </button>
                <a routerLink="/login">¿Ya tienes cuenta? Inicia sesión</a>
              </div>
            </form>
          </mat-card-content>
        </ng-container>

      </mat-card>
    </div>
  `,
  styles: `
    .auth-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: var(--app-bg);
    }
    .auth-card { width: 100%; max-width: 420px; padding: 16px; }
    mat-form-field { width: 100%; margin-top: 12px; }
    .actions { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
    .error-msg { color: #dc2626; font-size: 0.875rem; margin: 4px 0; }

    /* Estado de éxito */
    .success-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 24px 16px; text-align: center;
    }
    .success-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex; align-items: center; justify-content: center;
      color: white; margin-bottom: 8px;
    }
    .success-icon mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .success-state h2 { margin: 0; font-size: 22px; }
    .success-state p { margin: 0; color: var(--app-text-muted, #64748b); line-height: 1.6; }
    .success-state .hint { font-size: 13px; }
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMsg = '';
  loading = signal(false);
  sent = signal(false);
  sentEmail = signal('');

  submit() {
    if (this.form.invalid) return;
    const { name, email, password } = this.form.value;
    this.loading.set(true);
    this.errorMsg = '';
    this.auth.register(name!, email!, password!).subscribe({
      next: () => {
        this.sentEmail.set(email!);
        this.sent.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'No se pudo crear la cuenta. El email ya existe.';
        this.loading.set(false);
      },
    });
  }
}
