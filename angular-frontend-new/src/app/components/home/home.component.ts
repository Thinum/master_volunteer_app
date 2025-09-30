import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {CardComponent} from '../../shared/components/card/card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,       // for *ngFor, *ngIf
    MatCardModule,      // for <mat-card>
    MatIconModule,      // for <mat-icon>
    MatButtonModule,
    CardComponent,
    // for <button mat-icon-button>
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  user = {
    name: 'Herbert Mayer',
    role: 'Administrator',
    badges: 221,
    functions: 6,
    activities: 21
  };

  requests = [
    {
      organisation: 'FB-Klub Mentator',
      title: 'Event Organisation Unterstützung',
      hours: 330,
      user: { name: 'Sabine Lorenz', avatar: 'https://i.pravatar.cc/40?img=4' }
    },
    {
      organisation: 'FB-Klub Mentator',
      title: 'Event Organisation Unterstützung',
      hours: 400,
      user: { name: 'Liselotte Pulver', avatar: 'https://i.pravatar.cc/40?img=10' }
    },
    {
      organisation: 'Samariterbund Wien',
      title: 'Nachweis für Soziale Unterstützung',
      hours: 200,
      user: { name: 'Max Öllinger', avatar: 'https://i.pravatar.cc/40?img=8' }
    }
  ];
}
