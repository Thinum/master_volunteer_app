import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgFor, NgIf, DatePipe } from '@angular/common';
 import {MatTooltipModule} from '@angular/material/tooltip';

interface Friend {
  name: string;
  avatar?: string;
}

interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface ActivityDetail {
  id: number;
  title: string;
  date: Date;
  location: string;
  description: string;
  duration: string;
  skills: string[];
  qualifications: string[];
  prerequisites: string[];
  organization: string;
  createdAt: Date;
  expiresAt: Date;
  friends: Friend[];
  contacts: Contact[];
  orgContacts: Contact[];
}

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatExpansionModule,
    NgFor,
    NgIf,
    DatePipe,
    MatTooltipModule
  ],
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.css'
})
export class ActivityDetailComponent implements OnInit {
  activityId!: number;
  activity!: ActivityDetail | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.activityId = Number(this.route.snapshot.paramMap.get('id'));
    this.activity = this.mockActivities.find(a => a.id === this.activityId);
  }

  mockActivities: ActivityDetail[] = [
    {
      id: 1,
      title: 'Hiking Trip',
      date: new Date('2025-10-12T09:00:00'),
      location: 'Blue Mountain Park',
      description: 'A fun day hiking with friends.',
      duration: '5 hours',
      skills: ['Endurance', 'Navigation'],
      qualifications: ['Good physical shape'],
      prerequisites: ['Hiking boots', 'Water bottle'],
      organization: 'Outdoor Club',
      createdAt: new Date('2025-09-01'),
      expiresAt: new Date('2025-12-31'),
      friends: [
        { name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
        { name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
        { name: 'Charlie' } // fallback initials
      ],
      contacts: [
        { name: 'Alice', role: 'Organizer', phone: '123-456-789', email: 'alice@example.com' }
      ],
      orgContacts: [
        { name: 'John Doe', role: 'Club President', phone: '987-654-321', email: 'org@example.com' }
      ]
    }
  ];

  onShare() {
    console.log('Shared activity:', this.activity?.title);
  }

  onCancel() {
    console.log('Activity cancelled:', this.activity?.title);
  }

  onDelete() {
    console.log('Activity deleted:', this.activity?.title);
  }
}
