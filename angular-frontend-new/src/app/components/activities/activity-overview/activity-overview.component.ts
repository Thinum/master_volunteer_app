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

@Component({
  selector: 'app-activity-overview',
  imports: [NgFor, NgIf, DatePipe, MatCardModule, RouterLink, RouterLinkActive, CardComponent, MatButtonModule, MatIconModule],
  templateUrl: './activity-overview.component.html',
  styleUrl: './activity-overview.component.css'
})

export class ActivityOverviewComponent implements OnInit {
  activities: Activity[] = [];

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.activityService.getAllActivities().subscribe({
      next: activities => this.activities = activities || [],
      error: err => console.error('Could not load activities', err)
    });
  }

  getOrganisationNames(activity: Activity): string {
    return activity.organisations?.map(org => org.orgName).join(', ') || 'Keine Organisation';
  }

  addNew(): void {
  }
}
