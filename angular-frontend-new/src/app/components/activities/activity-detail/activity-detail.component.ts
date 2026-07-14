import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Activity} from '../../../models/activity.model';
import { User } from '../../../models/user.model';
import {VolunteerService} from '../../../services/api/volunteer.service';
import {ActivityService} from '../../../services/api/activity.service';
import {OrganisationService} from '../../../services/api/organisation.service';
import {MatListItem} from '@angular/material/list';
import {ShareButtonComponent} from '../../../shared/components/share-button/share-button.component';

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
    MatTooltipModule,
    MatSnackBarModule,
    MatListItem,
    RouterLink,
    ShareButtonComponent
  ],
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.css'
})
export class ActivityDetailComponent implements OnInit {
  activityId!: number;
  activity!: Activity | undefined;
  hasJoined: boolean = false;
  currentUser: User | null = null;
  canManage = false;
  private friendIds = new Set<number>();

  constructor(private route: ActivatedRoute, private volunteerService: VolunteerService,
              private activityService: ActivityService,
              private organisationService: OrganisationService,
              private router: Router,
              private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.activityId = Number(this.route.snapshot.paramMap.get('id'));
    this.activityService.getActivityById(this.activityId).subscribe({
      next: activity => {
        this.activity = activity;
        this.updateJoinState();
        this.organisationService.getAdministeredOrganisations().subscribe({
          next: organisations => this.canManage = activity.organisations.some(
            activityOrg => organisations.some(adminOrg => adminOrg.id === activityOrg.id)),
          error: () => this.canManage = false
        });
      },
      error: err => console.error('Could not load activity', err)
    });

    this.volunteerService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.updateJoinState();
      this.volunteerService.getFriends(user.id).subscribe({
        next: friends => this.friendIds = new Set((friends || []).map(friend => friend.id)),
        error: err => console.error('Could not load friends', err)
      });
    });
  }

  get spotsTaken(): number {
    return this.activity?.participants?.length ?? this.activity?.spotsTaken ?? 0;
  }

  get capacity(): number {
    return this.activity?.capacity ?? 0;
  }

  get hasParticipantLimit(): boolean {
    return this.capacity > 0;
  }

  get availableSlots(): number {
    if (!this.hasParticipantLimit) {
      return Number.POSITIVE_INFINITY;
    }
    return Math.max(this.capacity - this.spotsTaken, 0);
  }

  get isFull(): boolean {
    return this.hasParticipantLimit && this.availableSlots === 0;
  }

  get allParticipants(): User[] {
    return this.uniqueUsers(this.activity?.participants || []);
  }

  get friendParticipants(): User[] {
    return this.allParticipants.filter(participant => this.friendIds.has(participant.id));
  }

  get visibleTags(): string[] {
    return this.uniqueLabels(this.activity?.tags || []);
  }

  get visibleSkills(): string[] {
    return this.uniqueLabels(this.activity?.skills || []);
  }

  private updateJoinState(): void {
    this.hasJoined = !!this.currentUser && (this.activity?.participants?.some((usr) => usr.id === this.currentUser?.id) ?? false);
  }

  onShare() {
    console.log('Shared activity:', this.activity?.title);
  }

  onCancel() {
    console.log('Activity cancelled:', this.activity?.title);
  }

  editActivity(): void {
    if (this.canManage) {
      this.router.navigate(['/activities', this.activityId, 'edit']);
    }
  }

  onDelete(): void {
    if (!this.canManage || !window.confirm('Delete this activity?')) {
      return;
    }
    this.activityService.deleteActivity(this.activityId).subscribe({
      next: () => {
        this.snackBar.open('Activity deleted.', 'Close', { duration: 2500 });
        this.router.navigate(['/activities']);
      },
      error: () => this.snackBar.open('Could not delete activity.', 'Close', { duration: 3500 })
    });
  }

  joinActivity(){
    if (this.hasJoined || this.isFull) {
      return;
    }
    this.activityService.joinActivity(this.activityId).subscribe({
      next: result => {
        if (result) {
          console.log('Joined activity:', result);
          this.hasJoined = true;
          if (this.activity) {
            if (this.currentUser && !this.activity.participants?.some(user => user.id === this.currentUser?.id)) {
              this.activity.participants = [...(this.activity.participants ?? []), this.currentUser];
            }
            this.activity.spotsTaken = this.activity.participants?.length ?? this.spotsTaken + 1;
          }
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

  private uniqueUsers(users: User[]): User[] {
    const usersById = new Map<number, User>();
    users.forEach(user => usersById.set(user.id, user));
    return Array.from(usersById.values());
  }

  private uniqueLabels(values: string[]): string[] {
    const labels = new Map<string, string>();

    values
      .map(value => value?.trim().replace(/\s+/g, ' '))
      .filter((value): value is string => !!value)
      .forEach(value => {
        const normalized = value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
        if (!labels.has(normalized)) {
          labels.set(normalized, value);
        }
      });

    return Array.from(labels.values());
  }
}
