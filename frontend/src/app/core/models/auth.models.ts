export interface SessionUser {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  es_admin: number;
  avatar: string | null;
  fecha_registro?: string;
}

export type LoginUser = SessionUser;

export interface LoginResponse {
  success: boolean;
  message: string;
  usuario?: LoginUser;
}

export interface RegisterRequest {
  nombre_completo: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface MeResponse {
  success: boolean;
  message?: string;
  usuario?: LoginUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ProfileStats {
  cantidad_resenas: number;
  promedio_puntuacion: number | null;
  genero_mas_resenado: string | null;
  cantidad_compartidas: number;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    usuario: SessionUser;
    estadisticas: ProfileStats;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  usuario?: SessionUser;
}

export interface ChangePasswordRequest {
  password_actual: string;
  password_nueva: string;
  confirm_password_nueva: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
