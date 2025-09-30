import { Component } from '@angular/core';
import {OnInit} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { NgFor } from '@angular/common';
import {NgIf} from '@angular/common';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface Friend {
  name: string;
  avatar?: string;
}

interface ActivityDetail {
  title: string;
  date: Date;
  location: string;
  description: string;
  duration: string;
  skills: string[];
  organization: string;
  friends: Friend[];
}

@Component({
  selector: 'app-activity-detail',
  imports: [MatCardModule,
                MatButtonModule,
                MatChipsModule,
                MatIconModule, NgFor, NgIf, DatePipe, MatCardModule],
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.css'
})

export class ActivityDetailComponent implements OnInit {
  activityId!: number;
  activity: any; // replace with ActivityDetail model if you like

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.activityId = Number(this.route.snapshot.paramMap.get('id'));
    // TODO: Replace with real service call
    this.activity = this.mockActivities.find(a => a.id === this.activityId);
  }

  mockActivities = [
    {
      id: 1,
      title: 'Hiking Trip',
      date: new Date('2025-10-12T09:00:00'),
      location: 'Blue Mountain Park',
      description: 'A fun day hiking with friends.',
      duration: '5 hours',
      skills: ['Endurance', 'Navigation'],
      organization: 'Outdoor Club',
      friends: [
              { name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
              { name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
              { name: 'Charlie', avatar: 'https://i.pravatar.cc/40?img=3' } // fallback to initials
            ]
    },
    {
      id: 2,
      title: 'Coding Hackathon',
      date: new Date('2025-11-05T10:00:00'),
      location: 'Tech Hub, Downtown',
      description: 'A 24-hour coding competition.',
      duration: '24 hours',
      skills: ['Coding', 'Teamwork'],
      organization: 'Tech Society',
      friends: [{ name: 'Diana', avatar: 'https://i.pravatar.cc/40?img=4' },
                        { name: 'Ethan', avatar: 'https://i.pravatar.cc/40?img=5' }]
    }
  ];
  onShare() {
    console.log('Shared activity:', this.activity.title);
    // You could integrate navigator.share() for mobile
  }

  onCancel() {
    console.log('Activity cancelled:', this.activity.title);
  }

  onDelete() {
    console.log('Activity deleted:', this.activity.title);
  }

}
