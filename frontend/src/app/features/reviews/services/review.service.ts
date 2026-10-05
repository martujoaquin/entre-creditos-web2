import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Review, SharedReview, ShareUser } from '../models/review.model';
import {
  CreateReviewRequest,
  CreateReviewResponse,
  DeleteReviewResponse,
  ReviewByIdResponse,
  ReviewApiItem,
  ReviewsByMovieResponse,
  SharedReviewApi,
  SharedReviewsResponse,
  ShareReviewResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
  UsuariosCompartirResponse,
} from '../models/review-api.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly apiUrl = environment.apiUrl;
  private readonly backendBaseUrl = this.apiUrl.replace(/\/index\.php$/, '');
  private readonly defaultAvatarPath = 'uploads/avatars/default-avatar.png';
  private readonly defaultPosterPath = 'uploads/peliculas/default-poster.png';

  constructor(private readonly http: HttpClient) {}

  getReviewsByMovie(movieId: number): Observable<Review[]> {
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return throwError(() => new Error('La película es obligatoria.'));
    }

    return this.http
      .get<ReviewsByMovieResponse>(`${this.apiUrl}?resource=resenas&id_pelicula=${movieId}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.resenas) {
            throw new Error(response.message || 'No pudimos cargar las reseñas.');
          }

          return response.resenas.map((review) => this.toReview(review));
        }),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  createReview(movieId: number, data: CreateReviewRequest): Observable<CreateReviewResponse> {
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return throwError(() => new Error('La película es obligatoria.'));
    }

    return this.http
      .post<CreateReviewResponse>(
        `${this.apiUrl}?resource=resenas`,
        {
          id_pelicula: movieId,
          ...data,
        },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'No pudimos publicar tu reseña.');
          }

          return response;
        }),
        catchError((error: unknown) => throwError(() => this.toCreateUserMessage(error))),
      );
  }

  getReviewById(reviewId: number): Observable<Review> {
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return throwError(() => new Error('La reseña no está disponible.'));
    }

    return this.http
      .get<ReviewByIdResponse>(`${this.apiUrl}?resource=resenas&id_resena=${reviewId}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.resena) {
            throw new Error(response.message || 'No pudimos cargar esta reseña.');
          }

          return this.toReview(response.resena);
        }),
        catchError((error: unknown) => throwError(() => this.toEditLoadUserMessage(error))),
      );
  }

  updateReview(reviewId: number, data: UpdateReviewRequest): Observable<UpdateReviewResponse> {
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return throwError(() => new Error('La reseña no está disponible.'));
    }

    return this.http
      .patch<UpdateReviewResponse>(
        `${this.apiUrl}?resource=resenas&id_resena=${reviewId}`,
        data,
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'No pudimos guardar los cambios.');
          }

          return response;
        }),
        catchError((error: unknown) => throwError(() => this.toUpdateUserMessage(error))),
      );
  }

  deleteReview(reviewId: number): Observable<DeleteReviewResponse> {
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return throwError(() => new Error('La reseña no está disponible.'));
    }

    return this.http
      .delete<DeleteReviewResponse>(`${this.apiUrl}?resource=resenas&id_resena=${reviewId}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'No pudimos eliminar la reseña.');
          }

          return response;
        }),
        catchError((error: unknown) => throwError(() => this.toDeleteUserMessage(error))),
      );
  }

  getUsersForSharing(): Observable<ShareUser[]> {
    return this.http
      .get<UsuariosCompartirResponse>(`${this.apiUrl}?resource=usuarios_compartir`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.usuarios) {
            throw new Error(response.message || 'No pudimos cargar los miembros.');
          }

          return response.usuarios.map((user) => ({
            id: user.id_usuario,
            name: user.nombre_completo,
            avatarUrl: this.toBackendAssetUrl(user.avatar),
          }));
        }),
        catchError((error: unknown) => throwError(() => this.toShareUsersMessage(error))),
      );
  }

  shareReview(reviewId: number, recipientIds: number[]): Observable<ShareReviewResponse> {
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return throwError(() => new Error('La reseña no está disponible.'));
    }

    const uniqueRecipientIds = Array.from(new Set(recipientIds));

    if (uniqueRecipientIds.length === 0) {
      return throwError(() => new Error('Seleccioná al menos un miembro.'));
    }

    return this.http
      .post<ShareReviewResponse>(
        `${this.apiUrl}?resource=resenas_compartidas`,
        {
          id_resena: reviewId,
          destinatarios: uniqueRecipientIds,
        },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'No pudimos compartir la reseña.');
          }

          return response;
        }),
        catchError((error: unknown) => throwError(() => this.toShareReviewMessage(error))),
      );
  }

  getSharedWithMe(): Observable<SharedReview[]> {
    return this.http
      .get<SharedReviewsResponse>(`${this.apiUrl}?resource=resenas_compartidas`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.compartidas) {
            throw new Error(response.message || 'No pudimos cargar las reseñas compartidas.');
          }

          return response.compartidas.map((sharedReview) => this.toSharedReview(sharedReview));
        }),
        catchError((error: unknown) => throwError(() => this.toSharedReviewsMessage(error))),
      );
  }

  private toReview(review: ReviewApiItem): Review {
    return {
      id: review.id_resena,
      movieId: review.id_pelicula,
      rating: review.puntuacion,
      highlightedQuote: review.frase_destacada ?? '',
      excerpt: review.contenido,
      createdAt: this.toDateTime(review.fecha_creacion),
      author: {
        id: review.autor.id_usuario,
        name: review.autor.nombre_completo,
        avatarUrl: this.toBackendAssetUrl(review.autor.avatar),
      },
    };
  }

  private toSharedReview(sharedReview: SharedReviewApi): SharedReview {
    return {
      shareId: sharedReview.id_compartida,
      sharedAt: this.toDateTime(sharedReview.fecha_compartida),
      sender: {
        id: sharedReview.remitente.id_usuario,
        name: sharedReview.remitente.nombre_completo,
        avatarUrl: this.toBackendAssetUrl(sharedReview.remitente.avatar),
      },
      review: {
        ...this.toReview(sharedReview.resena),
        movie: {
          id: sharedReview.resena.pelicula.id_pelicula,
          title: sharedReview.resena.pelicula.titulo,
          director: sharedReview.resena.pelicula.director,
          year: sharedReview.resena.pelicula.anio,
          imageUrl: this.toMovieAssetUrl(sharedReview.resena.pelicula.imagen),
          defaultPosterUrl: this.toMovieAssetUrl(null),
          imageAlt: `Póster de ${sharedReview.resena.pelicula.titulo}`,
        },
      },
    };
  }

  private toBackendAssetUrl(path: string | null): string {
    const avatarPath = path?.trim() || this.defaultAvatarPath;

    if (/^https?:\/\//.test(avatarPath)) {
      return avatarPath;
    }

    return `${this.backendBaseUrl}/${avatarPath.replace(/^\/+/, '')}`;
  }

  private toMovieAssetUrl(path: string | null): string {
    const posterPath = path?.trim() || this.defaultPosterPath;

    if (/^https?:\/\//.test(posterPath)) {
      return posterPath;
    }

    return `${this.backendBaseUrl}/${posterPath.replace(/^\/+/, '')}`;
  }

  private toDateTime(value: string): string {
    return value.includes(' ') ? value.replace(' ', 'T') : value;
  }

  private toUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return 'No pudimos cargar las reseñas en este momento.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos cargar las reseñas en este momento.';
  }

  private toCreateUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Revisá los datos de la reseña.';
      }

      if (error.status === 404) {
        return 'La película no está disponible.';
      }

      if (error.status === 409) {
        return 'Ya publicaste una reseña para esta película.';
      }

      return 'No pudimos publicar tu reseña. Intentá nuevamente.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos publicar tu reseña. Intentá nuevamente.';
  }

  private toEditLoadUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'No tenés permisos para editar esta reseña.';
      }

      if (error.status === 404) {
        return 'La reseña no está disponible.';
      }

      return 'No pudimos cargar esta reseña.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos cargar esta reseña.';
  }

  private toUpdateUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Revisá los datos de la reseña.';
      }

      if (error.status === 403) {
        return 'No tenés permisos para editar esta reseña.';
      }

      if (error.status === 404) {
        return 'La reseña no está disponible.';
      }

      return 'No pudimos guardar los cambios. Intentá nuevamente.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos guardar los cambios. Intentá nuevamente.';
  }

  private toDeleteUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'No tenés permisos para eliminar esta reseña.';
      }

      if (error.status === 404) {
        return 'La reseña ya no está disponible.';
      }

      return 'No pudimos eliminar la reseña. Intentá nuevamente.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos eliminar la reseña. Intentá nuevamente.';
  }

  private toShareUsersMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return 'No pudimos cargar los miembros. Intentá nuevamente.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos cargar los miembros. Intentá nuevamente.';
  }

  private toShareReviewMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Revisá los miembros seleccionados.';
      }

      if (error.status === 404) {
        return 'La reseña o alguno de los miembros ya no está disponible.';
      }

      return 'No pudimos compartir la reseña. Intentá nuevamente.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos compartir la reseña. Intentá nuevamente.';
  }

  private toSharedReviewsMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return 'No pudimos cargar las reseñas compartidas.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos cargar las reseñas compartidas.';
  }
}
