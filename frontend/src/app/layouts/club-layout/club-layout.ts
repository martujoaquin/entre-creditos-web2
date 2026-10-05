import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ClubNavbar } from '../../features/club/components/club-navbar/club-navbar';

@Component({
  selector: 'app-club-layout',
  standalone: true,
  imports: [RouterOutlet, ClubNavbar],
  templateUrl: './club-layout.html',
  styleUrl: './club-layout.css',
})
export class ClubLayout {}
