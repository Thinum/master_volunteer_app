import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MOCK_SKILLS } from '../../../mock/mock-skills';
import { Skill } from '../../../models/skill.model';
import { InterestCategory } from '../../../models/activity.model';
import { User } from '../../../models/user.model';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { InterestService } from '../../../services/api/interest.service';
import { SkillCatalogService } from '../../../services/api/skill-catalog.service';

const DEFAULT_INTERESTS = [
  'Animals',
  'Environment and Nature',
  'Education and Tutoring',
  'Children and Youth',
  'Elderly Support',
  'Health and Well-being',
  'Emergency and Rescue Services',
  'Sports and Fitness',
  'Outdoor Activities',
  'Arts and Culture',
  'Music',
  'Technology',
  'Crafts and Repair',
  'Food and Cooking',
  'Community and Social Events',
  'Humanitarian Aid',
  'Accessibility and Inclusion',
  'Organisation and Leadership',
];

@Component({
  selector: 'app-user-profile-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-profile-edit.component.html',
  styleUrl: './user-profile-edit.component.css',
})
export class UserProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private volunteerService = inject(VolunteerService);
  private interestService = inject(InterestService);
  private skillCatalogService = inject(SkillCatalogService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  protected availableSkills: Skill[] = [...MOCK_SKILLS];
  protected availableInterests: string[] = [...DEFAULT_INTERESTS];
  private interestCatalog: InterestCategory[] = [];
  protected currentUser?: User;
  protected selectedSkills: string[] = [];
  protected selectedInterests: string[] = [];
  protected isSaving = false;

  protected profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    profilePicture: [''],
  });

  ngOnInit(): void {
    this.skillCatalogService.getSkillCatalog().subscribe({
      next: skills => {
        if (skills.length) {
          this.availableSkills = this.mergeSkills(skills, this.selectedSkills);
        }
      },
      error: () => {
        this.availableSkills = this.mergeSkills(MOCK_SKILLS, this.selectedSkills);
      }
    });

    this.interestService.getInterestCatalog().subscribe({
      next: interests => {
        this.interestCatalog = interests;
        this.setAvailableInterests(interests.length
          ? interests.map(interest => interest.label)
          : this.availableInterests);
      },
      error: () => {
        this.interestService.getAllInterests().subscribe({
          next: interests => {
            this.setAvailableInterests(interests.length
              ? interests.map(interest => this.normalizeInterestName(interest))
              : this.availableInterests);
          },
          error: () => {
            this.setAvailableInterests(DEFAULT_INTERESTS);
          }
        });
      }
    });

    this.volunteerService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.selectedSkills = this.uniqueLabels(this.getSelectedSkillNames(user));
      this.availableSkills = this.mergeSkills(this.availableSkills, this.selectedSkills);
      this.selectedInterests = this.uniqueLabels(this.getSelectedInterestLabels(user));
      this.setAvailableInterests(this.availableInterests);
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        profilePicture: user.profilePicture ?? '',
      });
    });
  }

  protected get profilePicturePreview(): string {
    return this.profileForm.controls.profilePicture.value || 'https://api.dicebear.com/9.x/lorelei/svg/seed=volunteer&size=512';
  }

  protected setSkillSelection(skillName: string, event: MatChipSelectionChange): void {
    this.selectedSkills = this.setSelection(this.selectedSkills, skillName, event.selected);
  }

  protected setInterestSelection(skillName: string, event: MatChipSelectionChange): void {
    this.selectedInterests = this.setSelection(
      this.selectedInterests,
      this.normalizeInterestName(skillName),
      event.selected
    );
  }

  protected isSkillSelected(skillName: string): boolean {
    const normalizedSkill = this.normalizeForComparison(skillName);
    return this.selectedSkills.some(skill => this.normalizeForComparison(skill) === normalizedSkill);
  }

  protected isInterestSelected(skillName: string): boolean {
    const normalizedInterest = this.normalizeForComparison(skillName);
    return this.selectedInterests.some(interest => this.normalizeForComparison(interest) === normalizedInterest);
  }

  protected onPictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.patchValue({ profilePicture: String(reader.result) });
    };
    reader.readAsDataURL(file);
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updatedUser: User = {
      ...this.currentUser,
      ...this.profileForm.getRawValue(),
      skills: this.uniqueLabels(this.selectedSkills),
      skillProfiles: this.uniqueLabels(this.selectedSkills).map(skill => ({
        name: skill,
        escoSkillUri: this.findSkillConceptUri(skill),
        proficiency: this.currentUser?.skillProfiles?.find(profile =>
          this.normalizeForComparison(profile.name) === this.normalizeForComparison(skill)
        )?.proficiency ?? 'INTERMEDIATE'
      })),
      interests: this.uniqueLabels(this.selectedInterests),
      interestCategories: this.uniqueLabels(this.selectedInterests)
        .map(interest => this.findInterestCategory(interest))
        .filter((interest): interest is InterestCategory => !!interest),
    };

    this.volunteerService.updateCurrentUser(updatedUser).subscribe({
      next: () => {
        this.snackBar.open('Profile saved', 'Close', { duration: 2500 });
        this.router.navigate(['/profile']);
      },
      error: err => {
        console.error(err);
        this.isSaving = false;
        this.snackBar.open('Could not save profile', 'Close', { duration: 3500 });
      },
    });
  }

  private setSelection(values: string[], value: string, selected: boolean): string[] {
    const normalizedValue = this.normalizeForComparison(value);
    const alreadySelected = values.some(existing => this.normalizeForComparison(existing) === normalizedValue);

    if (selected && !alreadySelected) {
      return this.uniqueLabels([...values, value]);
    }

    if (!selected && alreadySelected) {
      return values.filter(existing => this.normalizeForComparison(existing) !== normalizedValue);
    }

    return values;
  }

  private normalizeInterestName(value: string): string {
    const trimmed = value.trim().replace(/\s+/g, ' ');
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }

  private getSelectedSkillNames(user: User): string[] {
    const profileSkills = (user.skillProfiles ?? [])
      .map(skill => skill.name)
      .filter((skill): skill is string => !!skill);

    return profileSkills.length ? profileSkills : [...(user.skills ?? [])];
  }

  private getSelectedInterestLabels(user: User): string[] {
    const categoryLabels = (user.interestCategories ?? [])
      .map(interest => interest.label)
      .filter((interest): interest is string => !!interest)
      .map(interest => this.normalizeInterestName(interest));

    return categoryLabels.length
      ? categoryLabels
      : (user.interests ?? []).map(interest => this.normalizeInterestName(interest));
  }

  private setAvailableInterests(values: string[]): void {
    this.availableInterests = this.uniqueLabels([...values, ...this.selectedInterests]);
  }

  private uniqueLabels(values: string[]): string[] {
    const labels = new Map<string, string>();

    values
      .map(value => value?.trim().replace(/\s+/g, ' '))
      .filter((value): value is string => !!value)
      .forEach(value => {
        const normalized = this.normalizeForComparison(value);
        if (!labels.has(normalized)) {
          labels.set(normalized, value);
        }
      });

    return Array.from(labels.values());
  }

  private findInterestCategory(label: string): InterestCategory | undefined {
    const normalizedLabel = this.normalizeForComparison(label);
    return this.interestCatalog.find(interest =>
      this.normalizeForComparison(interest.label) === normalizedLabel ||
      this.normalizeForComparison(interest.code) === normalizedLabel
    );
  }

  private findSkillConceptUri(label: string): string | undefined {
    const normalizedLabel = this.normalizeForComparison(label);
    const catalogSkill = this.availableSkills.find(skill =>
      this.normalizeForComparison(skill.name) === normalizedLabel ||
      (skill.alternativeLabels ?? []).some(alias => this.normalizeForComparison(alias) === normalizedLabel)
    );
    const existingProfile = this.currentUser?.skillProfiles?.find(skill =>
      this.normalizeForComparison(skill.name) === normalizedLabel
    );
    return catalogSkill?.conceptUri ?? existingProfile?.escoSkillUri;
  }

  private mergeSkills(catalog: Skill[], selectedLabels: string[]): Skill[] {
    const skills = new Map<string, Skill>();
    catalog.forEach(skill => skills.set(this.normalizeForComparison(skill.name), skill));
    selectedLabels.forEach((label, index) => {
      const key = this.normalizeForComparison(label);
      if (!skills.has(key)) {
        skills.set(key, { id: -(index + 1), name: label, category: 'Custom' });
      }
    });
    return Array.from(skills.values());
  }

  private normalizeForComparison(value: string): string {
    return value.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  }
}
