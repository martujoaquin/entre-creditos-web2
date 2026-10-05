import { Component } from '@angular/core';
import { finalize } from 'rxjs';

import { AdminReview } from '../../../../core/models/admin-review.models';
import { AdminReviewService } from '../../../../core/services/admin-review.service';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [],
  templateUrl: './resenas.html',
  styleUrl: './resenas.css',
})
export class Resenas {
  reviews: AdminReview[] = [];
  selectedReview: AdminReview | null = null;
  reviewToDelete: AdminReview | null = null;
  avatarFailures = new Set<number>();
  posterFailures = new Set<number>();
  isLoading = true;
  isDetailModalOpen = false;
  isDeleteModalOpen = false;
  isDeleting = false;
  loadError = '';
  deleteError = '';
  feedbackMessage = '';
  private feedbackMessageTimeout: number | undefined;

  constructor(private readonly adminReviewService: AdminReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.loadError = '';

    this.adminReviewService
      .getReviews()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
        },
        error: (message: string) => {
          this.reviews = [];
          this.loadError = message || 'No pudimos cargar las reseñas.';
        },
      });
  }

  openDetailModal(review: AdminReview): void {
    this.selectedReview = review;
    this.feedbackMessage = '';
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.selectedReview = null;
    this.isDetailModalOpen = false;
  }

  openDeleteModal(review: AdminReview): void {
    this.reviewToDelete = review;
    this.deleteError = '';
    this.feedbackMessage = '';
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.isDeleting) {
      return;
    }

    this.reviewToDelete = null;
    this.deleteError = '';
    this.isDeleteModalOpen = false;
  }

  confirmDelete(): void {
    if (!this.reviewToDelete) {
      return;
    }

    const reviewId = this.reviewToDelete.id_resena;
    this.isDeleting = true;
    this.deleteError = '';

    this.adminReviewService
      .deleteReview(reviewId)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.reviews = this.reviews.filter((review) => review.id_resena !== reviewId);
          this.closeDeleteModal();
          this.showSuccessMessage('Reseña eliminada.');
        },
        error: (message: string) => {
          this.deleteError = message || 'No pudimos eliminar la reseña.';
        },
      });
  }

  getPosterUrl(review: AdminReview): string {
    return this.posterFailures.has(review.id_resena) ? review.defaultPosterUrl : review.moviePosterUrl;
  }

  getAvatarUrl(review: AdminReview): string {
    return this.avatarFailures.has(review.id_resena) ? review.defaultAvatarUrl : review.authorAvatarUrl;
  }

  onPosterError(review: AdminReview): void {
    this.posterFailures.add(review.id_resena);
  }

  onAvatarError(review: AdminReview): void {
    this.avatarFailures.add(review.id_resena);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-AR').format(new Date(value.replace(' ', 'T')));
  }

  reviewExcerpt(review: AdminReview): string {
    const text = review.contenido.replace(/\s+/gu, ' ').trim();

    return text.length > 150 ? `${text.slice(0, 150).trim()}...` : text;
  }

  truncateText(text: string | null | undefined, maxLength: number): string {
    if (!text) {
      return '';
    }

    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
  }

  ngOnDestroy(): void {
    this.clearSuccessMessageTimeout();
  }

  private showSuccessMessage(message: string): void {
    this.feedbackMessage = message;
    this.clearSuccessMessageTimeout();
    this.feedbackMessageTimeout = window.setTimeout(() => {
      this.feedbackMessage = '';
    }, 5000);
  }

  private clearSuccessMessageTimeout(): void {
    if (this.feedbackMessageTimeout !== undefined) {
      window.clearTimeout(this.feedbackMessageTimeout);
      this.feedbackMessageTimeout = undefined;
    }
  }
}
