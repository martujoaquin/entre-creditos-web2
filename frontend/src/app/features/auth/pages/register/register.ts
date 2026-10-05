import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly registerForm;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  get passwordRequirements() {
    const value = this.registerForm.controls.password.value.trim();

    return [
      { label: 'Mínimo 8 caracteres', met: value.length >= 8 },
      { label: 'Al menos una mayúscula', met: /[A-Z]/.test(value) },
      { label: 'Al menos un número', met: /[0-9]/.test(value) },
      { label: 'Al menos un símbolo', met: /[^A-Za-z0-9]/.test(value) },
    ];
  }

  get passwordHelpHasError(): boolean {
    const password = this.registerForm.controls.password;

    return password.value.trim() !== '' && password.invalid && (password.dirty || password.touched);
  }

  constructor(
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
  ) {
    this.registerForm = this.formBuilder.nonNullable.group(
      {
        nombre_completo: ['', [Validators.required, fullNameValidator()]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), passwordPolicyValidator()]],
        confirm_password: ['', [Validators.required]],
      },
      { validators: passwordsMatchValidator },
    );
  }

  get passwordsDoNotMatch(): boolean {
    const confirmPassword = this.registerForm.controls.confirm_password;

    return (
      this.registerForm.hasError('passwordsDoNotMatch') &&
      (confirmPassword.touched || confirmPassword.dirty)
    );
  }

  togglePasswordVisibility(passwordInput: HTMLInputElement): void {
    this.showPassword = !this.showPassword;
    passwordInput.focus();
  }

  toggleConfirmPasswordVisibility(confirmPasswordInput: HTMLInputElement): void {
    this.showConfirmPassword = !this.showConfirmPassword;
    confirmPasswordInput.focus();
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const request = this.registerForm.getRawValue();

    this.authService.register({
      ...request,
      nombre_completo: normalizeFullName(request.nombre_completo),
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login'], { queryParams: { registro: 'ok' } });
      },
      error: (message: string) => {
        this.isLoading = false;
        this.errorMessage = message;
      },
    });
  }
}

function normalizeFullName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function fullNameValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = normalizeFullName(control.value);

    if (value === '') {
      return null;
    }

    const allowedCharacters = /^[\p{L}\s'-]+$/u;

    if (!allowedCharacters.test(value)) {
      return { fullName: true };
    }

    const words = value.split(' ');
    const hasValidWords = words.length >= 2 && words.every((word) => {
      const letterCount = [...word].filter((char) => /\p{L}/u.test(char)).length;

      return letterCount >= 2;
    });

    return hasValidWords ? null : { fullName: true };
  };
}

function passwordPolicyValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value;

    if (value === '') {
      return null;
    }

    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);

    return hasUppercase && hasNumber && hasSymbol ? null : { passwordPolicy: true };
  };
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirm_password')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordsDoNotMatch: true };
}
