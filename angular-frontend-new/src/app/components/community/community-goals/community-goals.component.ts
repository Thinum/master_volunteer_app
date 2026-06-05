import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class CommunityGoalsComponent {
organisationId!: number | null;
isCreateMode = false;
goalForm!: FormGroup;

constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.organisationId = Number(params.get('organisationId')) || null;
      this.isCreateMode = params.get('mode') === 'create';
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
      organisationId: this.organisationId,
      ...this.goalForm.value,
    };

    console.log('Create goal payload:', payload);
    alert('Goal created! Check console for payload.');
    this.goalForm.reset({ currentValue: 0 });
  }
}
