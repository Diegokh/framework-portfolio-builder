import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'es' | 'en';

const STORAGE_KEY = 'app-language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<AppLanguage>(this.readInitial());

  setLanguage(lang: AppLanguage) {
    this.language.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  private readInitial(): AppLanguage {
    return (localStorage.getItem(STORAGE_KEY) as AppLanguage) ?? 'es';
  }
}
