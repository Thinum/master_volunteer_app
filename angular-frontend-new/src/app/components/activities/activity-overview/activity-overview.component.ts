import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { NgIf } from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { User } from '../../../models/user.model';

interface Activity {
  id: number;
  title: string;
  date: string;
  description: string;
  organization: string;
  location: string;
  friends: User[];
}

@Component({
  selector: 'app-activity-overview',
  imports: [NgFor, NgIf, DatePipe, MatCardModule, RouterLink, RouterLinkActive, CardComponent, MatButtonModule, MatIconModule],
  templateUrl: './activity-overview.component.html',
  styleUrl: './activity-overview.component.css'
})

export class ActivityOverviewComponent {
  activities: Activity[] = [
    {
      id: 1,
      title: 'Hiking Trip',
      date: '2025-10-12',
      organization: 'Outdoor Club',
      description: 'A fun day hiking with friends.',
      location: 'Mount Fiji' ,
      friends: [
        { id:1, name: 'Alice', profilePicture: 'https://i.pravatar.cc/40?img=1', email:'alice@mail.com', joinedAt: new Date(2024, 2, 10, 2, 30) },
        { id:2, name: 'Bob', profilePicture: 'https://i.pravatar.cc/40?img=2', email:'bob@mail.com', joinedAt: new Date(2024, 2, 10, 2, 30) },
        { id:3, name: 'Charlie', profilePicture: 'https://i.pravatar.cc/40?img=3', email:'charlie@mail.com', joinedAt: new Date(2024, 2, 10, 2, 30) } // fallback to initials
      ]
    },
    {
      id: 2,
      title: 'Coding Hackathon',
      date: '2025-11-05',
      organization: 'Tech Society',
      description: 'A fun day hacking with friends.',
      location: 'JKU',
      friends: [
        { id:4, name: 'Diana', profilePicture: 'https://i.pravatar.cc/40?img=4', email:'diana@mail.com', joinedAt: new Date(2024, 2, 10, 2, 30)},
        { id:5, name: 'Ethan', profilePicture: 'https://i.pravatar.cc/40?img=5', email:'ethan@mail.com', joinedAt: new Date(2024, 2, 10, 2, 30)}
      ]
    }
  ];

  addNew(): void {
  }
}
