import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommunityGoalService } from '../../../services/api/community-goal.service';
import { Router } from '@angular/router';

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
],
templateUrl: './community-goals.component.html',
styleUrl: './community-goals.component.css',
})
export class CommunityGoalsComponent {
organisationId!: number | null;
isCreateMode = false;
goalForm!: FormGroup;

loading = false;
errorMessage = '';
goals: any[] = [];

constructor(private route: ActivatedRoute, private fb: FormBuilder,  private communityGoalService: CommunityGoalService, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.organisationId = Number(params.get('organisationId')) || null;
      this.isCreateMode = params.get('mode') === 'create';
      console.log('mode:', params.get('mode'), 'isCreateMode:', this.isCreateMode);
    });

    this.goalForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      targetValue: [null, Validators.required],
      currentValue: [0],
      targetDate: [null],
    });
  }

  onCreateGoal() {
  if (this.goalForm.invalid || !this.organisationId) return;

  const payload = {
    title: this.goalForm.value.title,
    description: this.goalForm.value.description,
    targetValue: this.goalForm.value.targetValue,
    currentValue: this.goalForm.value.currentValue,
    targetDate: this.goalForm.value.targetDate,
    // defaults
  };

  this.communityGoalService.createGoal(this.organisationId, payload as any).subscribe({
    next: (createdGoal) => {
      console.log('Created goal from API:', createdGoal);
      // zurück zur Organisations-Detailseite
      this.router.navigate(['/organisations', this.organisationId]);
    },
    error: (err) => {
      console.error('Create goal failed', err);
      //
    },
  });
}
}
