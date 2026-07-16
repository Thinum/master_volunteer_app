import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  EngagementLevelOverview,
  EngagementLevelRequirement,
  EngagementTimeUnit
} from '../../../models/engagement-level.model';
import { OrganisationService } from '../../../services/api/organisation.service';

@Component({
  selector: 'app-engagement-level-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './engagement-level-overview.component.html',
  styleUrl: './engagement-level-overview.component.css'
})
export class EngagementLevelOverviewComponent implements OnInit {
  readonly timespanUnits: EngagementTimeUnit[] = ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'];

  organisationId = 0;
  overview?: EngagementLevelOverview;
  loading = true;
  saving = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly organisationService: OrganisationService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.organisationId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.organisationId) {
      this.loading = false;
      this.errorMessage = 'Organization not found.';
      return;
    }
    this.loadOverview();
  }

  get levels(): EngagementLevelRequirement[] {
    return this.overview?.levels ?? [];
  }

  get canSave(): boolean {
    return !!this.overview?.canManage
      && !this.saving
      && this.levels.every(level => this.isValid(level));
  }

  isUnlimited(level: EngagementLevelRequirement): boolean {
    return level.registrationLimit === null;
  }

  setUnlimited(level: EngagementLevelRequirement, unlimited: boolean): void {
    level.registrationLimit = unlimited ? null : (level.level === 0 ? 3 : 20);
  }

  registrationSummary(level: EngagementLevelRequirement): string {
    return level.registrationLimit === null
      ? 'Unlimited concurrent activity registrations'
      : `Up to ${level.registrationLimit} concurrent activity registrations`;
  }

  unlockSummary(level: EngagementLevelRequirement): string {
    if (level.level === 0) {
      return 'Join the organization';
    }
    const activities = level.requiredActivities === 1 ? 'activity' : 'activities';
    return `Complete ${level.requiredActivities} ${activities} within ${level.timespanValue} ${level.timespanUnit.toLowerCase()}`;
  }

  save(): void {
    if (!this.canSave) {
      return;
    }
    this.saving = true;
    this.organisationService.updateEngagementLevels(this.organisationId, this.levels).subscribe({
      next: overview => {
        this.overview = overview;
        this.saving = false;
        this.snackBar.open('Engagement level limits saved.', 'Close', { duration: 3000 });
      },
      error: error => {
        this.saving = false;
        this.snackBar.open(this.errorText(error, 'Could not save engagement level limits.'), 'Close', {
          duration: 5000
        });
      }
    });
  }

  trackLevel(_: number, level: EngagementLevelRequirement): number {
    return level.level;
  }

  private loadOverview(): void {
    this.loading = true;
    this.organisationService.getEngagementLevels(this.organisationId).subscribe({
      next: overview => {
        this.overview = {
          ...overview,
          levels: overview.levels.map(level => ({ ...level, functionality: [...level.functionality] }))
        };
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.errorText(error, 'Could not load engagement levels.');
      }
    });
  }

  private isValid(level: EngagementLevelRequirement): boolean {
    const validLimit = level.registrationLimit === null || level.registrationLimit >= 0;
    return validLimit && (level.level === 0
      || (level.requiredActivities >= 1 && level.timespanValue >= 1 && !!level.timespanUnit));
  }

  private errorText(error: any, fallback: string): string {
    return error?.error?.detail || error?.error?.message || fallback;
  }
}
