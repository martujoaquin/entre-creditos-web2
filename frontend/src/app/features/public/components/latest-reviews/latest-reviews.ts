import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReviewCard } from '../../../reviews/components/review-card/review-card';
import { Review } from '../../../reviews/models/review.model';
import { LatestReviewsService } from './latest-reviews.service';

@Component({
  selector: 'app-latest-reviews',
  standalone: true,
  imports: [RouterLink, ReviewCard],
  templateUrl: './latest-reviews.html',
  styleUrl: './latest-reviews.css',
})
export class LatestReviews implements OnInit {
  protected reviews: Review[] = [];
  protected isLoading = true;
  protected hasError = false;

  constructor(private readonly latestReviewsService: LatestReviewsService) {}

  ngOnInit(): void {
    this.latestReviewsService.getLandingReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.hasError = false;
        this.isLoading = false;
      },
      error: () => {
        this.reviews = [];
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }
}
