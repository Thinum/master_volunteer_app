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

import { CommunityGoalService } from '../../../services/api/community-goal.service';

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
    MatNativeDateModule
  ],
  templateUrl: './community-goals.component.html',
  styleUrl: './community-goals.component.css',
})
export class CommunityGoalsComponent {
  organisationId!: number | null;
  isCreateMode = false;

  goalForm!: FormGroup;
  formSubmitted = false;

  loading = false;
  errorMessage = '';
  goals: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private communityGoalService: CommunityGoalService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.organisationId = Number(params.get('organisationId')) || null;
      this.isCreateMode = params.get('mode') === 'create';
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ✅ IMPORTANT: validator is on FormGroup */
    this.goalForm = this.fb.group(
      {
        title: ['', Validators.required],
        description: [''],
        targetValue: [null, Validators.required],
        currentValue: [0],
        startDate: [today, [Validators.required, futureOrTodayValidator()]],
        endDate: [null, Validators.required],
      },
      {
        validators: endAfterStartValidator
      }
    );
  }

  onCreateGoal() {
    this.formSubmitted = true;

    this.goalForm.markAllAsTouched();

    if (this.goalForm.invalid || !this.organisationId) {
      this.snackBar.open('Please fix the form errors.', 'Close', {
        duration: 3000
      });
      return;
    }

    const payload = this.goalForm.value;

    this.communityGoalService.createGoal(this.organisationId, payload).subscribe({
      next: () => {
        this.snackBar.open('Goal created successfully!', 'Close', {
          duration: 3000
        });

        this.router.navigate(['/organisations', this.organisationId]);
      },
      error: () => {
        this.snackBar.open('Failed to create goal.', 'Close', {
          duration: 4000
        });
      }
    });
  }
}
