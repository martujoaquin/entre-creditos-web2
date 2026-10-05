import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  ProfileResponse,
  RegisterRequest,
  RegisterResponse,
  SessionUser,
  UpdateProfileResponse,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly backendBaseUrl = this.apiUrl.replace(/\/index\.php$/, '');
  private readonly defaultAvatarPath = 'uploads/avatars/default-avatar.png';
  private readonly currentUserSignal = signal<SessionUser | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<SessionUser> {
    const body = new FormData();
    body.append('action', 'login');
    body.append('email', email);
    body.append('password', password);

    return this.http
      .post<LoginResponse>(`${this.apiUrl}?action=login`, body, { withCredentials: true })
      .pipe(
        map((response) => {
          if (!response.success || !response.usuario) {
            throw new Error(response.message || 'No pudimos iniciar sesión.');
          }

          return this.toSessionUser(response.usuario);
        }),
        tap((usuario) => this.setCurrentUser(usuario)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    const body = new FormData();
    body.append('action', 'register');
    body.append('nombre_completo', request.nombre_completo);
    body.append('email', request.email);
    body.append('password', request.password);
    body.append('confirm_password', request.confirm_password);

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}?action=register`, body, { withCredentials: true })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'No pudimos crear la cuenta.');
          }

          return response;
        }),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  me(): Observable<SessionUser> {
    return this.http
      .get<MeResponse>(`${this.apiUrl}?action=me`, { withCredentials: true })
      .pipe(
        map((response) => {
          if (!response.success || !response.usuario) {
            throw new Error(response.message || 'No hay una sesión activa.');
          }

          return this.toSessionUser(response.usuario);
        }),
        tap((usuario) => this.setCurrentUser(usuario)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  logout(): Observable<LogoutResponse> {
    const body = new FormData();
    body.append('action', 'logout');

    return this.http
      .post<LogoutResponse>(`${this.apiUrl}?action=logout`, body, { withCredentials: true })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'No pudimos cerrar la sesión.');
          }

          return response;
        }),
        tap(() => this.setCurrentUser(null)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  obtenerPerfil(): Observable<NonNullable<ProfileResponse['data']>> {
    return this.http
      .get<ProfileResponse>(`${this.apiUrl}?resource=perfil`, { withCredentials: true })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'No pudimos cargar tu perfil.');
          }

          return {
            ...response.data,
            usuario: this.toSessionUser(response.data.usuario),
          };
        }),
        tap(({ usuario }) => this.setCurrentUser(usuario)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  actualizarPerfil(nombreCompleto: string, avatar?: File | null): Observable<SessionUser> {
    const body = new FormData();
    body.append('_method', 'PATCH');
    body.append('nombre_completo', nombreCompleto);

    if (avatar) {
      body.append('avatar', avatar);
    }

    return this.http
      .post<UpdateProfileResponse>(`${this.apiUrl}?resource=perfil`, body, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.usuario) {
            throw new Error(response.message || 'No pudimos guardar los cambios.');
          }

          return this.toSessionUser(response.usuario);
        }),
        tap((usuario) => this.setCurrentUser(usuario)),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  cambiarPassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    const body = new FormData();
    body.append('password_actual', request.password_actual.trim());
    body.append('password_nueva', request.password_nueva.trim());
    body.append('confirm_password_nueva', request.confirm_password_nueva.trim());

    return this.http
      .post<ChangePasswordResponse>(`${this.apiUrl}?resource=perfil&action=cambiar_password`, body, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'No pudimos actualizar la contraseña.');
          }

          return response;
        }),
        catchError((error: unknown) => throwError(() => this.toUserMessage(error))),
      );
  }

  setCurrentUser(usuario: SessionUser | null): void {
    this.currentUserSignal.set(usuario);
  }

  private toSessionUser(usuario: SessionUser): SessionUser {
    return {
      ...usuario,
      avatar: this.toBackendAssetUrl(usuario.avatar),
    };
  }

  private toBackendAssetUrl(path: string | null): string {
    const avatarPath = path?.trim() || this.defaultAvatarPath;

    if (/^https?:\/\//.test(avatarPath)) {
      return avatarPath;
    }

    return `${this.backendBaseUrl}/${avatarPath.replace(/^\/+/, '')}`;
  }

  private toUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;

      if (typeof backendMessage === 'string' && backendMessage.trim() !== '') {
        return backendMessage;
      }

      return 'No pudimos conectar con el servidor. Intentá nuevamente en unos minutos.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'Ocurrió un error inesperado. Intentá nuevamente.';
  }
}
