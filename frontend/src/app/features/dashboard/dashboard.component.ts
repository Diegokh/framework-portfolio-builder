import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `<p class="text-[var(--app-text-muted)] p-8">Redirigiendo...</p>`,
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  ngOnInit() { this.router.navigate(['/projects']); }
}
