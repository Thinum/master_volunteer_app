import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
FormBuilder,
FormGroup,
Validators,
ReactiveFormsModule,
AbstractControl,
ValidationErrors,
ValidatorFn
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CommunityGoalService } from '../../../services/api/community-goal.service';
import { CommunityGoal } from '../../../models/community-goal.model';
import { InterestService } from '../../../services/api/interest.service';
import { OrganisationService } from '../../../services/api/organisation.service';
import { MOCK_SKILLS } from '../../../mock/mock-skills';

/* ---------------- Validators ---------------- */

function futureOrTodayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const selected = new Date(control.value);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selected >= today ? null : { pastDate: true };
  };
}

/* 🔥 CROSS FIELD VALIDATOR (IMPORTANT) */
const endAfterStartValidator: ValidatorFn = (group: AbstractControl) => {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;

  if (!start || !end) return null;

  return new Date(end).getTime() > new Date(start).getTime()
    ? null
    : { endBeforeStart: true };
};

@Component({
  selector: 'app-community-goals',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './community-goals.component.html',
  styleUrl: './community-goals.component.css',
})
export class CommunityGoalsComponent {
  private readonly fallbackInterests = MOCK_SKILLS.map(skill => this.normalizeInterestName(skill.name));

  organisationId!: number | null;
  isCreateMode = false;
  isEditMode = false;
  goalId!: number | null;

  goalForm!: FormGroup;
  formSubmitted = false;
  isSubmitting = false;

  loading = false;
  errorMessage = '';
  goals: CommunityGoal[] = [];
  activityTagOptions: string[] = [];
  canManageGoals = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private communityGoalService: CommunityGoalService,
    private interestService: InterestService,
    private organisationService: OrganisationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.organisationId = Number(params.get('organisationId')) || null;
      this.isCreateMode = params.get('mode') === 'create';
      this.isEditMode = params.get('mode') === 'edit';
      this.goalId = Number(params.get('goalId')) || null;
      this.canManageGoals = false;

      if (this.organisationId) {
        this.loadGoalManagementAccess(this.organisationId);
        this.loadActivityTags();
        if (this.isEditMode && this.goalId) {
          this.loadGoalForEdit(this.goalId);
        } else if (!this.isCreateMode) {
          this.loadGoals();
        }
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ✅ IMPORTANT: validator is on FormGroup */
    this.goalForm = this.fb.group(
      {
        title: ['', Validators.required],
        description: [''],
        targetValue: [null, [Validators.required, Validators.min(1)]],
        currentValue: [0],
        activityTags: [[]],
        startDate: [today, [Validators.required]],
        endDate: [null, Validators.required],
      },
      {
        validators: endAfterStartValidator
      }
    );
  }

  onCreateGoal() {
    if (this.isSubmitting) {
      return;
    }

    if (!this.canManageGoals) {
      this.snackBar.open('You do not have permission to manage goals for this organization.', 'Close', {
        duration: 4000
      });
      return;
    }

    this.formSubmitted = true;

    this.goalForm.markAllAsTouched();

    if (this.goalForm.invalid || !this.organisationId) {
      this.snackBar.open('Please fix the form errors.', 'Close', {
        duration: 3000
      });
      return;
    }

    const payload = this.goalForm.value;
    this.isSubmitting = true;

    if (this.isEditMode && this.goalId) {
      this.communityGoalService.updateGoal(this.goalId, payload).subscribe({
        next: () => {
          this.snackBar.open('Goal updated successfully!', 'Close', {
            duration: 3000
          });

          this.router.navigate(['/community-goals'], {
            queryParams: { organisationId: this.organisationId }
          });
        },
        error: () => {
          this.isSubmitting = false;
          this.snackBar.open('Failed to update goal.', 'Close', {
            duration: 4000
          });
        }
      });
      return;
    }

    this.communityGoalService.createGoal(this.organisationId, payload).subscribe({
      next: () => {
        this.snackBar.open('Goal created successfully!', 'Close', {
          duration: 3000
        });

        this.router.navigate(['/organisations', this.organisationId]);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Failed to create goal.', 'Close', {
          duration: 4000
        });
      }
    });
  }

  loadGoalForEdit(goalId: number): void {
    this.loading = true;
    this.communityGoalService.getGoalById(goalId).subscribe({
      next: goal => {
        this.goalForm.patchValue({
          title: goal.title,
          description: goal.description ?? '',
          targetValue: goal.targetValue,
          currentValue: goal.currentValue ?? 0,
          activityTags: goal.activityTags ?? [],
          startDate: goal.startDate ? new Date(goal.startDate) : null,
          endDate: goal.endDate ? new Date(goal.endDate) : null
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load goal.', 'Close', {
          duration: 4000
        });
      }
    });
  }

  loadGoals(): void {
    if (!this.organisationId) return;

    this.loading = true;
    this.errorMessage = '';

    this.communityGoalService.getGoalsForOrganisation(this.organisationId).subscribe({
      next: goals => {
        this.goals = goals;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load goals.';
        this.loading = false;
      }
    });
  }

  loadActivityTags(): void {
    this.interestService.getAllInterests().subscribe({
      next: interests => {
        this.activityTagOptions = interests.length
          ? interests.map(interest => this.normalizeInterestName(interest))
          : this.fallbackInterests;
      },
      error: () => {
        this.activityTagOptions = this.fallbackInterests;
      }
    });
  }

  private loadGoalManagementAccess(organisationId: number): void {
    this.organisationService.getEngagementLevels(organisationId).subscribe({
      next: overview => {
        if (this.organisationId === organisationId) {
          this.canManageGoals = overview.canManageActivitiesAndGoals;
        }
      },
      error: () => {
        if (this.organisationId === organisationId) {
          this.canManageGoals = false;
        }
      }
    });
  }

  requiresActivityTags(): boolean {
    return false;
  }

  private normalizeInterestName(value: string): string {
    const trimmed = value.trim().replace(/\s+/g, ' ');
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }

  getGoalProgress(goal: CommunityGoal): number {
    const current = goal.currentValue ?? 0;
    const target = goal.targetValue ?? 0;
    if (!target || target <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, (current / target) * 100));
  }

  getActivityContributionGroups(goal: CommunityGoal): {
    title: string;
    date?: Date;
    members: { id: number; name: string; profilePicture?: string }[];
  }[] {
    const activitiesById = new Map<
      number,
      { title: string; date?: Date; members: { id: number; name: string; profilePicture?: string }[] }
    >();

    (goal.contributions ?? []).forEach(contribution => {
      const memberName =
        contribution.member.name || contribution.member.username || contribution.member.email || 'Unknown member';
      const member = {
        id: contribution.member.id,
        name: memberName,
        profilePicture: contribution.member.profilePicture
      };

      contribution.activities.forEach(activity => {
        const existing = activitiesById.get(activity.id) ?? {
          title: activity.title,
          date: activity.date,
          members: []
        };

        if (!existing.members.some(existingMember => existingMember.id === member.id)) {
          existing.members.push(member);
        }

        activitiesById.set(activity.id, existing);
      });
    });

    return Array.from(activitiesById.values());
  }

  goToCreateGoal(): void {
    if (!this.organisationId || !this.canManageGoals) {
      return;
    }

    this.router.navigate(['/community-goals'], {
      queryParams: { organisationId: this.organisationId, mode: 'create' }
    });
  }

  cancel(): void {
    this.router.navigate(['/community-goals'], {
      queryParams: { organisationId: this.organisationId }
    });
  }

  goToEditGoal(goal: CommunityGoal): void {
    if (!this.organisationId || !goal.id || !this.canManageGoals) {
      return;
    }

    this.router.navigate(['/community-goals'], {
      queryParams: { organisationId: this.organisationId, mode: 'edit', goalId: goal.id }
    });
  }

  goToUserProfile(event: Event, userId: number): void {
    event.preventDefault();
    event.stopPropagation();

    if (!userId) {
      return;
    }

    this.router.navigate(['/profile', userId]);
  }

}
