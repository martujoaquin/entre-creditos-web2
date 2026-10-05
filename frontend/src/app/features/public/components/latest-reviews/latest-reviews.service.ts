import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { Review } from '../../../reviews/models/review.model';

interface LandingReviewApiAuthor {
  id_usuario: number;
  nombre_completo: string;
  avatar: string | null;
}

interface LandingReviewApiMovie {
  id_pelicula: number;
  titulo: string;
  director: string;
  anio: number;
  imagen: string | null;
}

interface LandingReviewApiItem {
  id_resena: number;
  frase_destacada: string | null;
  contenido: string;
  puntuacion: number;
  fecha_creacion: string;
  autor: LandingReviewApiAuthor;
  pelicula: LandingReviewApiMovie;
}

interface LandingReviewsResponse {
  success: boolean;
  resenas?: LandingReviewApiItem[];
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LatestReviewsService {
  private readonly apiUrl = environment.apiUrl;
  private readonly backendBaseUrl = this.apiUrl.replace(/\/index\.php$/, '');
  private readonly defaultAvatarPath = 'uploads/avatars/default-avatar.png';
  private readonly defaultPosterPath = 'uploads/peliculas/default-poster.png';

  constructor(private readonly http: HttpClient) {}

  getLandingReviews(): Observable<Review[]> {
    return this.http.get<LandingReviewsResponse>(`${this.apiUrl}?resource=resenas&scope=landing`).pipe(
      map((response) => {
        if (!response.success || !response.resenas) {
          throw new Error(response.message || 'No pudimos cargar las reseñas.');
        }

        return response.resenas.slice(0, 3).map((review) => this.toReview(review));
      }),
      catchError((error: unknown) => throwError(() => error)),
    );
  }

  private toReview(review: LandingReviewApiItem): Review {
    return {
      id: review.id_resena,
      movieId: review.pelicula.id_pelicula,
      rating: review.puntuacion,
      highlightedQuote: review.frase_destacada ?? '',
      excerpt: this.truncateText(review.contenido, 180),
      createdAt: this.toDateTime(review.fecha_creacion),
      author: {
        id: review.autor.id_usuario,
        name: review.autor.nombre_completo,
        avatarUrl: this.toAvatarAssetUrl(review.autor.avatar),
      },
      movie: {
        id: review.pelicula.id_pelicula,
        title: review.pelicula.titulo,
        director: review.pelicula.director,
        year: review.pelicula.anio,
        imageUrl: this.toMovieAssetUrl(review.pelicula.imagen),
        defaultPosterUrl: this.toMovieAssetUrl(null),
        imageAlt: `Póster de ${review.pelicula.titulo}`,
      },
    };
  }

  private toAvatarAssetUrl(path: string | null): string | null {
    const avatarPath = path?.trim();

    if (!avatarPath || avatarPath === this.defaultAvatarPath) {
      return null;
    }

    return this.toBackendAssetUrl(avatarPath);
  }

  private toMovieAssetUrl(path: string | null): string {
    return this.toBackendAssetUrl(path?.trim() || this.defaultPosterPath);
  }

  private toBackendAssetUrl(path: string): string {
    if (/^https?:\/\//.test(path)) {
      return path;
    }

    return `${this.backendBaseUrl}/${path.replace(/^\/+/, '')}`;
  }

  private truncateText(text: string, maxLength: number): string {
    const normalizedText = text.trim();

    if (normalizedText.length <= maxLength) {
      return normalizedText;
    }

    return `${normalizedText.slice(0, maxLength).trim()}...`;
  }

  private toDateTime(value: string): string {
    return value.includes(' ') ? value.replace(' ', 'T') : value;
  }
}
