import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AdminUser } from '../../../../core/models/admin-user.models';
import { AdminUserService } from '../../../../core/services/admin-user.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {
  users: AdminUser[] = [];
  selectedUser: AdminUser | null = null;
  actionUser: AdminUser | null = null;
  avatarFailures = new Set<number>();
  editName = '';
  editEmail = '';
  selectedAvatar: File | null = null;
  avatarPreviewUrl = '';
  actionType: 'role' | 'status' | null = null;
  isLoading = true;
  isSaving = false;
  isUpdatingAction = false;
  isEditModalOpen = false;
  isActionModalOpen = false;
  loadError = '';
  formError = '';
  actionError = '';
  feedbackMessage = '';
  private feedbackMessageTimeout: number | undefined;

  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get currentUserId(): number | null {
    return this.authService.currentUser()?.id_usuario ?? null;
  }

  get actionTitle(): string {
    if (!this.actionUser || !this.actionType) {
      return '';
    }

    if (this.actionType === 'role') {
      return this.actionUser.es_admin === 1
        ? 'Quitar permisos de administrador'
        : 'Otorgar permisos de administrador';
    }

    return this.actionUser.activo === 1 ? 'Inactivar usuario' : 'Reactivar usuario';
  }

  get actionQuestion(): string {
    if (!this.actionUser || !this.actionType) {
      return '';
    }

    if (this.actionType === 'role') {
      return this.actionUser.es_admin === 1
        ? '¿Deseás quitar los permisos de administrador a este usuario?'
        : '¿Deseás otorgar permisos de administrador a este usuario?';
    }

    return this.actionUser.activo === 1
      ? '¿Deseás inactivar este usuario?'
      : '¿Deseás reactivar este usuario?';
  }

  get actionHelp(): string {
    if (!this.actionUser || !this.actionType) {
      return '';
    }

    if (this.actionType === 'role') {
      return this.actionUser.es_admin === 1
        ? 'Ya no podrá acceder al Panel de Administración.'
        : 'Podrá acceder y gestionar todo el Panel de Administración.';
    }

    return this.actionUser.activo === 1 ? 'No podrá iniciar sesión hasta que sea reactivado.' : '';
  }

  get actionSubmitLabel(): string {
    if (this.isUpdatingAction) {
      return 'Guardando...';
    }

    if (this.actionType === 'role') {
      return 'Actualizar permisos';
    }

    return this.actionUser?.activo === 1 ? 'Inactivar' : 'Reactivar';
  }

  loadUsers(): void {
    this.isLoading = true;
    this.loadError = '';

    this.adminUserService
      .getUsers()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (message: string) => {
          this.users = [];
          this.loadError = message || 'No pudimos cargar los usuarios.';
        },
      });
  }

  isCurrentUser(user: AdminUser): boolean {
    return this.currentUserId === user.id_usuario;
  }

  getAvatarUrl(user: AdminUser): string {
    return this.avatarFailures.has(user.id_usuario) ? user.defaultAvatarUrl : user.avatarUrl;
  }

  onAvatarError(user: AdminUser): void {
    this.avatarFailures.add(user.id_usuario);
  }

  openEditModal(user: AdminUser): void {
    this.selectedUser = user;
    this.editName = user.nombre_completo;
    this.editEmail = user.email;
    this.selectedAvatar = null;
    this.avatarPreviewUrl = user.avatarUrl;
    this.formError = '';
    this.feedbackMessage = '';
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    if (this.isSaving) {
      return;
    }

    this.clearPreviewUrl();
    this.selectedUser = null;
    this.selectedAvatar = null;
    this.formError = '';
    this.isEditModalOpen = false;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.formError = '';
    this.clearPreviewUrl();

    if (!file) {
      this.selectedAvatar = null;
      this.avatarPreviewUrl = this.selectedUser?.avatarUrl ?? '';
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.formError = 'El formato de imagen no es válido.';
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.formError = 'La imagen supera el tamaño máximo permitido.';
      input.value = '';
      return;
    }

    this.selectedAvatar = file;
    this.avatarPreviewUrl = URL.createObjectURL(file);
  }

  saveUser(): void {
    if (!this.selectedUser) {
      return;
    }

    const name = this.normalizeName(this.editName);
    const email = this.editEmail.trim();

    if (name === '') {
      this.formError = 'El nombre completo es obligatorio.';
      return;
    }

    if (!this.isEmailValid(email)) {
      this.formError = 'El email no es válido.';
      return;
    }

    const formData = new FormData();
    formData.append('id_usuario', String(this.selectedUser.id_usuario));
    formData.append('nombre_completo', name);
    formData.append('email', email);

    if (this.selectedAvatar) {
      formData.append('avatar', this.selectedAvatar);
    }

    this.isSaving = true;
    this.formError = '';

    this.adminUserService
      .updateUser(formData)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.closeEditModal();
          this.loadUsers();
          this.showSuccessMessage('Usuario actualizado.');
        },
        error: (message: string) => {
          this.formError = message || 'No pudimos actualizar el usuario.';
        },
      });
  }

  openRoleModal(user: AdminUser): void {
    if (this.isCurrentUser(user) && user.es_admin === 1) {
      this.feedbackMessage = 'No podés quitarte tus propios permisos de administrador.';
      return;
    }

    this.openActionModal(user, 'role');
  }

  openStatusModal(user: AdminUser): void {
    if (this.isCurrentUser(user) && user.activo === 1) {
      this.feedbackMessage = 'No podés inactivar tu propia cuenta.';
      return;
    }

    this.openActionModal(user, 'status');
  }

  closeActionModal(): void {
    if (this.isUpdatingAction) {
      return;
    }

    this.actionUser = null;
    this.actionType = null;
    this.actionError = '';
    this.isActionModalOpen = false;
  }

  confirmAction(): void {
    if (!this.actionUser || !this.actionType) {
      return;
    }

    const formData = new FormData();
    formData.append('id_usuario', String(this.actionUser.id_usuario));

    if (this.actionType === 'role') {
      formData.append('es_admin', this.actionUser.es_admin === 1 ? '0' : '1');
    } else {
      formData.append('activo', this.actionUser.activo === 1 ? '0' : '1');
    }

    this.isUpdatingAction = true;
    this.actionError = '';

    this.adminUserService
      .updateUser(formData)
      .pipe(finalize(() => (this.isUpdatingAction = false)))
      .subscribe({
        next: () => {
          const successMessage = this.successMessageForAction();
          this.isUpdatingAction = false;
          this.closeActionModal();
          this.loadUsers();
          this.showSuccessMessage(successMessage);
        },
        error: (message: string) => {
          this.actionError = message || 'No pudimos actualizar el usuario.';
        },
      });
  }

  private openActionModal(user: AdminUser, type: 'role' | 'status'): void {
    this.actionUser = user;
    this.actionType = type;
    this.actionError = '';
    this.feedbackMessage = '';
    this.isActionModalOpen = true;
  }

  private successMessageForAction(): string {
    if (!this.actionUser || !this.actionType) {
      return 'Usuario actualizado.';
    }

    if (this.actionType === 'role') {
      return 'Permisos actualizados.';
    }

    return this.actionUser.activo === 1 ? 'Usuario inactivado.' : 'Usuario reactivado.';
  }

  private normalizeName(value: string): string {
    return value.replace(/\s+/gu, ' ').trim();
  }

  private isEmailValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private clearPreviewUrl(): void {
    if (this.avatarPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.avatarPreviewUrl);
    }

    this.avatarPreviewUrl = '';
  }

  ngOnDestroy(): void {
    this.clearSuccessMessageTimeout();
  }

  private showSuccessMessage(message: string): void {
    this.feedbackMessage = message;
    this.clearSuccessMessageTimeout();
    this.feedbackMessageTimeout = window.setTimeout(() => {
      this.feedbackMessage = '';
    }, 5000);
  }

  private clearSuccessMessageTimeout(): void {
    if (this.feedbackMessageTimeout !== undefined) {
      window.clearTimeout(this.feedbackMessageTimeout);
      this.feedbackMessageTimeout = undefined;
    }
  }

}
