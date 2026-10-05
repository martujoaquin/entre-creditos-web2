import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/landing-layout/landing-layout').then((m) => m.LandingLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/pages/landing/landing').then((m) => m.Landing),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/pages/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/pages/register/register').then((m) => m.Register),
      },
    ],
  },
  {
    path: 'club',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/club-layout/club-layout').then((m) => m.ClubLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/club/pages/home/home').then((m) => m.Home),
      },
      {
        path: 'peliculas',
        loadComponent: () =>
          import('./features/club/pages/peliculas/peliculas').then((m) => m.Peliculas),
      },
      {
        path: 'peliculas/:id',
        loadComponent: () =>
          import('./features/club/pages/pelicula-detalle/pelicula-detalle').then(
            (m) => m.PeliculaDetalle,
          ),
      },
      {
        path: 'mis-resenas',
        loadComponent: () =>
          import('./features/club/pages/mis-resenas/mis-resenas').then((m) => m.MisResenas),
      },
      {
        path: 'resenas/nueva/:idPelicula',
        loadComponent: () =>
          import('./features/reviews/pages/nueva-resena/nueva-resena').then(
            (m) => m.NuevaResena,
          ),
      },
      {
        path: 'resenas/editar/:idResena',
        loadComponent: () =>
          import('./features/reviews/pages/nueva-resena/nueva-resena').then(
            (m) => m.NuevaResena,
          ),
      },
      {
        path: 'compartidas',
        loadComponent: () =>
          import('./features/club/pages/compartidas/compartidas').then((m) => m.Compartidas),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/club/pages/perfil/perfil').then((m) => m.Perfil),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/pages/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'peliculas',
        loadComponent: () =>
          import('./features/admin/pages/peliculas/peliculas').then((m) => m.Peliculas),
      },
      {
        path: 'generos',
        loadComponent: () =>
          import('./features/admin/pages/generos/generos').then((m) => m.Generos),
      },
      {
        path: 'resenas',
        loadComponent: () =>
          import('./features/admin/pages/resenas/resenas').then((m) => m.Resenas),
      },
    ],
  },
];
