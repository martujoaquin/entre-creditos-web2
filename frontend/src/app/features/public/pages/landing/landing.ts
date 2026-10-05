import { Component } from '@angular/core';
import { FinalCta } from '../../components/final-cta/final-cta';
import { Footer } from '../../components/footer/footer';
import { Hero } from '../../components/hero/hero';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { LatestReviews } from '../../components/latest-reviews/latest-reviews';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [Hero, HowItWorks, LatestReviews, FinalCta, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {}
