import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminDashboardSummary } from '../../../../core/models/admin-dashboard.models';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  summary: AdminDashboardSummary | null = null;
  isLoadingSummary = true;
  summaryError = '';

  readonly metricLabels = [
    {
      label: 'Películas activas',
      key: 'peliculas_activas',
    },
    {
      label: 'Géneros',
      key: 'generos',
    },
    {
      label: 'Usuarios',
      key: 'usuarios',
    },
    {
      label: 'Reseñas publicadas',
      key: 'resenas',
    },
  ] as const;

  readonly sections = [
    {
      title: 'Películas',
      description: 'Administrar el catálogo de películas.',
      path: '/admin/peliculas',
    },
    {
      title: 'Géneros',
      description: 'Organizar los géneros disponibles.',
      path: '/admin/generos',
    },
    {
      title: 'Usuarios',
      description: 'Gestionar los miembros del club.',
      path: '/admin/usuarios',
    },
    {
      title: 'Reseñas',
      description: 'Supervisar las reseñas publicadas.',
      path: '/admin/resenas',
    },
  ];

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoadingSummary = true;
    this.summaryError = '';

    this.adminService
      .getDashboardSummary()
      .pipe(finalize(() => (this.isLoadingSummary = false)))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
        },
        error: (message: string) => {
          this.summary = null;
          this.summaryError = message || 'No se pudieron cargar las métricas.';
        },
      });
  }
}
