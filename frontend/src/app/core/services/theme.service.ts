import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

const STORAGE_KEY = 'app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<AppTheme>(this.readInitialTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  setTheme(theme: AppTheme) {
    this.theme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  isLightTheme() {
    return this.theme() === 'light';
  }

  private readInitialTheme(): AppTheme {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === 'light' ? 'light' : 'dark';
  }

  private applyTheme(theme: AppTheme) {
    const root = this.document.documentElement;
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
  }
}
