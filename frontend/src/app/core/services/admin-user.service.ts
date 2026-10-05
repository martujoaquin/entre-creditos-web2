import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AdminUser,
  AdminUserApiItem,
  AdminUserMutationResponse,
  AdminUsersResponse,
} from '../models/admin-user.models';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly apiUrl = environment.apiUrl;
  private readonly backendBaseUrl = this.apiUrl.replace(/\/index\.php$/, '');
  private readonly defaultAvatarPath = 'uploads/avatars/default-avatar.png';

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<AdminUser[]> {
    return this.http
      .get<AdminUsersResponse>(`${this.apiUrl}?resource=usuarios`, { withCredentials: true })
      .pipe(
        map((response) => {
          if (!response.success || !response.usuarios) {
            throw new Error(response.message || 'No pudimos cargar los usuarios.');
          }

          return response.usuarios.map((user) => this.toAdminUser(user));
        }),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  updateUser(formData: FormData): Observable<AdminUserMutationResponse> {
    formData.append('_method', 'PATCH');

    return this.http
      .post<AdminUserMutationResponse>(`${this.apiUrl}?resource=usuarios`, formData, {
        withCredentials: true,
      })
      .pipe(
        map((response) => this.toMutationResponse(response)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  private toAdminUser(user: AdminUserApiItem): AdminUser {
    return {
      ...user,
      es_admin: Number(user.es_admin),
      activo: Number(user.activo),
      avatarUrl: this.toBackendAssetUrl(user.avatar),
      defaultAvatarUrl: this.toBackendAssetUrl(null),
    };
  }

  private toBackendAssetUrl(path: string | null): string {
    const avatarPath = path?.trim() || this.defaultAvatarPath;

    if (/^https?:\/\//.test(avatarPath)) {
      return avatarPath;
    }

    return `${this.backendBaseUrl}/${avatarPath.replace(/^\/+/, '')}`;
  }

  private toMutationResponse(response: AdminUserMutationResponse): AdminUserMutationResponse {
    if (!response.success) {
      throw new Error(response.message || 'No pudimos actualizar el usuario.');
    }

    return response;
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
