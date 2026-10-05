import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Movie } from '../../../../core/models/movie.models';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css',
})
export class MovieCard {
  @Input({ required: true }) movie!: Movie;

  constructor(private readonly router: Router) {}

  navigateToDetail(event: MouseEvent): void {
    event.preventDefault();
    this.router.navigate(['/club/peliculas', this.movie.id_pelicula]);
  }

  onPosterError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src === this.movie.defaultPosterUrl) {
      image.style.visibility = 'hidden';
      return;
    }

    image.src = this.movie.defaultPosterUrl;
  }
}
