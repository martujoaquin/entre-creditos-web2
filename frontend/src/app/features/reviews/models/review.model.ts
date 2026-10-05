export interface Review {
  id: number;
  movieId?: number;
  rating: number;
  highlightedQuote: string;
  excerpt: string;
  createdAt?: string;
  author: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  movie?: {
    id: number;
    title: string;
    director: string;
    year: number;
    imageUrl: string;
    defaultPosterUrl?: string;
    imageAlt: string;
  };
}

export interface ShareUser {
  id: number;
  name: string;
  avatarUrl: string;
}

export interface SharedReview {
  shareId: number;
  sharedAt: string;
  sender: {
    id: number;
    name: string;
    avatarUrl: string;
  };
  review: Review;
}
