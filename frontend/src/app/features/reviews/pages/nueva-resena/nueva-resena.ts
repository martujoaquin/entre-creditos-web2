import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, map, switchMap, take } from 'rxjs';

import { Movie } from '../../../../core/models/movie.models';
import { MovieService } from '../../../../core/services/movie.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-nueva-resena',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './nueva-resena.html',
  styleUrl: './nueva-resena.css',
})
export class NuevaResena {
  readonly reviewForm;
  readonly ratingOptions = [1, 2, 3, 4, 5];

  movie: Movie | null = null;
  movieId = 0;
  reviewId = 0;
  isEditMode = false;
  isLoadingMovie = true;
  isLoadingReview = false;
  isSubmitting = false;
  loadError = '';
  submitError = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly movieService: MovieService,
    private readonly reviewService: ReviewService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
  ) {
    this.reviewForm = this.formBuilder.nonNullable.group({
      puntuacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      frase_destacada: ['', [Validators.maxLength(220)]],
      contenido: ['', [Validators.required, trimRequiredValidator()]],
    });

    this.loadPage();
  }

  get highlightedQuoteLength(): number {
    return this.reviewForm.controls.frase_destacada.value.length;
  }

  get pageEyebrow(): string {
    return this.isEditMode ? 'Editando tu reseña de' : 'Escribiendo una reseña de';
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? 'Guardando...' : 'Publicando...';
    }

    return this.isEditMode ? 'Guardar cambios' : 'Publicar reseña';
  }

  get movieDetailRoute(): string[] {
    return ['/club/peliculas', String(this.movieId)];
  }

  protected onPosterError(event: Event): void {
    if (!this.movie) {
      return;
    }

    const image = event.target as HTMLImageElement;

    if (image.src === this.movie.defaultPosterUrl) {
      image.style.visibility = 'hidden';
      return;
    }

    image.src = this.movie.defaultPosterUrl;
  }

  protected onSubmit(): void {
    this.submitError = '';

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting || this.movieId <= 0 || (this.isEditMode && this.reviewId <= 0)) {
      return;
    }

    const formValue = this.reviewForm.getRawValue();
    const highlightedQuote = formValue.frase_destacada.trim();
    const content = formValue.contenido.trim();

    this.isSubmitting = true;
    this.reviewForm.disable();

    const request = {
      frase_destacada: highlightedQuote === '' ? null : highlightedQuote,
      contenido: content,
      puntuacion: Number(formValue.puntuacion),
    };

    const submitRequest = this.isEditMode
      ? this.reviewService.updateReview(this.reviewId, request)
      : this.reviewService.createReview(this.movieId, request);

    submitRequest
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.reviewForm.enable();
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(this.movieDetailRoute);
        },
        error: (message: string) => {
          this.submitError = message;
        },
      });
  }

  private loadPage(): void {
    const idResena = Number(this.route.snapshot.paramMap.get('idResena'));

    if (Number.isInteger(idResena) && idResena > 0) {
      this.isEditMode = true;
      this.reviewId = idResena;
      this.loadReview();
      return;
    }

    this.loadMovieFromRoute();
  }

  private loadReview(): void {
    this.isLoadingReview = true;
    this.isLoadingMovie = false;
    this.loadError = '';

    this.reviewService
      .getReviewById(this.reviewId)
      .pipe(
        switchMap((review) => {
          if (!review.movieId) {
            throw new Error('No pudimos cargar esta reseña.');
          }

          this.movieId = review.movieId;
          this.reviewForm.patchValue({
            puntuacion: review.rating,
            frase_destacada: review.highlightedQuote,
            contenido: review.excerpt,
          });
          this.isLoadingReview = false;
          this.isLoadingMovie = true;

          return this.movieService.getMovieById(review.movieId);
        }),
        finalize(() => {
          this.isLoadingReview = false;
          this.isLoadingMovie = false;
        }),
      )
      .subscribe({
        next: (movie) => {
          this.movie = movie;
        },
        error: (message: string) => {
          this.movie = null;
          this.loadError = message || 'No pudimos cargar esta reseña.';
        },
      });
  }

  private loadMovieFromRoute(): void {
    this.isLoadingMovie = true;
    this.isLoadingReview = false;
    this.loadError = '';

    this.route.paramMap
      .pipe(
        take(1),
        map((params) => Number(params.get('idPelicula'))),
        switchMap((id) => {
          this.movieId = id;

          return this.movieService.getMovieById(id);
        }),
        finalize(() => (this.isLoadingMovie = false)),
      )
      .subscribe({
        next: (movie) => {
          this.movie = movie;
        },
        error: () => {
          this.movie = null;
          this.loadError = 'No pudimos cargar esta película.';
        },
      });
  }
}

function trimRequiredValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    return control.value.trim() === '' ? { trimRequired: true } : null;
  };
}
