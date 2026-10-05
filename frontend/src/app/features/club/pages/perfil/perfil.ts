import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProfileStats, SessionUser } from '../../../../core/models/auth.models';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  usuario: SessionUser | null = null;
  estadisticas: ProfileStats | null = null;
  isLoading = true;
  isEditing = false;
  isSaving = false;
  isChangingPassword = false;
  loadError = '';
  formError = '';
  passwordError = '';
  passwordSuccess = '';
  nombreCompleto = '';
  passwordActual = '';
  passwordNueva = '';
  confirmPasswordNueva = '';
  selectedAvatar: File | null = null;
  selectedAvatarName = '';
  avatarPreviewUrl = '';
  avatarLoadFailed = false;
  showPasswordActual = false;
  showPasswordNueva = false;
  showConfirmPasswordNueva = false;

  get passwordRequirements() {
    const value = this.passwordNueva.trim();

    return [
      { label: 'Mínimo 8 caracteres', met: value.length >= 8 },
      { label: 'Al menos una mayúscula', met: /[A-Z]/.test(value) },
      { label: 'Al menos un número', met: /[0-9]/.test(value) },
      { label: 'Al menos un símbolo', met: /[^A-Za-z0-9]/.test(value) },
    ];
  }

  get passwordHelpHasError(): boolean {
    return this.passwordNueva.trim() !== '' && !this.isPasswordSecure(this.passwordNueva.trim());
  }

  constructor(private readonly authService: AuthService) {
    this.loadProfile();
  }

  get miembroDesde(): string {
    return this.formatMonthYear(this.usuario?.fecha_registro);
  }

  get promedioPuntuacion(): string {
    return this.estadisticas?.promedio_puntuacion === null ||
      this.estadisticas?.promedio_puntuacion === undefined
      ? '—'
      : this.estadisticas.promedio_puntuacion.toFixed(1);
  }

  get generoMasResenado(): string {
    return this.estadisticas?.genero_mas_resenado || 'Sin reseñas';
  }

  get avatarUrl(): string {
    if (this.avatarPreviewUrl) {
      return this.avatarPreviewUrl;
    }

    return this.avatarLoadFailed ? '/images/default-avatar.png' : this.usuario?.avatar || '/images/default-avatar.png';
  }

  loadProfile(): void {
    this.isLoading = true;
    this.loadError = '';

    this.authService
      .obtenerPerfil()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ usuario, estadisticas }) => {
          this.usuario = usuario;
          this.estadisticas = estadisticas;
          this.nombreCompleto = usuario.nombre_completo;
          this.avatarLoadFailed = false;
        },
        error: (message: string) => {
          this.loadError = message;
        },
      });
  }

  startEditing(): void {
    if (!this.usuario) {
      return;
    }

    this.isEditing = true;
    this.formError = '';
    this.passwordError = '';
    this.passwordSuccess = '';
    this.nombreCompleto = this.usuario.nombre_completo;
    this.clearSelectedAvatar();
    this.clearPasswordFields();
  }

  cancelEditing(): void {
    if (this.isSaving || this.isChangingPassword) {
      return;
    }

    this.isEditing = false;
    this.formError = '';
    this.passwordError = '';
    this.passwordSuccess = '';
    this.nombreCompleto = this.usuario?.nombre_completo || '';
    this.clearSelectedAvatar();
    this.clearPasswordFields();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.formError = '';
    this.clearPreviewUrl();

    if (!file) {
      this.selectedAvatar = null;
      this.selectedAvatarName = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
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
    this.selectedAvatarName = file.name;
    this.avatarPreviewUrl = URL.createObjectURL(file);
  }

  saveProfile(): void {
    const nombre = this.nombreCompleto.replace(/\s+/gu, ' ').trim();

    if (!this.isNameValid(nombre)) {
      this.formError = 'Ingresá un nombre y apellido válidos.';
      return;
    }

    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.formError = '';

    this.authService
      .actualizarPerfil(nombre, this.selectedAvatar)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.nombreCompleto = usuario.nombre_completo;
          this.isEditing = false;
          this.avatarLoadFailed = false;
          this.clearSelectedAvatar();
        },
        error: (message: string) => {
          this.formError = message;
        },
      });
  }

  changePassword(): void {
    const passwordActual = this.passwordActual.trim();
    const passwordNueva = this.passwordNueva.trim();
    const confirmPasswordNueva = this.confirmPasswordNueva.trim();
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!passwordActual || !passwordNueva || !confirmPasswordNueva) {
      this.passwordError = 'Completá todos los campos de contraseña.';
      return;
    }

    if (!this.isPasswordSecure(passwordNueva)) {
      this.passwordError = 'La nueva contraseña no cumple los requisitos de seguridad.';
      return;
    }

    if (passwordNueva !== confirmPasswordNueva) {
      this.passwordError = 'Las contraseñas nuevas no coinciden.';
      return;
    }

    if (passwordActual === passwordNueva) {
      this.passwordError = 'La nueva contraseña debe ser distinta a la actual.';
      return;
    }

    if (this.isChangingPassword) {
      return;
    }

    this.isChangingPassword = true;

    this.authService
      .cambiarPassword({
        password_actual: passwordActual,
        password_nueva: passwordNueva,
        confirm_password_nueva: confirmPasswordNueva,
      })
      .pipe(finalize(() => (this.isChangingPassword = false)))
      .subscribe({
        next: (response) => {
          this.passwordSuccess = response.message;
          this.clearPasswordFields();
        },
        error: (message: string) => {
          this.passwordError = message;
        },
      });
  }

  togglePasswordActualVisibility(input: HTMLInputElement): void {
    this.showPasswordActual = !this.showPasswordActual;
    input.focus();
  }

  togglePasswordNuevaVisibility(input: HTMLInputElement): void {
    this.showPasswordNueva = !this.showPasswordNueva;
    input.focus();
  }

  toggleConfirmPasswordNuevaVisibility(input: HTMLInputElement): void {
    this.showConfirmPasswordNueva = !this.showConfirmPasswordNueva;
    input.focus();
  }

  onAvatarError(): void {
    this.avatarLoadFailed = true;
  }

  private isNameValid(nombre: string): boolean {
    if (nombre.length < 5 || nombre.length > 100) {
      return false;
    }

    if (!/^[\p{L}\s'-]+$/u.test(nombre)) {
      return false;
    }

    const parts = nombre.split(/\s+/u);
    return parts.length >= 2 && parts.every((part) => /\p{L}{2,}/u.test(part));
  }

  private isPasswordSecure(password: string): boolean {
    return password.length >= 8
      && /[A-Z]/.test(password)
      && /[0-9]/.test(password)
      && /[^A-Za-z0-9]/.test(password);
  }

  private formatMonthYear(value?: string): string {
    if (!value) {
      return 'No disponible';
    }

    const date = new Date(value.includes(' ') ? value.replace(' ', 'T') : value);

    if (Number.isNaN(date.getTime())) {
      return 'No disponible';
    }

    return new Intl.DateTimeFormat('es-AR', {
      month: 'long',
      year: 'numeric',
    }).format(date).replace(/^\p{L}/u, (letter) => letter.toUpperCase());
  }

  private clearSelectedAvatar(): void {
    this.selectedAvatar = null;
    this.selectedAvatarName = '';
    this.clearPreviewUrl();
  }

  private clearPreviewUrl(): void {
    if (this.avatarPreviewUrl) {
      URL.revokeObjectURL(this.avatarPreviewUrl);
      this.avatarPreviewUrl = '';
    }
  }

  private clearPasswordFields(): void {
    this.passwordActual = '';
    this.passwordNueva = '';
    this.confirmPasswordNueva = '';
  }
}
