import { Component } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { Genre } from '../../../../core/models/genre.models';
import { Movie } from '../../../../core/models/movie.models';
import { GenreService } from '../../../../core/services/genre.service';
import { MovieService } from '../../../../core/services/movie.service';
import { MovieCard } from '../../components/movie-card/movie-card';

@Component({
  selector: 'app-peliculas',
  standalone: true,
  imports: [MovieCard],
  templateUrl: './peliculas.html',
  styleUrl: './peliculas.css',
})
export class Peliculas {
  genres: Genre[] = [];
  selectedGenreId: number | null = null;
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  isLoading = true;
  errorMessage = '';
  genresError = '';

  constructor(
    private readonly movieService: MovieService,
    private readonly genreService: GenreService,
  ) {
    this.loadMovies();
  }

  loadMovies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.genresError = '';
    this.selectedGenreId = null;

    forkJoin({
      movies: this.movieService.getMovies(),
      genres: this.genreService.getGenres().pipe(
        catchError((message: string) => {
          console.error('Error al cargar géneros', message);
          this.genresError = message || 'No pudimos cargar los géneros.';

          return of([]);
        }),
      ),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ movies, genres }) => {
          this.movies = movies;
          this.genres = genres;
          this.applyFilter();
        },
        error: (message: string) => {
          console.error('Error al cargar películas', message);
          this.movies = [];
          this.filteredMovies = [];
          this.genres = [];
          this.errorMessage = 'No pudimos cargar las películas.';
        },
      });
  }

  selectGenre(genreId: number | null): void {
    this.selectedGenreId = genreId;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.selectedGenreId === null) {
      this.filteredMovies = this.movies;
      return;
    }

    this.filteredMovies = this.movies.filter((movie) => movie.id_genero === this.selectedGenreId);
  }
}
