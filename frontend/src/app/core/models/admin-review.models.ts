export interface AdminReviewApiAuthor {
  id_usuario: number;
  nombre_completo: string;
  avatar: string | null;
}

export interface AdminReviewApiMovie {
  id_pelicula: number;
  titulo: string;
  imagen: string | null;
  activo: number;
}

export interface AdminReviewApiItem {
  id_resena: number;
  frase_destacada: string | null;
  contenido: string;
  puntuacion: number;
  fecha_creacion: string;
  autor: AdminReviewApiAuthor;
  pelicula: AdminReviewApiMovie;
}

export interface AdminReview extends AdminReviewApiItem {
  authorAvatarUrl: string;
  defaultAvatarUrl: string;
  moviePosterUrl: string;
  defaultPosterUrl: string;
}

export interface AdminReviewsResponse {
  success: boolean;
  resenas?: AdminReviewApiItem[];
  message?: string;
}

export interface AdminReviewDeleteResponse {
  success: boolean;
  message: string;
}
