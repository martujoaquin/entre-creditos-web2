import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';

import { Movie } from '../../../../core/models/movie.models';
import { MovieService } from '../../../../core/services/movie.service';
import { MovieCard } from '../../components/movie-card/movie-card';
import { ReviewCard } from '../../../reviews/components/review-card/review-card';
import { Review } from '../../../reviews/models/review.model';
import { ReviewService } from '../../../reviews/services/review.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MovieCard, ReviewCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  latestReviews: Review[] = [];
  featuredMovies: Movie[] = [];
  isMoviesLoading = true;
  isReviewsLoading = true;
  moviesError = '';
  reviewsError = '';

  constructor(
    private readonly movieService: MovieService,
    private readonly reviewService: ReviewService,
    private readonly router: Router,
  ) {
    this.loadHome();
  }

  loadHome(): void {
    this.isMoviesLoading = true;
    this.isReviewsLoading = true;
    this.moviesError = '';
    this.reviewsError = '';

    this.movieService
      .getMovies()
      .pipe(finalize(() => (this.isMoviesLoading = false)))
      .subscribe({
        next: (movies) => {
          this.featuredMovies = movies.slice(0, 5);
          this.loadLatestReviews(movies);
        },
        error: (message: string) => {
          console.error('Error al cargar películas para la home', message);
          this.featuredMovies = [];
          this.latestReviews = [];
          this.moviesError = message || 'No pudimos cargar las películas.';
          this.reviewsError = 'No pudimos cargar las últimas reseñas.';
          this.isReviewsLoading = false;
        },
      });
  }

  onMovieSelected(movieId: number): void {
    this.router.navigate(['/club/peliculas', movieId]);
  }

  private loadLatestReviews(movies: Movie[]): void {
    if (movies.length === 0) {
      this.latestReviews = [];
      this.isReviewsLoading = false;
      return;
    }

    forkJoin(
      movies.map((movie) =>
        this.reviewService.getReviewsByMovie(movie.id_pelicula).pipe(
          map((reviews) => reviews.map((review) => this.withMovie(review, movie))),
          catchError(() => of([])),
        ),
      ),
    )
      .pipe(finalize(() => (this.isReviewsLoading = false)))
      .subscribe({
        next: (reviewGroups) => {
          this.latestReviews = this.sortReviewsByDate(reviewGroups.flat()).slice(0, 3);
        },
        error: () => {
          console.error('Error al cargar reseñas para la home');
          this.latestReviews = [];
          this.reviewsError = 'No pudimos cargar las últimas reseñas.';
        },
      });
  }

  private withMovie(review: Review, movie: Movie): Review {
    return {
      ...review,
      movie: {
        id: movie.id_pelicula,
        title: movie.titulo,
        director: movie.director,
        year: movie.anio,
        imageUrl: movie.imageUrl,
        defaultPosterUrl: movie.defaultPosterUrl,
        imageAlt: `Póster de ${movie.titulo}`,
      },
    };
  }

  private sortReviewsByDate(reviews: Review[]): Review[] {
    return [...reviews].sort(
      (first, second) => this.toTime(second.createdAt) - this.toTime(first.createdAt),
    );
  }

  private toTime(value?: string): number {
    return value ? new Date(value).getTime() : 0;
  }
}
