export interface Genre {
  id_genero: number;
  nombre: string;
}

export interface GenresResponse {
  success: boolean;
  message?: string;
  generos?: Genre[];
}

export interface GenreMutationResponse {
  success: boolean;
  message: string;
}
