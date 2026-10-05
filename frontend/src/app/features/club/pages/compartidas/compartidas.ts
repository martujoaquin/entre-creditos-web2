import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ReviewCard } from '../../../reviews/components/review-card/review-card';
import { SharedReview } from '../../../reviews/models/review.model';
import { ReviewService } from '../../../reviews/services/review.service';

@Component({
  selector: 'app-compartidas',
  standalone: true,
  imports: [RouterLink, ReviewCard],
  templateUrl: './compartidas.html',
  styleUrl: './compartidas.css',
})
export class Compartidas {
  isLoading = false;
  sharedReviews: SharedReview[] = [];
  loadError = '';

  constructor(
    private readonly reviewService: ReviewService,
    private readonly router: Router,
  ) {
    this.loadSharedReviews();
  }

  loadSharedReviews(): void {
    this.isLoading = true;
    this.loadError = '';

    this.reviewService
      .getSharedWithMe()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (sharedReviews) => {
          this.sharedReviews = sharedReviews;
        },
        error: () => {
          this.sharedReviews = [];
          this.loadError = 'No pudimos cargar las reseñas compartidas.';
        },
      });
  }

  onMovieSelected(movieId: number): void {
    this.router.navigate(['/club/peliculas', movieId]);
  }

  formatSharedDate(value: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }

  onSenderAvatarError(event: Event, sharedReview: SharedReview): void {
    const image = event.target as HTMLImageElement;
    image.style.display = 'none';

    const avatar = image.closest<HTMLElement>('.shared-review__avatar');

    if (avatar) {
      avatar.dataset['showInitial'] = sharedReview.sender.name.trim().charAt(0).toUpperCase();
    }
  }
}
