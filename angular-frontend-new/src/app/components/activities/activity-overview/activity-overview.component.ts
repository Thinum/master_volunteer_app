import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import {NgIf} from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {CardComponent} from '../../../shared/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Activity {
  id: number;
  title: string;
  date: string;
  description: string;
  organization: string;
  location: string;
  friends: { name: string; avatar?: string }[];
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
        { name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
        { name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
        { name: 'Charlie', avatar: 'https://i.pravatar.cc/40?img=3' } // fallback to initials
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
        { name: 'Diana', avatar: 'https://i.pravatar.cc/40?img=4' },
        { name: 'Ethan', avatar: 'https://i.pravatar.cc/40?img=5' }
      ]
    }
  ];

  addNew(): void {
  }
}
