import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: 'profiles/:userId',
    loadComponent: () =>
      import('./features/profile/public-profile/public-profile.component').then(m => m.PublicProfileComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/users-directory/users-directory.component').then(m => m.UserDirectoryComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/projects-list/projects-list.component').then(m => m.ProjectsListComponent),
  },
  {
    path: 'projects/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/projects-form/projects-form.component').then(m => m.ProjectFormComponent),
  },
  {
    path: 'projects/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/projects-form/projects-form.component').then(m => m.ProjectFormComponent),
  },
  {
    path: 'projects/:id/detail',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/categories.component').then(m => m.CategoriesComponent),
  },
  {
    path: 'links',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/links/links.component').then(m => m.LinksComponent),
  },
  {
    path: 'captures',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/captures/captures.component').then(m => m.CapturesComponent),
  },
  {
    path: 'skills',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/skills/skills.component').then(m => m.SkillsComponent),
  },
  {
    path: 'contact',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
