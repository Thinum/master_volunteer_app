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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity, InterestCategory } from '../../../models/activity.model';
import { Organisation } from '../../../models/organisation.model';
import { MOCK_ORGANISATIONS } from '../../../mock/mock-organisations';
import { MOCK_SKILLS } from '../../../mock/mock-skills';
import { ActivityService } from '../../../services/api/activity.service';
import { InterestService } from '../../../services/api/interest.service';
import { OrganisationService } from '../../../services/api/organisation.service';
import { SkillCatalogService } from '../../../services/api/skill-catalog.service';
import { ActivitySkillRequirement, Skill } from '../../../models/skill.model';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/api/project.service';

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
    MatSelectModule,
    MatNativeDateModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.css']
})
export class CreateActivityComponent implements OnInit {
  activityForm: FormGroup;
  availableSkills: Skill[] = [...MOCK_SKILLS];
  availableTags: string[] = [...DEFAULT_ACTIVITY_TAGS];
  availableCategories: InterestCategory[] = [];
  selectedCategoryCodes = new Set<string>();
  isSubmitting = false;
  administeredOrganisations: Organisation[] = [];
  availableProjects: Project[] = [];
  activityId?: number;
  private requestedProjectId = 0;
  private loadedSkillRequirements = new Map<string, ActivitySkillRequirement>();


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
    private skillCatalogService: SkillCatalogService,
    private route: ActivatedRoute,
    private organisationService: OrganisationService,
    private projectService: ProjectService,
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
      requiredSkills: this.fb.array([]),
      preferredSkills: this.fb.array([]),
      tags: this.fb.array([]),
      qualifications: this.fb.array([]),
      prerequisites: this.fb.array([]),
      organization: [0, Validators.min(1)],
      project: [0],
      expiresAt: [''],
      friends: this.fb.array([]),
      contacts: this.fb.array([]),
      orgContacts: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    this.activityId = routeId > 0 ? routeId : undefined;
    const requestedOrganisationId = Number(this.route.snapshot.queryParamMap.get('organisationId'));
    this.requestedProjectId = Number(this.route.snapshot.queryParamMap.get('projectId'));

    this.organisationService.getAdministeredOrganisations().subscribe({
      next: organisations => {
        this.administeredOrganisations = organisations ?? [];
        if (!this.administeredOrganisations.length) {
          this.snackBar.open('Only organization admins can manage activities.', 'Close', { duration: 3500 });
          this.router.navigate(['/activities']);
          return;
        }

        if (this.activityId) {
          this.loadActivity(this.activityId);
          return;
        }

        const selectedId = this.administeredOrganisations.some(org => org.id === requestedOrganisationId)
          ? requestedOrganisationId
          : this.administeredOrganisations[0].id;
        this.activityForm.patchValue({ organization: selectedId });
        this.loadProjects(selectedId, this.requestedProjectId);
      },
      error: () => this.router.navigate(['/activities'])
    });
    this.activityService.getActivityTagCatalog().subscribe({
      next: tags => {
        this.availableTags = this.uniqueLabels([...DEFAULT_ACTIVITY_TAGS, ...(tags || [])]);
      },
      error: () => {
        this.availableTags = [...DEFAULT_ACTIVITY_TAGS];
      }
    });

    this.skillCatalogService.getSkillCatalog().subscribe({
      next: skills => {
        if (skills.length) {
          this.availableSkills = this.mergeSkills(skills, [
            ...this.formArrayValues(this.requiredSkills),
            ...this.formArrayValues(this.preferredSkills),
          ]);
        }
      },
      error: () => {
        this.availableSkills = this.mergeSkills(MOCK_SKILLS, [
          ...this.formArrayValues(this.requiredSkills),
          ...this.formArrayValues(this.preferredSkills),
        ]);
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

  get requiredSkills(): FormArray { return this.activityForm.get('requiredSkills') as FormArray; }
  get preferredSkills(): FormArray { return this.activityForm.get('preferredSkills') as FormArray; }
  get tags(): FormArray { return this.activityForm.get('tags') as FormArray; }
  get qualifications(): FormArray { return this.activityForm.get('qualifications') as FormArray; }
  get prerequisites(): FormArray { return this.activityForm.get('prerequisites') as FormArray; }

  addSkill(skillInput: HTMLInputElement, required: boolean): void {
    const value = skillInput.value.trim();
    if (value) {
      this.setSkillSelection(value, required, true);
      this.availableSkills = this.mergeSkills(this.availableSkills, [value]);
    }
    skillInput.value = '';
  }

  removeSkill(index: number, required: boolean): void {
    this.skillArray(required).removeAt(index);
  }

  toggleSkill(skill: string, required: boolean, event: MatChipSelectionChange): void {
    this.setSkillSelection(skill, required, event.selected);
  }

  isSkillSelected(skill: string, required: boolean): boolean {
    return this.hasFormArrayValue(this.skillArray(required), skill);
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

  tagHue(tag: string): string {
    let hash = 0;
    for (const character of this.normalizeChip(tag)) {
      hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
    }
    return String(Math.abs(hash) % 360);
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
    const requiredSkillNames = this.formArrayValues(this.requiredSkills);
    const preferredSkillNames = this.formArrayValues(this.preferredSkills);
    const skills = this.uniqueLabels([...requiredSkillNames, ...preferredSkillNames]);

    const activity: Activity = {
      id: 0,
      title: raw.title,
      body: raw.description || raw.title,
      description: raw.description || raw.title,
      projectId: Number(raw.project) || 0,
      organisations: this.administeredOrganisations.filter(org => org.id === Number(raw.organization)),
      appointments: [],
      participants: [],
      date: raw.date ? new Date(raw.date) : undefined,
      duration: raw.duration || '',
      expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
      location: raw.location || '',
      coordinates: this.markerPosition || undefined,
      skills,
      requiredSkills: requiredSkillNames.map(skill => this.toSkillRequirement(skill, true)),
      preferredSkills: preferredSkillNames.map(skill => this.toSkillRequirement(skill, false)),
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

    const request = this.activityId
      ? this.activityService.updateActivity(this.activityId, activity)
      : this.activityService.createActivity(activity);

    request.subscribe({
      next: createdActivity => {
        this.snackBar.open(`Activity ${this.activityId ? 'updated' : 'created'}`, 'Close', { duration: 2500 });
        const projectId = Number(raw.project) || 0;
        this.router.navigate(!this.activityId && projectId
          ? ['/projects', projectId]
          : ['/activities', createdActivity.id]);
      },
      error: err => {
        console.error(err);
        this.isSubmitting = false;
        this.snackBar.open(
          this.activityId ? 'Could not save the activity changes.' : 'Could not create the activity.',
          'Close',
          { duration: 3500, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  get isEditing(): boolean {
    return !!this.activityId;
  }

  onOrganisationChange(organisationId: number): void {
    this.activityForm.patchValue({ project: 0 });
    this.loadProjects(Number(organisationId));
  }

  cancel(): void {
    this.router.navigate(this.activityId
      ? ['/activities', this.activityId]
      : this.requestedProjectId ? ['/projects', this.requestedProjectId] : ['/activities']);
  }

  private loadActivity(id: number): void {
    this.activityService.getActivityById(id).subscribe({
      next: activity => {
        const organisationId = activity.organisations?.[0]?.id;
        if (!organisationId || !this.administeredOrganisations.some(org => org.id === organisationId)) {
          this.snackBar.open('You cannot edit this activity.', 'Close', { duration: 3500 });
          this.router.navigate(['/activities', id]);
          return;
        }

        this.activityForm.patchValue({
          title: activity.title,
          date: activity.date ? new Date(activity.date) : '',
          location: activity.location ?? '',
          description: activity.description ?? activity.body,
          duration: activity.duration ?? '',
          capacity: activity.capacity ?? 1,
          organization: organisationId,
          project: activity.projectId ?? 0,
          expiresAt: activity.expiresAt ? new Date(activity.expiresAt) : ''
        });
        this.loadProjects(organisationId, activity.projectId ?? 0);
        this.markerPosition = activity.coordinates ?? null;
        const requiredSkills = activity.requiredSkills?.length
          ? activity.requiredSkills
          : (activity.skills ?? []).map(name => ({
              name,
              minimumProficiency: 'BEGINNER' as const,
              required: true,
            }));
        const preferredSkills = activity.preferredSkills ?? [];
        this.loadedSkillRequirements = new Map(
          [...requiredSkills, ...preferredSkills]
            .map(requirement => [this.normalizeChip(requirement.name), requirement])
        );
        this.replaceFormArray(this.requiredSkills, requiredSkills.map(skill => skill.name));
        this.replaceFormArray(this.preferredSkills, preferredSkills.map(skill => skill.name));
        this.availableSkills = this.mergeSkills(
          this.availableSkills,
          [...requiredSkills, ...preferredSkills].map(skill => skill.name)
        );
        this.replaceFormArray(this.tags, activity.tags ?? []);
        this.replaceFormArray(this.qualifications, activity.qualifications ?? []);
        this.replaceFormArray(this.prerequisites, activity.prerequisites ?? []);
        this.selectedCategoryCodes = new Set((activity.categories ?? []).map(category => category.code));
      },
      error: () => this.router.navigate(['/activities'])
    });
  }

  private loadProjects(organisationId: number, selectedProjectId = 0): void {
    if (!organisationId) {
      this.availableProjects = [];
      this.activityForm.patchValue({ project: 0 });
      return;
    }
    this.projectService.getAllProjects(organisationId).subscribe({
      next: projects => {
        this.availableProjects = (projects ?? []).filter(project => !project.closed);
        const selected = this.availableProjects.some(project => project.id === selectedProjectId)
          ? selectedProjectId
          : 0;
        this.activityForm.patchValue({ project: selected });
      },
      error: () => {
        this.availableProjects = [];
        this.activityForm.patchValue({ project: 0 });
      }
    });
  }

  private replaceFormArray(array: FormArray, values: string[]): void {
    array.clear();
    values.forEach(value => array.push(this.fb.control(value)));
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

  private setSkillSelection(value: string, required: boolean, selected: boolean): void {
    this.setFormArraySelection(this.skillArray(required), value, selected);
    if (selected) {
      this.setFormArraySelection(this.skillArray(!required), value, false);
    }
  }

  private skillArray(required: boolean): FormArray {
    return required ? this.requiredSkills : this.preferredSkills;
  }

  private toSkillRequirement(name: string, required: boolean): ActivitySkillRequirement {
    const key = this.normalizeChip(name);
    const loaded = this.loadedSkillRequirements.get(key);
    const catalog = this.availableSkills.find(skill =>
      this.normalizeChip(skill.name) === key ||
      (skill.alternativeLabels ?? []).some(alias => this.normalizeChip(alias) === key)
    );

    return {
      name,
      escoSkillUri: catalog?.conceptUri ?? loaded?.escoSkillUri,
      minimumProficiency: loaded?.minimumProficiency ?? 'BEGINNER',
      required,
    };
  }

  private mergeSkills(catalog: Skill[], selectedLabels: string[]): Skill[] {
    const skills = new Map<string, Skill>();
    catalog.forEach(skill => skills.set(this.normalizeChip(skill.name), skill));
    selectedLabels.forEach((label, index) => {
      const key = this.normalizeChip(label);
      if (!skills.has(key)) {
        skills.set(key, { id: -(index + 1), name: label, category: 'Custom' });
      }
    });
    return Array.from(skills.values());
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
