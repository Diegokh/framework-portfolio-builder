import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">

        <!-- Verificando -->
        <div *ngIf="state() === 'loading'" class="state-block">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Verificando tu cuenta...</p>
        </div>

        <!-- Éxito -->
        <div *ngIf="state() === 'success'" class="state-block">
          <div class="icon-circle success">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h2>¡Cuenta verificada!</h2>
          <p>Tu email ha sido confirmado correctamente. Ya puedes iniciar sesión.</p>
          <a routerLink="/login" mat-raised-button color="primary">Iniciar sesión</a>
        </div>

        <!-- Error -->
        <div *ngIf="state() === 'error'" class="state-block">
          <div class="icon-circle error">
            <mat-icon>error_outline</mat-icon>
          </div>
          <h2>Enlace inválido</h2>
          <p>El enlace de verificación no es válido o ya ha sido utilizado.</p>
          <a routerLink="/register" mat-stroked-button>Volver al registro</a>
        </div>

      </div>
    </div>
  `,
  styles: `
    .page {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: var(--app-bg, #0f1117);
    }
    .card {
      background: var(--app-surface, #1a1d27);
      border: 1px solid var(--app-border, #2a2d3a);
      border-radius: 20px; padding: 48px 36px;
      max-width: 420px; width: 100%; margin: 20px;
    }
    .state-block {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; text-align: center;
    }
    .state-block h2 { margin: 0; font-size: 22px; color: var(--app-text-primary, #e2e8f0); }
    .state-block p  { margin: 0; color: var(--app-text-muted, #94a3b8); line-height: 1.6; }
    .icon-circle {
      width: 80px; height: 80px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 8px;
    }
    .icon-circle mat-icon { font-size: 40px; width: 40px; height: 40px; color: white; }
    .icon-circle.success { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .icon-circle.error   { background: linear-gradient(135deg, #ef4444, #dc2626); }
  `,
})
export class VerifyEmailComponent implements OnInit {
  private readonly route  = inject(ActivatedRoute);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  state = signal<'loading' | 'success' | 'error'>('loading');

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.state.set('error'); return; }

    this.auth.verifyEmail(token).subscribe({
      next: () => this.state.set('success'),
      error: () => this.state.set('error'),
    });
  }
}
