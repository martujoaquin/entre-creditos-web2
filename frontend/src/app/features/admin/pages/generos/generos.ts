import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Genre } from '../../../../core/models/genre.models';
import { GenreService } from '../../../../core/services/genre.service';

@Component({
  selector: 'app-generos',
  imports: [FormsModule],
  templateUrl: './generos.html',
  styleUrl: './generos.css',
})
export class Generos {
  genres: Genre[] = [];
  selectedGenre: Genre | null = null;
  genreToDelete: Genre | null = null;
  genreName = '';
  isLoading = true;
  isSaving = false;
  isDeleting = false;
  isFormModalOpen = false;
  isDeleteModalOpen = false;
  loadError = '';
  formError = '';
  deleteError = '';
  feedbackMessage = '';
  private feedbackMessageTimeout: number | undefined;

  constructor(private readonly genreService: GenreService) {}

  ngOnInit(): void {
    this.loadGenres();
  }

  get isEditing(): boolean {
    return this.selectedGenre !== null;
  }

  get formTitle(): string {
    return this.isEditing ? 'Editar género' : 'Nuevo género';
  }

  get formSubmitLabel(): string {
    if (this.isSaving) {
      return this.isEditing ? 'Guardando...' : 'Creando...';
    }

    return this.isEditing ? 'Guardar cambios' : 'Crear género';
  }

  loadGenres(): void {
    this.isLoading = true;
    this.loadError = '';

    this.genreService
      .getGenres()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (genres) => {
          this.genres = genres;
        },
        error: (message: string) => {
          this.genres = [];
          this.loadError = message || 'No pudimos cargar los géneros.';
        },
      });
  }

  openCreateModal(): void {
    this.selectedGenre = null;
    this.genreName = '';
    this.formError = '';
    this.feedbackMessage = '';
    this.isFormModalOpen = true;
  }

  openEditModal(genre: Genre): void {
    this.selectedGenre = genre;
    this.genreName = genre.nombre;
    this.formError = '';
    this.feedbackMessage = '';
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    if (this.isSaving) {
      return;
    }

    this.isFormModalOpen = false;
    this.selectedGenre = null;
    this.genreName = '';
    this.formError = '';
  }

  saveGenre(): void {
    const normalizedName = this.genreName.trim();

    if (normalizedName === '') {
      this.formError = 'El nombre del género es obligatorio';
      return;
    }

    this.isSaving = true;
    this.formError = '';

    const request = this.selectedGenre
      ? this.genreService.updateGenre(this.selectedGenre.id_genero, normalizedName)
      : this.genreService.createGenre(normalizedName);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.closeFormModal();
        this.loadGenres();
        this.showSuccessMessage(response.message);
      },
      error: (message: string) => {
        this.formError = message || 'No pudimos guardar el género.';
      },
    });
  }

  openDeleteModal(genre: Genre): void {
    this.genreToDelete = genre;
    this.deleteError = '';
    this.feedbackMessage = '';
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.isDeleting) {
      return;
    }

    this.isDeleteModalOpen = false;
    this.genreToDelete = null;
    this.deleteError = '';
  }

  deleteGenre(): void {
    if (!this.genreToDelete) {
      return;
    }

    this.isDeleting = true;
    this.deleteError = '';

    this.genreService
      .deleteGenre(this.genreToDelete.id_genero)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: (response) => {
          this.isDeleting = false;
          this.closeDeleteModal();
          this.loadGenres();
          this.showSuccessMessage(response.message);
        },
        error: (message: string) => {
          this.deleteError = message || 'No pudimos eliminar el género.';
        },
      });
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
