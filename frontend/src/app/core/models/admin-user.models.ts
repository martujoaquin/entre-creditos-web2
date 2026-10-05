export interface AdminUserApiItem {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  avatar: string | null;
  es_admin: number;
  activo: number;
}

export interface AdminUser extends AdminUserApiItem {
  avatarUrl: string;
  defaultAvatarUrl: string;
}

export interface AdminUsersResponse {
  success: boolean;
  message?: string;
  usuarios?: AdminUserApiItem[];
}

export interface AdminUserMutationResponse {
  success: boolean;
  message: string;
}
