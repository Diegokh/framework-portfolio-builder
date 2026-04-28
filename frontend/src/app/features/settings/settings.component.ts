import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="px-8 py-6 max-w-3xl flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--app-text-primary)]">Ajustes</h1>
        <p class="text-sm text-[var(--app-text-muted)] mt-1">Personaliza tu experiencia y gestiona tu cuenta</p>
      </div>

      <!-- Tema -->
      <section class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5">
        <div class="flex items-center gap-2 mb-4">
          <mat-icon class="text-[var(--app-text-muted)]">palette</mat-icon>
          <h2 class="font-semibold text-[var(--app-text-primary)]">Tema</h2>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" (click)="theme.setTheme('dark')"
                  [class]="!theme.isLightTheme() ? 'border-[var(--app-accent)] ring-2 ring-[color:var(--app-accent-soft)]' : 'border-[var(--app-border)] hover:border-[var(--app-accent)]'"
                  class="text-left rounded-xl border bg-[var(--app-surface)] p-4 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 via-slate-900 to-slate-950 border border-slate-700 flex items-center justify-center">
                <mat-icon class="text-cyan-300" style="font-size:18px;width:18px;height:18px;line-height:18px">dark_mode</mat-icon>
              </div>
              @if (!theme.isLightTheme()) {
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)]">Activo</span>
              }
            </div>
            <p class="font-medium text-[var(--app-text-primary)] text-sm">Oscuro</p>
            <p class="text-xs text-[var(--app-text-muted)] mt-0.5">Menos brillo, look técnico</p>
          </button>

          <button type="button" (click)="theme.setTheme('light')"
                  [class]="theme.isLightTheme() ? 'border-[var(--app-accent)] ring-2 ring-[color:var(--app-accent-soft)]' : 'border-[var(--app-border)] hover:border-[var(--app-accent)]'"
                  class="text-left rounded-xl border bg-[var(--app-surface)] p-4 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-200 via-white to-amber-100 border border-slate-200 flex items-center justify-center">
                <mat-icon class="text-amber-500" style="font-size:18px;width:18px;height:18px;line-height:18px">light_mode</mat-icon>
              </div>
              @if (theme.isLightTheme()) {
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)]">Activo</span>
              }
            </div>
            <p class="font-medium text-[var(--app-text-primary)] text-sm">Claro</p>
            <p class="text-xs text-[var(--app-text-muted)] mt-0.5">Fondo luminoso, mayor contraste</p>
          </button>
        </div>
      </section>

      <!-- Idioma del portfolio público -->
      <section class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5">
        <div class="flex items-center gap-2 mb-1">
          <mat-icon class="text-[var(--app-text-muted)]">language</mat-icon>
          <h2 class="font-semibold text-[var(--app-text-primary)]">Idioma del portfolio público</h2>
        </div>
        <p class="text-xs text-[var(--app-text-muted)] mb-4">Define en qué idioma se mostrará tu portfolio a los visitantes</p>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" (click)="lang.setLanguage('es')"
                  [class]="lang.language() === 'es' ? 'border-[var(--app-accent)] ring-2 ring-[color:var(--app-accent-soft)]' : 'border-[var(--app-border)] hover:border-[var(--app-accent)]'"
                  class="flex items-center gap-3 rounded-xl border bg-[var(--app-surface)] p-4 transition-all">
            <span class="text-2xl">🇪🇸</span>
            <div class="text-left">
              <p class="font-medium text-[var(--app-text-primary)] text-sm">Español</p>
              <p class="text-xs text-[var(--app-text-muted)]">Portfolio en español</p>
            </div>
            @if (lang.language() === 'es') {
              <span class="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)]">Activo</span>
            }
          </button>

          <button type="button" (click)="lang.setLanguage('en')"
                  [class]="lang.language() === 'en' ? 'border-[var(--app-accent)] ring-2 ring-[color:var(--app-accent-soft)]' : 'border-[var(--app-border)] hover:border-[var(--app-accent)]'"
                  class="flex items-center gap-3 rounded-xl border bg-[var(--app-surface)] p-4 transition-all">
            <span class="text-2xl">🇬🇧</span>
            <div class="text-left">
              <p class="font-medium text-[var(--app-text-primary)] text-sm">English</p>
              <p class="text-xs text-[var(--app-text-muted)]">Portfolio in English</p>
            </div>
            @if (lang.language() === 'en') {
              <span class="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)]">Active</span>
            }
          </button>
        </div>
      </section>

      <!-- Cambio de contraseña -->
      <section class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <mat-icon class="text-[var(--app-text-muted)]">lock</mat-icon>
            <h2 class="font-semibold text-[var(--app-text-primary)]">Cambiar contraseña</h2>
          </div>
          <button (click)="showPasswordForm.set(!showPasswordForm())"
                  class="text-xs text-[var(--app-text-muted)] hover:text-[var(--app-accent)] transition-colors">
            {{ showPasswordForm() ? 'Cancelar' : 'Cambiar' }}
          </button>
        </div>

        @if (!showPasswordForm()) {
          <p class="text-sm text-[var(--app-text-muted)]">••••••••••••</p>
        } @else {
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-[var(--app-text-muted)]">Contraseña actual</label>
              <input formControlName="current" type="password" placeholder="••••••••"
                     class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors" />
            </div>
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs text-[var(--app-text-muted)]">Nueva contraseña</label>
                <input formControlName="newPass" type="password" placeholder="Mín. 6 caracteres"
                       class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors" />
              </div>
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs text-[var(--app-text-muted)]">Confirmar</label>
                <input formControlName="confirm" type="password" placeholder="Repetir contraseña"
                       class="bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 text-[var(--app-text-primary)] text-sm outline-none focus:border-[var(--app-accent)] transition-colors" />
              </div>
            </div>

            @if (passwordError()) {
              <p class="text-xs text-red-400">{{ passwordError() }}</p>
            }
            @if (passwordSuccess()) {
              <p class="text-xs text-green-400">{{ passwordSuccess() }}</p>
            }

            <button type="submit"
                    [disabled]="passwordForm.invalid || passwordForm.value.newPass !== passwordForm.value.confirm || savingPassword()"
                    class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-start">
              @if (savingPassword()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              } @else {
                <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">check</mat-icon>
              }
              Guardar contraseña
            </button>

            @if (passwordForm.value.newPass && passwordForm.value.confirm && passwordForm.value.newPass !== passwordForm.value.confirm) {
              <p class="text-xs text-orange-400">Las contraseñas no coinciden</p>
            }
          </form>
        }
      </section>

      <!-- Exportar datos -->
      <section class="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-5">
        <div class="flex items-center gap-2 mb-1">
          <mat-icon class="text-[var(--app-text-muted)]">download</mat-icon>
          <h2 class="font-semibold text-[var(--app-text-primary)]">Exportar datos</h2>
        </div>
        <p class="text-xs text-[var(--app-text-muted)] mb-4">
          Descarga todo tu portfolio en formato JSON: proyectos, habilidades, categorías, links y perfil.
        </p>
        <button (click)="exportData()" [disabled]="exporting()"
                class="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] text-sm font-medium hover:border-[var(--app-accent)] hover:text-[var(--app-accent)] disabled:opacity-40 transition-colors">
          @if (exporting()) {
            <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Exportando...
          } @else {
            <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px">download</mat-icon>
            Descargar JSON
          }
        </button>
      </section>
    </div>
  `,
})
export class SettingsComponent {
  readonly theme = inject(ThemeService);
  readonly lang = inject(LanguageService);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  showPasswordForm = signal(false);
  savingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);
  exporting = signal(false);

  passwordForm = this.fb.group({
    current: ['', Validators.required],
    newPass: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });

  changePassword() {
    const { current, newPass, confirm } = this.passwordForm.value;
    if (newPass !== confirm) return;

    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.auth.changePassword(current!, newPass!).subscribe({
      next: () => {
        this.passwordSuccess.set('Contraseña actualizada correctamente');
        this.passwordForm.reset();
        this.savingPassword.set(false);
        setTimeout(() => {
          this.showPasswordForm.set(false);
          this.passwordSuccess.set(null);
        }, 2000);
      },
      error: err => {
        this.passwordError.set(err.error?.message ?? 'Error al cambiar la contraseña');
        this.savingPassword.set(false);
      },
    });
  }

  exportData() {
    this.exporting.set(true);
    this.http.get(`${environment.apiUrl}/export`, { responseType: 'blob' }).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => this.exporting.set(false),
    });
  }
}
