import { Component, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

import { Movie } from '../../../../core/models/movie.models';
import { AuthService } from '../../../../core/services/auth.service';
import { MovieService } from '../../../../core/services/movie.service';
import { ReviewCard } from '../../../reviews/components/review-card/review-card';
import { Review, ShareUser } from '../../../reviews/models/review.model';
import { ReviewService } from '../../../reviews/services/review.service';

@Component({
  selector: 'app-pelicula-detalle',
  standalone: true,
  imports: [RouterLink, ReviewCard],
  templateUrl: './pelicula-detalle.html',
  styleUrl: './pelicula-detalle.css',
})
export class PeliculaDetalle implements OnDestroy {
  movie: Movie | null = null;
  isLoading = true;
  isLoadingReviews = false;
  errorMessage = '';
  reviewsError = '';
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
  shareSuccess = '';
  shareNotification = '';
  private shareNotificationTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly destroy$ = new Subject<void>();
  protected reviews: Review[] = [];

  protected get ownReview(): Review | undefined {
    const currentUser = this.authService.currentUser();

    return currentUser
      ? this.reviews.find((review) => review.author.id === currentUser.id_usuario)
      : undefined;
  }

  protected get otherReviews(): Review[] {
    const currentUser = this.authService.currentUser();

    return currentUser
      ? this.reviews.filter((review) => review.author.id !== currentUser.id_usuario)
      : this.reviews;
  }

  protected get leftColumnReviews(): Review[] {
    return this.otherReviews.filter((_, index) => index % 2 === 0);
  }

  protected get rightColumnReviews(): Review[] {
    return this.otherReviews.filter((_, index) => index % 2 !== 0);
  }

  protected get hasOwnReview(): boolean {
    return this.ownReview !== undefined;
  }

  protected get filteredShareUsers(): ShareUser[] {
    const searchTerm = this.normalizeShareSearchTerm(this.shareSearchTerm);

    if (!searchTerm) {
      return this.shareUsers;
    }

    return this.shareUsers.filter((user) =>
      this.normalizeShareSearchTerm(user.name).includes(searchTerm),
    );
  }

  protected get selectedShareUsersCount(): number {
    return this.selectedShareUserIds.length;
  }

  protected get shareSelectionText(): string {
    const count = this.selectedShareUsersCount;

    return count === 1 ? '1 miembro seleccionado' : `${count} miembros seleccionados`;
  }

  protected get canConfirmShare(): boolean {
    return (
      this.selectedShareUserIds.length > 0 &&
      !this.isLoadingShareUsers &&
      !this.isSharingReview
    );
  }

  protected onEditReview(reviewId: number): void {
    this.router.navigate(['/club/resenas/editar', reviewId]);
  }

  protected onDeleteReview(reviewId: number): void {
    this.reviewIdToDelete = reviewId;
    this.deleteReviewError = '';
    this.isDeleteModalOpen = true;
  }

  protected onShareReview(reviewId: number): void {
    this.reviewIdToShare = reviewId;
    this.isShareModalOpen = true;
    this.selectedShareUserIds = [];
    this.shareSearchTerm = '';
    this.shareError = '';
    this.shareSuccess = '';

    if (this.shareUsers.length === 0) {
      this.loadShareUsers();
    }
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

  protected onDeleteModalBackdropClick(): void {
    if (!this.isDeletingReview) {
      this.closeDeleteModal();
    }
  }

  protected closeDeleteModal(): void {
    if (this.isDeletingReview) {
      return;
    }

    this.reviewIdToDelete = null;
    this.isDeleteModalOpen = false;
    this.deleteReviewError = '';
  }

  protected onShareModalBackdropClick(): void {
    if (!this.isSharingReview) {
      this.closeShareModal();
    }
  }

  protected closeShareModal(): void {
    if (this.isSharingReview) {
      return;
    }

    this.reviewIdToShare = null;
    this.isShareModalOpen = false;
    this.selectedShareUserIds = [];
    this.shareSearchTerm = '';
    this.shareError = '';
    this.shareSuccess = '';
  }

  protected onShareSearchInput(event: Event): void {
    this.shareSearchTerm = (event.target as HTMLInputElement).value;
  }

  protected toggleShareUser(userId: number): void {
    if (this.isSharingReview) {
      return;
    }

    if (this.isShareUserSelected(userId)) {
      this.selectedShareUserIds = this.selectedShareUserIds.filter((id) => id !== userId);
      return;
    }

    this.selectedShareUserIds = [...this.selectedShareUserIds, userId];
  }

  protected isShareUserSelected(userId: number): boolean {
    return this.selectedShareUserIds.includes(userId);
  }

  protected onShareUserAvatarError(event: Event, user: ShareUser): void {
    const image = event.target as HTMLImageElement;
    image.style.display = 'none';

    const wrapper = image.closest<HTMLElement>('.share-modal__avatar');

    if (wrapper) {
      wrapper.dataset['showInitial'] = user.name.trim().charAt(0).toUpperCase();
    }
  }

  protected confirmShareReview(): void {
    if (!this.reviewIdToShare || !this.canConfirmShare) {
      return;
    }

    const reviewId = this.reviewIdToShare;
    const recipientIds = [...this.selectedShareUserIds];

    this.shareError = '';
    this.shareSuccess = '';
    this.isSharingReview = true;

    this.reviewService
      .shareReview(reviewId, recipientIds)
      .pipe(finalize(() => (this.isSharingReview = false)))
      .subscribe({
        next: (response) => {
          const message = this.getShareSuccessMessage(
            response.compartidos.length,
            response.ya_compartidos.length,
          );

          this.resetShareModalState();
          this.showShareNotification(message);
        },
        error: (message: string) => {
          this.shareError = message;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearShareNotificationTimeout();
  }

  protected confirmDeleteReview(): void {
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
          this.isDeleteModalOpen = false;
          this.reviewIdToDelete = null;
          this.deleteReviewError = '';

          if (this.movie) {
            this.loadReviews(this.movie.id_pelicula);
          }
        },
        error: (message: string) => {
          this.deleteReviewError = message;
        },
      });
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly movieService: MovieService,
    private readonly reviewService: ReviewService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loadDetail();
  }

  protected retryReviews(): void {
    if (!this.movie) {
      return;
    }

    this.loadReviews(this.movie.id_pelicula);
  }

  private loadDetail(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        distinctUntilChanged(),
        switchMap((id) => {
          if (!Number.isInteger(id) || id <= 0) {
            this.handleInvalidMovieId();
            return of(null);
          }

          this.resetMovieState();

          return forkJoin({
            movie: this.movieService.getMovieById(id),
            reviews: this.reviewService.getReviewsByMovie(id).pipe(
              catchError((message: string) => {
                console.error('Error al cargar reseñas', message);
                this.reviewsError = 'No pudimos cargar las reseñas en este momento.';

                return of([]);
              }),
            ),
          }).pipe(
            finalize(() => {
              this.isLoading = false;
              this.isLoadingReviews = false;
            }),
            catchError((message: string) => {
              console.error('Error al cargar el detalle de película', message);
              this.movie = null;
              this.reviews = [];
              this.errorMessage = message || 'No pudimos cargar la película. Intentá nuevamente.';

              return of(null);
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((detail) => {
        if (!detail) {
          return;
        }

        this.movie = detail.movie;
        this.reviews = detail.reviews;
      });
  }

  private resetMovieState(): void {
    this.movie = null;
    this.reviews = [];
    this.isLoading = true;
    this.isLoadingReviews = true;
    this.errorMessage = '';
    this.reviewsError = '';
    this.reviewIdToDelete = null;
    this.isDeleteModalOpen = false;
    this.isDeletingReview = false;
    this.deleteReviewError = '';
    this.reviewIdToShare = null;
    this.isShareModalOpen = false;
    this.isSharingReview = false;
    this.selectedShareUserIds = [];
    this.shareSearchTerm = '';
    this.shareError = '';
    this.shareSuccess = '';
    this.shareNotification = '';
    this.clearShareNotificationTimeout();
  }

  private handleInvalidMovieId(): void {
    this.resetMovieState();
    this.isLoading = false;
    this.isLoadingReviews = false;
    this.errorMessage = 'La película no está disponible.';
  }

  private loadReviews(movieId: number): void {
    this.isLoadingReviews = true;
    this.reviewsError = '';

    this.reviewService
      .getReviewsByMovie(movieId)
      .pipe(finalize(() => (this.isLoadingReviews = false)))
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
        },
        error: (message: string) => {
          console.error('Error al cargar reseñas', message);
          this.reviews = [];
          this.reviewsError = 'No pudimos cargar las reseñas en este momento.';
        },
      });
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

  private getShareSuccessMessage(sharedCount: number, alreadySharedCount: number): string {
    if (sharedCount > 0 && alreadySharedCount > 0) {
      return 'La reseña se compartió con algunos miembros. Con otros ya estaba compartida.';
    }

    if (sharedCount === 0 && alreadySharedCount > 0) {
      return 'Ya habías compartido esta reseña con los miembros seleccionados.';
    }

    return 'Reseña compartida correctamente.';
  }

  private normalizeShareSearchTerm(value: string): string {
    return value.trim().toLowerCase();
  }

  private resetShareModalState(): void {
    this.reviewIdToShare = null;
    this.isShareModalOpen = false;
    this.selectedShareUserIds = [];
    this.shareSearchTerm = '';
    this.shareError = '';
    this.shareSuccess = '';
    this.isSharingReview = false;
  }

  private showShareNotification(message: string): void {
    this.clearShareNotificationTimeout();
    this.shareNotification = message;
    this.shareNotificationTimeout = setTimeout(() => {
      this.shareNotification = '';
      this.shareNotificationTimeout = null;
    }, 3000);
  }

  private clearShareNotificationTimeout(): void {
    if (this.shareNotificationTimeout) {
      clearTimeout(this.shareNotificationTimeout);
      this.shareNotificationTimeout = null;
    }
  }

  @HostListener('document:keydown.escape')
  protected onDocumentEscape(): void {
    if (this.isShareModalOpen) {
      this.closeShareModal();
    }

    if (this.isDeleteModalOpen) {
      this.closeDeleteModal();
    }
  }
}
