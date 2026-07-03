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
import { User } from '../../../models/user.model';
import { VolunteerService } from '../../../services/api/volunteer.service';

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
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  protected readonly availableSkills: Skill[] = MOCK_SKILLS;
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
    this.volunteerService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.selectedSkills = [...(user.skills ?? [])];
      this.selectedInterests = [...(user.interests ?? [])];
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
    this.selectedInterests = this.setSelection(this.selectedInterests, skillName, event.selected);
  }

  protected isSkillSelected(skillName: string): boolean {
    return this.selectedSkills.includes(skillName);
  }

  protected isInterestSelected(skillName: string): boolean {
    return this.selectedInterests.includes(skillName);
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
      skills: this.selectedSkills,
      interests: this.selectedInterests,
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
    const alreadySelected = values.includes(value);

    if (selected && !alreadySelected) {
      return [...values, value];
    }

    if (!selected && alreadySelected) {
      return values.filter(existing => existing !== value);
    }

    return values;
  }
}
