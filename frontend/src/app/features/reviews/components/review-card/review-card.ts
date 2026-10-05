import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { Review } from '../../models/review.model';

export type ReviewCardVariant = 'general' | 'movie-detail' | 'home' | 'my-reviews';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
})
export class ReviewCard implements AfterViewInit {
  @ViewChild('excerptElement') private readonly excerptElement?: ElementRef<HTMLElement>;

  @Input({ required: true }) review!: Review;
  @Input() variant: ReviewCardVariant = 'general';
  @Input() isOwnReview = false;
  @Input() allowGeneralExpansion = false;

  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() share = new EventEmitter<number>();
  @Output() movieSelected = new EventEmitter<number>();

  isExpanded = false;
  canExpand = false;
  avatarLoadFailed = false;
  movieImageLoadFailed = false;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.measureExcerptOverflow();
  }

  get authorInitial(): string {
    return this.review.author.name.trim().charAt(0).toUpperCase();
  }

  get avatarUrl(): string | null {
    return this.avatarLoadFailed ? null : this.review.author.avatarUrl ?? null;
  }

  get movieImageUrl(): string | null {
    if (this.movieImageLoadFailed || !this.review.movie) {
      return null;
    }

    return this.review.movie.imageUrl;
  }

  get isMovieDetail(): boolean {
    return this.variant === 'movie-detail';
  }

  get isHome(): boolean {
    return this.variant === 'home';
  }

  get isMyReviews(): boolean {
    return this.variant === 'my-reviews';
  }

  get showActions(): boolean {
    return this.isMovieDetail || this.isMyReviews;
  }

  get showExpandControl(): boolean {
    return this.isMovieDetail || this.isMyReviews || this.allowGeneralExpansion;
  }

  get excerptId(): string {
    return `review-excerpt-${this.variant}-${this.review.id}`;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.isExpanded) {
      this.measureExcerptOverflow();
    }
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onEdit(): void {
    this.edit.emit(this.review.id);
  }

  onDelete(): void {
    this.delete.emit(this.review.id);
  }

  onShare(): void {
    this.share.emit(this.review.id);
  }

  onMovieSelected(): void {
    if (this.review.movie) {
      this.movieSelected.emit(this.review.movie.id);
    }
  }

  onAvatarError(): void {
    this.avatarLoadFailed = true;
  }

  onMovieImageError(): void {
    if (!this.review.movie || this.review.movie.imageUrl === this.review.movie.defaultPosterUrl) {
      this.movieImageLoadFailed = true;
      return;
    }

    this.review.movie.imageUrl = this.review.movie.defaultPosterUrl ?? this.review.movie.imageUrl;
  }

  private measureExcerptOverflow(): void {
    if (!this.showExpandControl || !this.excerptElement) {
      return;
    }

    requestAnimationFrame(() => {
      const element = this.excerptElement?.nativeElement;

      if (!element || this.isExpanded) {
        return;
      }

      const isOverflowing = element.scrollHeight > element.clientHeight + 1;

      if (this.canExpand !== isOverflowing) {
        this.canExpand = isOverflowing;
        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
