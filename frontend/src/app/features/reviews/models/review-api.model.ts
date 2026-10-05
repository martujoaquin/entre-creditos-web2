export interface ReviewApiAuthor {
  id_usuario: number;
  nombre_completo: string;
  avatar: string | null;
}

export interface ReviewApiItem {
  id_resena: number;
  id_usuario: number;
  id_pelicula: number;
  frase_destacada: string | null;
  contenido: string;
  puntuacion: number;
  fecha_creacion: string;
  fecha_modificacion?: string | null;
  autor: ReviewApiAuthor;
}

export interface ReviewApiMovie {
  id_pelicula: number;
  titulo: string;
  director: string;
  anio: number;
  imagen: string | null;
}

export interface SharedReviewApi {
  id_compartida: number;
  fecha_compartida: string;
  remitente: ReviewApiAuthor;
  resena: ReviewApiItem & {
    pelicula: ReviewApiMovie;
  };
}

export interface ReviewsByMovieResponse {
  success: boolean;
  resenas: ReviewApiItem[];
  message?: string;
}

export interface CreateReviewRequest {
  frase_destacada: string | null;
  contenido: string;
  puntuacion: number;
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  resena?: ReviewApiItem;
}

export interface ReviewByIdResponse {
  success: boolean;
  resena?: ReviewApiItem;
  message?: string;
}

export interface UpdateReviewRequest {
  frase_destacada: string | null;
  contenido: string;
  puntuacion: number;
}

export interface UpdateReviewResponse {
  success: boolean;
  message: string;
  resena?: ReviewApiItem;
}

export interface DeleteReviewResponse {
  success: boolean;
  message: string;
}

export interface UsuarioCompartirApi {
  id_usuario: number;
  nombre_completo: string;
  avatar: string | null;
}

export interface UsuariosCompartirResponse {
  success: boolean;
  usuarios: UsuarioCompartirApi[];
  message?: string;
}

export interface ShareReviewRequest {
  id_resena: number;
  destinatarios: number[];
}

export interface ShareReviewResponse {
  success: boolean;
  message: string;
  compartidos: number[];
  ya_compartidos: number[];
}

export interface SharedReviewsResponse {
  success: boolean;
  compartidas: SharedReviewApi[];
  message?: string;
}
