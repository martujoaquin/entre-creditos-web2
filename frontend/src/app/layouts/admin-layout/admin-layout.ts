import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  isSidebarOpen = false;
  isLoggingOut = false;
  logoutError = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  get userInitial(): string {
    return this.currentUser?.nombre_completo.trim().charAt(0).toUpperCase() || 'A';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.logoutError = '';
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.logoutError = '';

    this.authService
      .logout()
      .pipe(finalize(() => (this.isLoggingOut = false)))
      .subscribe({
        next: () => {
          this.closeSidebar();
          this.router.navigate(['/']);
        },
        error: () => {
          this.logoutError = 'No pudimos cerrar la sesión. Intentá nuevamente.';
        },
      });
  }
}
