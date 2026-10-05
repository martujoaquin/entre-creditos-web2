export interface MovieApiItem {
  id_pelicula: number;
  titulo: string;
  director: string;
  anio: number;
  sinopsis: string;
  imagen: string | null;
  id_genero: number;
  activo: number;
}

export interface MoviesResponse {
  success: boolean;
  message?: string;
  peliculas?: MovieApiItem[];
}

export interface Movie extends MovieApiItem {
  imageUrl: string;
  defaultPosterUrl: string;
}

export interface MovieMutationResponse {
  success: boolean;
  message: string;
}
