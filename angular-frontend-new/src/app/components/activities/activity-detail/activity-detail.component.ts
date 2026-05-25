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

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.activityId = Number(this.route.snapshot.paramMap.get('id'));
    this.activity = MOCK_ACTIVITIES.find(a => a.id === this.activityId);
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
}
