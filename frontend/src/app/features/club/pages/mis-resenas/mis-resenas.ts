import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';

import { Movie } from '../../../../core/models/movie.models';
import { SessionUser } from '../../../../core/models/auth.models';
import { AuthService } from '../../../../core/services/auth.service';
import { MovieService } from '../../../../core/services/movie.service';
import { ReviewCard } from '../../../reviews/components/review-card/review-card';
import { Review, ShareUser } from '../../../reviews/models/review.model';
import { ReviewService } from '../../../reviews/services/review.service';

@Component({
  selector: 'app-mis-resenas',
  standalone: true,
  imports: [RouterLink, ReviewCard],
  templateUrl: './mis-resenas.html',
  styleUrl: './mis-resenas.css',
})
export class MisResenas {
  reviews: Review[] = [];
  isLoading = true;
  loadError = '';
  reviewIdToDelete: number | null = null;
  isDeleteModalOpen = false;
  isDeletingReview = false;
  deleteReviewError = '';
  reviewIdToShare: number | null = null;
  isShareModalOpen = false;
  isLoadingShareUsers = false;
  isSharingReview = false;
  shareUsers: ShareUser[] = [];
  selectedShareUserIds: number[] = [];
  shareSearchTerm = '';
  shareError = '';
  shareNotification = '';

  protected get filteredShareUsers(): ShareUser[] {
    const searchTerm = this.shareSearchTerm.trim().toLowerCase();

    if (!searchTerm) {
      return this.shareUsers;
    }

    return this.shareUsers.filter((user) => user.name.toLowerCase().includes(searchTerm));
  }

  protected get canConfirmShare(): boolean {
    return (
      this.selectedShareUserIds.length > 0 &&
      !this.isLoadingShareUsers &&
      !this.isSharingReview
    );
  }

  constructor(
    private readonly authService: AuthService,
    private readonly movieService: MovieService,
    private readonly reviewService: ReviewService,
    private readonly router: Router,
  ) {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.loadError = '';

    this.getCurrentUser()
      .pipe(
        switchMap((user) =>
          this.movieService.getMovies().pipe(
            switchMap((movies) => this.getReviewsForMovies(movies, user.id_usuario)),
          ),
        ),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
        },
        error: (message: string) => {
          console.error('Error al cargar mis reseñas', message);
          this.reviews = [];
          this.loadError = 'No pudimos cargar tus reseñas.';
        },
      });
  }

  onEditReview(reviewId: number): void {
    this.router.navigate(['/club/resenas/editar', reviewId]);
  }

  onDeleteReview(reviewId: number): void {
    this.reviewIdToDelete = reviewId;
    this.deleteReviewError = '';
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.isDeletingReview) {
      return;
    }

    this.reviewIdToDelete = null;
    this.isDeleteModalOpen = false;
    this.deleteReviewError = '';
  }

  confirmDeleteReview(): void {
    if (!this.reviewIdToDelete || this.isDeletingReview) {
      return;
    }

    const reviewId = this.reviewIdToDelete;
    this.isDeletingReview = true;
    this.deleteReviewError = '';

    this.reviewService
      .deleteReview(reviewId)
      .pipe(finalize(() => (this.isDeletingReview = false)))
      .subscribe({
        next: () => {
          this.reviews = this.reviews.filter((review) => review.id !== reviewId);
          this.closeDeleteModal();
        },
        error: (message: string) => {
          this.deleteReviewError = message;
        },
      });
  }

  onShareReview(reviewId: number): void {
    this.reviewIdToShare = reviewId;
    this.isShareModalOpen = true;
    this.selectedShareUserIds = [];
    this.shareSearchTerm = '';
    this.shareError = '';

    if (this.shareUsers.length === 0) {
      this.loadShareUsers();
    }
  }

  onMovieSelected(movieId: number): void {
    this.router.navigate(['/club/peliculas', movieId]);
  }

  closeShareModal(): void {
    if (this.isSharingReview) {
      return;
    }

    this.reviewIdToShare = null;
    this.isShareModalOpen = false;
    this.selectedShareUserIds = [];
    this.shareSearchTerm = '';
    this.shareError = '';
  }

  onShareSearchInput(event: Event): void {
    this.shareSearchTerm = (event.target as HTMLInputElement).value;
  }

  toggleShareUser(userId: number): void {
    if (this.selectedShareUserIds.includes(userId)) {
      this.selectedShareUserIds = this.selectedShareUserIds.filter((id) => id !== userId);
      return;
    }

    this.selectedShareUserIds = [...this.selectedShareUserIds, userId];
  }

  isShareUserSelected(userId: number): boolean {
    return this.selectedShareUserIds.includes(userId);
  }

  confirmShareReview(): void {
    if (!this.reviewIdToShare || !this.canConfirmShare) {
      return;
    }

    const reviewId = this.reviewIdToShare;
    this.isSharingReview = true;
    this.shareError = '';

    this.reviewService
      .shareReview(reviewId, this.selectedShareUserIds)
      .pipe(finalize(() => (this.isSharingReview = false)))
      .subscribe({
        next: () => {
          this.shareNotification = 'Reseña compartida correctamente.';
          this.closeShareModal();
        },
        error: (message: string) => {
          this.shareError = message;
        },
      });
  }

  onShareUserAvatarError(event: Event, user: ShareUser): void {
    const image = event.target as HTMLImageElement;
    image.style.display = 'none';

    const avatar = image.closest<HTMLElement>('.share-modal__avatar');

    if (avatar) {
      avatar.dataset['showInitial'] = user.name.trim().charAt(0).toUpperCase();
    }
  }

  private getCurrentUser() {
    const currentUser = this.authService.currentUser();

    return currentUser ? of(currentUser) : this.authService.me();
  }

  private getReviewsForMovies(movies: Movie[], userId: number) {
    if (movies.length === 0) {
      return of([]);
    }

    return forkJoin(
      movies.map((movie) =>
        this.reviewService.getReviewsByMovie(movie.id_pelicula).pipe(
          map((reviews) =>
            reviews
              .filter((review) => review.author.id === userId)
              .map((review) => this.withMovie(review, movie)),
          ),
          catchError(() => of([])),
        ),
      ),
    ).pipe(
      map((reviewGroups) =>
        reviewGroups
          .flat()
          .sort((first, second) => this.toTime(second.createdAt) - this.toTime(first.createdAt)),
      ),
    );
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

  private loadShareUsers(): void {
    this.isLoadingShareUsers = true;
    this.shareError = '';

    this.reviewService
      .getUsersForSharing()
      .pipe(finalize(() => (this.isLoadingShareUsers = false)))
      .subscribe({
        next: (users) => {
          this.shareUsers = users;
        },
        error: (message: string) => {
          this.shareUsers = [];
          this.shareError = message;
        },
      });
  }

  private toTime(value?: string): number {
    return value ? new Date(value).getTime() : 0;
  }
}
