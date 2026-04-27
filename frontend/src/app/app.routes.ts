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
  { path: '**', redirectTo: 'dashboard' },
];
