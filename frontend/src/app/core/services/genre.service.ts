import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Genre, GenreMutationResponse, GenresResponse } from '../models/genre.models';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getGenres(): Observable<Genre[]> {
    return this.http
      .get<GenresResponse>(`${this.apiUrl}?resource=generos`, { withCredentials: true })
      .pipe(
        map((response) => {
          if (!response.success || !response.generos) {
            throw new Error(response.message || 'No pudimos cargar los géneros.');
          }

          return response.generos;
        }),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  createGenre(nombre: string): Observable<GenreMutationResponse> {
    const body = new FormData();
    body.append('nombre', nombre.trim());

    return this.http
      .post<GenreMutationResponse>(`${this.apiUrl}?resource=generos`, body, {
        withCredentials: true,
      })
      .pipe(
        map((response) => this.toMutationResponse(response)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  updateGenre(idGenero: number, nombre: string): Observable<GenreMutationResponse> {
    const body = new URLSearchParams();
    body.set('id_genero', String(idGenero));
    body.set('nombre', nombre.trim());

    return this.http
      .patch<GenreMutationResponse>(`${this.apiUrl}?resource=generos`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      })
      .pipe(
        map((response) => this.toMutationResponse(response)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  deleteGenre(idGenero: number): Observable<GenreMutationResponse> {
    const body = new URLSearchParams();
    body.set('id_genero', String(idGenero));

    return this.http
      .delete<GenreMutationResponse>(`${this.apiUrl}?resource=generos`, {
        body: body.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      })
      .pipe(
        map((response) => this.toMutationResponse(response)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  private toMutationResponse(response: GenreMutationResponse): GenreMutationResponse {
    if (!response.success) {
      throw new Error(response.message || 'No pudimos guardar el género.');
    }

    return response;
  }

  private toUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return 'No pudimos cargar los géneros.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No pudimos cargar los géneros.';
  }
}
