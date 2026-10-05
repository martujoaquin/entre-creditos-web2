import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminDashboardSummary } from '../models/admin-dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getDashboardSummary(): Observable<AdminDashboardSummary> {
    return this.http
      .get<AdminDashboardSummary>(`${this.apiUrl}?resource=admin-dashboard`, {
        withCredentials: true,
      })
      .pipe(catchError((error: unknown) => throwError(() => this.toUserMessage(error))));
  }

  private toUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return 'No se pudieron cargar las métricas.';
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'No se pudieron cargar las métricas.';
  }
}
