import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MOCK_ACTIVITIES } from '../../../mock/mock-activities';
import { Activity} from '../../../models/activity.model';
import {VolunteerService} from '../../../services/api/volunteer.service';
import {ActivityService} from '../../../services/api/activity.service';

interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
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
  activity!: Activity | undefined;
  hasJoined: boolean = false;

  constructor(private route: ActivatedRoute, private volunteerService: VolunteerService,
              private activityService: ActivityService) {}

  ngOnInit(): void {
    this.activityId = Number(this.route.snapshot.paramMap.get('id'));
    this.activity = MOCK_ACTIVITIES.find(a => a.id === this.activityId);
    this.volunteerService.getCurrentUser().subscribe(user => {
      this.hasJoined = this.activity?.participants?.some((usr) => usr.id === user.id) ?? false;
    });
  }

  onShare() {
    console.log('Shared activity:', this.activity?.title);
  }

  onCancel() {
    console.log('Activity cancelled:', this.activity?.title);
  }

  onDelete() {
    console.log('Activity deleted:', this.activity?.title);
  }

  joinActivity(){
    this.activityService.joinActivity(this.activityId).subscribe({
      next: result => {
        if (result) {
          console.log('Joined activity:', result);
          this.hasJoined = true;
        } else {
          console.error('Could not join activity')
        }
      },
      error: err =>
        // TODO: Maybe move to message bar
        console.error('Could not join activity', err)
      },
    );
  }
}
