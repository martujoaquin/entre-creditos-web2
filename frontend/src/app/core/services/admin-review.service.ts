import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AdminReview,
  AdminReviewApiItem,
  AdminReviewDeleteResponse,
  AdminReviewsResponse,
} from '../models/admin-review.models';

@Injectable({
  providedIn: 'root',
})
export class AdminReviewService {
  private readonly apiUrl = environment.apiUrl;
  private readonly backendBaseUrl = this.apiUrl.replace(/\/index\.php$/, '');
  private readonly defaultAvatarPath = 'uploads/avatars/default-avatar.png';
  private readonly defaultPosterPath = 'uploads/peliculas/default-poster.png';

  constructor(private readonly http: HttpClient) {}

  getReviews(): Observable<AdminReview[]> {
    return this.http
      .get<AdminReviewsResponse>(`${this.apiUrl}?resource=resenas&scope=admin`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.resenas) {
            throw new Error(response.message || 'No pudimos cargar las reseñas.');
          }

          return response.resenas.map((review) => this.toAdminReview(review));
        }),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  deleteReview(reviewId: number): Observable<AdminReviewDeleteResponse> {
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return throwError(() => new Error('La reseña no está disponible.'));
    }

    return this.http
      .delete<AdminReviewDeleteResponse>(`${this.apiUrl}?resource=resenas&id_resena=${reviewId}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'No pudimos eliminar la reseña.');
          }

          return response;
        }),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  private toAdminReview(review: AdminReviewApiItem): AdminReview {
    return {
      ...review,
      puntuacion: Number(review.puntuacion),
      pelicula: {
        ...review.pelicula,
        activo: Number(review.pelicula.activo),
      },
      authorAvatarUrl: this.toBackendAssetUrl(review.autor.avatar, this.defaultAvatarPath),
      defaultAvatarUrl: this.toBackendAssetUrl(null, this.defaultAvatarPath),
      moviePosterUrl: this.toBackendAssetUrl(review.pelicula.imagen, this.defaultPosterPath),
      defaultPosterUrl: this.toBackendAssetUrl(null, this.defaultPosterPath),
    };
  }

  private toBackendAssetUrl(path: string | null, defaultPath: string): string {
    const assetPath = path?.trim() || defaultPath;

    if (/^https?:\/\//.test(assetPath)) {
      return assetPath;
    }

    return `${this.backendBaseUrl}/${assetPath.replace(/^\/+/, '')}`;
  }

  private toUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;

      if (typeof backendMessage === 'string' && backendMessage.trim() !== '') {
        return backendMessage;
      }

      return 'No pudimos conectar con el servidor. Intentá nuevamente.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos conectar con el servidor. Intentá nuevamente.';
  }
}
