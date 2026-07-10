import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Activity, InterestCategory } from '../../../models/activity.model';
import { Organisation } from '../../../models/organisation.model';
import { MOCK_ORGANISATIONS } from '../../../mock/mock-organisations';
import { MOCK_SKILLS } from '../../../mock/mock-skills';
import { ActivityService } from '../../../services/api/activity.service';
import { InterestService } from '../../../services/api/interest.service';

const DEFAULT_ACTIVITY_TAGS = [
  'outdoor',
  'outdoors',
  'indoor',
  'beginner-friendly',
  'social',
  'weekend',
  'physical',
  'advanced',
  'after-school',
  'community',
  'environment',
  'education',
  'animals',
  'food',
  'emergency',
  'training',
  'rescue',
  'music',
  'fundraising',
  'families',
  'students',
  'shelter',
  'care'
];

@Component({
  selector: 'app-create-activity',
  imports: [
    CommonModule,
    GoogleMapsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.css']
})
export class CreateActivityComponent implements OnInit {
  activityForm: FormGroup;
  availableSkills = MOCK_SKILLS;
  availableTags: string[] = [...DEFAULT_ACTIVITY_TAGS];
  availableCategories: InterestCategory[] = [];
  selectedCategoryCodes = new Set<string>();
  isSubmitting = false;

  center = { lat: 48.3069, lng: 14.2858 };
  zoom = 10;
  markerPosition: google.maps.LatLngLiteral | null = null;
  orgMarkers = MOCK_ORGANISATIONS.map((org: Organisation) => ({
    position: { lat: org.location.lat, lng: org.location.lon },
    title: org.orgName,
    id: org.id,
    icon: {
      url: org.profilePicture || '',
      scaledSize: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(20, 20)
    }
  }));

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private interestService: InterestService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      location: [''],
      description: [''],
      duration: [''],
      capacity: [1, [Validators.required, Validators.min(1)]],
      skills: this.fb.array([]),
      tags: this.fb.array([]),
      qualifications: this.fb.array([]),
      prerequisites: this.fb.array([]),
      organization: [''],
      expiresAt: [''],
      friends: this.fb.array([]),
      contacts: this.fb.array([]),
      orgContacts: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.activityService.getActivityTagCatalog().subscribe({
      next: tags => {
        this.availableTags = this.uniqueLabels([...DEFAULT_ACTIVITY_TAGS, ...(tags || [])]);
      },
      error: () => {
        this.availableTags = [...DEFAULT_ACTIVITY_TAGS];
      }
    });

    this.interestService.getInterestCatalog().subscribe({
      next: categories => {
        this.availableCategories = categories || [];
      },
      error: () => {
        this.availableCategories = [];
      }
    });
  }

  get skills(): FormArray { return this.activityForm.get('skills') as FormArray; }
  get tags(): FormArray { return this.activityForm.get('tags') as FormArray; }
  get qualifications(): FormArray { return this.activityForm.get('qualifications') as FormArray; }
  get prerequisites(): FormArray { return this.activityForm.get('prerequisites') as FormArray; }

  addSkill(skillInput: HTMLInputElement): void {
    const value = skillInput.value.trim();
    if (value && !this.hasFormArrayValue(this.skills, value)) {
      this.skills.push(this.fb.control(value));
    }
    skillInput.value = '';
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  toggleSkill(skill: string, event: MatChipSelectionChange): void {
    this.setFormArraySelection(this.skills, skill, event.selected);
  }

  isSkillSelected(skill: string): boolean {
    return this.hasFormArrayValue(this.skills, skill);
  }

  addTag(tagInput: HTMLInputElement): void {
    const value = tagInput.value.trim();
    if (value && !this.hasFormArrayValue(this.tags, value)) {
      this.tags.push(this.fb.control(value));
      this.availableTags = this.uniqueLabels([...this.availableTags, value]);
    }
    tagInput.value = '';
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  toggleTag(tag: string, event: MatChipSelectionChange): void {
    this.setFormArraySelection(this.tags, tag, event.selected);
  }

  isTagSelected(tag: string): boolean {
    return this.hasFormArrayValue(this.tags, tag);
  }

  toggleCategory(category: InterestCategory, event: MatChipSelectionChange): void {
    if (event.selected) {
      this.selectedCategoryCodes.add(category.code);
      return;
    }
    this.selectedCategoryCodes.delete(category.code);
  }

  isCategorySelected(category: InterestCategory): boolean {
    return this.selectedCategoryCodes.has(category.code);
  }

  addQualification(qInput: HTMLInputElement): void {
    const value = qInput.value.trim();
    if (value) {
      this.qualifications.push(this.fb.control(value));
    }
    qInput.value = '';
  }

  removeQualification(index: number): void {
    this.qualifications.removeAt(index);
  }

  addPrerequisite(pInput: HTMLInputElement): void {
    const value = pInput.value.trim();
    if (value) {
      this.prerequisites.push(this.fb.control(value));
    }
    pInput.value = '';
  }

  removePrerequisite(index: number): void {
    this.prerequisites.removeAt(index);
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.markerPosition = event.latLng.toJSON();
      const { lat, lng } = this.markerPosition;
      this.activityForm.patchValue({ location: `${lat}, ${lng}` });
    }
  }

  onSubmit(): void {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const raw = this.activityForm.getRawValue();
    const now = new Date();
    const skills = this.formArrayValues(this.skills);

    const activity: Activity = {
      id: 0,
      title: raw.title,
      body: raw.description || raw.title,
      description: raw.description || raw.title,
      projectId: 0,
      organisations: [],
      appointments: [],
      participants: [],
      date: raw.date ? new Date(raw.date) : undefined,
      duration: raw.duration || '',
      expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
      location: raw.location || '',
      coordinates: this.markerPosition || undefined,
      skills,
      requiredSkills: skills.map(skill => ({
        name: skill,
        minimumProficiency: 'BEGINNER',
        required: true
      })),
      preferredSkills: [],
      categories: this.availableCategories.filter(category => this.selectedCategoryCodes.has(category.code)),
      qualifications: this.formArrayValues(this.qualifications),
      prerequisites: this.formArrayValues(this.prerequisites),
      capacity: raw.capacity,
      spotsTaken: 0,
      equipmentProvided: [],
      tags: this.formArrayValues(this.tags),
      difficulty: 'easy',
      isPublic: true,
      status: 'open',
      createdAt: now,
      updatedAt: now
    };

    this.activityService.createActivity(activity).subscribe({
      next: createdActivity => {
        this.snackBar.open('Activity created', 'Close', { duration: 2500 });
        this.router.navigate(['/activities', createdActivity.id]);
      },
      error: err => {
        console.error(err);
        this.isSubmitting = false;
        this.snackBar.open('Could not create activity', 'Close', { duration: 3500 });
      }
    });
  }

  private setFormArraySelection(array: FormArray, value: string, selected: boolean): void {
    const existingIndex = this.findFormArrayIndex(array, value);

    if (selected && existingIndex === -1) {
      array.push(this.fb.control(value));
      return;
    }

    if (!selected && existingIndex !== -1) {
      array.removeAt(existingIndex);
    }
  }

  private hasFormArrayValue(array: FormArray, value: string): boolean {
    return this.findFormArrayIndex(array, value) !== -1;
  }

  private findFormArrayIndex(array: FormArray, value: string): number {
    const normalizedValue = this.normalizeChip(value);
    return array.controls.findIndex(control => this.normalizeChip(String(control.value ?? '')) === normalizedValue);
  }

  private formArrayValues(array: FormArray): string[] {
    return array.controls
      .map(control => String(control.value ?? '').trim())
      .filter(value => !!value);
  }

  private uniqueLabels(values: string[]): string[] {
    const labels = new Map<string, string>();

    values
      .map(value => value?.trim())
      .filter((value): value is string => !!value)
      .forEach(value => {
        const normalized = this.normalizeChip(value);
        if (!labels.has(normalized)) {
          labels.set(normalized, value);
        }
      });

    return Array.from(labels.values()).sort((first, second) => first.localeCompare(second));
  }

  private normalizeChip(value: string): string {
    return value.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  }
}
