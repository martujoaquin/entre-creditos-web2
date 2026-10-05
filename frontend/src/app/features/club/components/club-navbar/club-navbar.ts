import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';

import { Movie } from '../../../../core/models/movie.models';
import { AuthService } from '../../../../core/services/auth.service';
import { MovieService } from '../../../../core/services/movie.service';

@Component({
  selector: 'app-club-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './club-navbar.html',
  styleUrl: './club-navbar.css',
})
export class ClubNavbar {
  avatarLoadFailed = false;
  isDrawerOpen = false;
  isAvatarMenuOpen = false;
  isLoggingOut = false;
  isLoadingMovies = true;
  searchError = false;
  logoutError = '';
  searchTerm = '';
  movies: Movie[] = [];
  searchResults: Movie[] = [];
  isSearchOpen = false;
  selectedIndex = -1;

  constructor(
    private readonly authService: AuthService,
    private readonly movieService: MovieService,
    private readonly router: Router,
  ) {
    this.loadMovies();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  get isAdmin(): boolean {
    return this.currentUser?.es_admin === 1;
  }

  get avatarUrl(): string | null {
    return this.avatarLoadFailed ? null : this.currentUser?.avatar ?? null;
  }

  get userInitial(): string {
    return this.currentUser?.nombre_completo.trim().charAt(0).toUpperCase() || 'U';
  }

  onAvatarError(): void {
    this.avatarLoadFailed = true;
  }

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.logoutError = '';
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  toggleAvatarMenu(): void {
    this.isAvatarMenuOpen = !this.isAvatarMenuOpen;
    this.logoutError = '';
  }

  closeAvatarMenu(): void {
    this.isAvatarMenuOpen = false;
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.selectedIndex = -1;
    this.updateSearchResults();
  }

  onSearchFocus(): void {
    this.updateSearchResults();
  }

  onSearchEnter(event: Event): void {
    event.preventDefault();

    const selectedMovie = this.searchResults[this.selectedIndex] ?? this.searchResults[0];

    if (selectedMovie) {
      this.selectMovie(selectedMovie);
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeSearch(false);
      return;
    }

    if (!this.isSearchOpen || this.searchResults.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex =
        this.selectedIndex < this.searchResults.length - 1
          ? this.selectedIndex + 1
          : this.selectedIndex;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = this.selectedIndex > -1 ? this.selectedIndex - 1 : -1;
    }
  }

  selectMovie(movie: Movie): void {
    this.closeSearch();
    this.closeDrawer();
    this.router.navigate(['/club/peliculas', movie.id_pelicula]);
  }

  onPosterError(event: Event, movie: Movie): void {
    const image = event.target as HTMLImageElement;

    if (image.src !== movie.defaultPosterUrl) {
      image.src = movie.defaultPosterUrl;
    }
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
          this.closeDrawer();
          this.closeAvatarMenu();
          this.router.navigate(['/']);
        },
        error: () => {
          this.logoutError = 'No pudimos cerrar la sesión. Intentá nuevamente.';
        },
      });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDrawer();
    this.closeAvatarMenu();
    this.closeSearch(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.club-search')) {
      this.closeSearch(false);
    }
  }

  private loadMovies(): void {
    this.isLoadingMovies = true;
    this.searchError = false;

    this.movieService
      .getMovies()
      .pipe(finalize(() => (this.isLoadingMovies = false)))
      .subscribe({
        next: (movies) => {
          this.movies = movies;
          this.updateSearchResults();
        },
        error: () => {
          this.movies = [];
          this.searchResults = [];
          this.selectedIndex = -1;
          this.searchError = true;
        },
      });
  }

  private updateSearchResults(): void {
    const normalizedTerm = this.normalizeText(this.searchTerm);

    if (normalizedTerm.length < 2) {
      this.searchResults = [];
      this.isSearchOpen = false;
      this.selectedIndex = -1;
      return;
    }

    this.searchResults = this.movies
      .filter((movie) => {
        const title = this.normalizeText(movie.titulo);
        const director = this.normalizeText(movie.director);

        return title.includes(normalizedTerm) || director.includes(normalizedTerm);
      })
      .slice(0, 5);

    this.isSearchOpen = true;

    if (this.searchResults.length === 0 || this.selectedIndex >= this.searchResults.length) {
      this.selectedIndex = -1;
    }
  }

  private closeSearch(shouldClear = true): void {
    this.isSearchOpen = false;
    this.searchResults = [];
    this.selectedIndex = -1;

    if (shouldClear) {
      this.searchTerm = '';
    }
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
