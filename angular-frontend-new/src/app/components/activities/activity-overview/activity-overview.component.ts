import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { NgIf } from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Activity } from '../../../models/activity.model';
import { ActivityService } from '../../../services/api/activity.service';
import { VolunteerService } from '../../../services/api/volunteer.service';

@Component({
  selector: 'app-activity-overview',
  imports: [NgFor, NgIf, DatePipe, MatCardModule, RouterLink, RouterLinkActive, CardComponent, MatButtonModule, MatIconModule],
  templateUrl: './activity-overview.component.html',
  styleUrl: './activity-overview.component.css'
})

export class ActivityOverviewComponent implements OnInit {
  activities: Activity[] = [];
  private friendIds = new Set<number>();

  constructor(
    private activityService: ActivityService,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit(): void {
    this.volunteerService.getCurrentUser().subscribe({
      next: user => {
        this.volunteerService.getFriends(user.id).subscribe({
          next: friends => {
            this.friendIds = new Set((friends || []).map(friend => friend.id));
            this.loadActivities();
          },
          error: err => {
            console.error('Could not load friends', err);
            this.loadActivities();
          }
        });
      },
      error: err => {
        console.error('Could not load current user', err);
        this.loadActivities();
      }
    });
  }

  private loadActivities(): void {
    this.activityService.getAllActivities().subscribe({
      next: activities => {
        this.activities = (activities || []).map(activity => ({
          ...activity,
          participants: (activity.participants || []).filter(participant => this.friendIds.has(participant.id))
        }));
      },
      error: err => console.error('Could not load activities', err)
    });
  }

  getOrganisationNames(activity: Activity): string {
    return activity.organisations?.map(org => org.orgName).join(', ') || 'No organization';
  }

  addNew(): void {
  }
}
