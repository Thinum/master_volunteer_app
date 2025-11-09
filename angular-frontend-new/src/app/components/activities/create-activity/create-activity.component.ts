import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { GoogleMapsModule } from '@angular/google-maps';

interface Friend {
  name: string;
  avatar?: string;
}

interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface ActivityDetail {
  id: number;
  title: string;
  date: Date;
  location: string;
  description: string;
  duration: string;
  skills: string[];
  qualifications: string[];
  prerequisites: string[];
  organization: string;
  createdAt: Date;
  expiresAt: Date;
  friends: Friend[];
  contacts: Contact[];
  orgContacts: Contact[];
}

@Component({
  selector: 'app-create-activity',
  imports: [MatNativeDateModule, MatChipsModule, MatIconModule, MatDatepickerModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule, GoogleMapsModule ],
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.css']
})
export class CreateActivityComponent {
  activityForm: FormGroup;

  center = { lat: 48.3069, lng: 14.2858 }; // Linz, Austria
  zoom = 10;
  markerPosition: google.maps.LatLngLiteral | null = null;

  constructor(private fb: FormBuilder) {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      location: [''],
      description: [''],
      duration: [''],
      skills: this.fb.array([]),
      qualifications: this.fb.array([]),
      prerequisites: this.fb.array([]),
      organization: [''],
      expiresAt: [''],
      friends: this.fb.array([]),
      contacts: this.fb.array([]),
      orgContacts: this.fb.array([])
    });
  }

  // --- Helpers for form arrays ---
  get skills(): FormArray { return this.activityForm.get('skills') as FormArray; }
  get qualifications(): FormArray { return this.activityForm.get('qualifications') as FormArray; }
  get prerequisites(): FormArray { return this.activityForm.get('prerequisites') as FormArray; }

  addSkill(skillInput: HTMLInputElement) {
    const value = skillInput.value.trim();
    if (value) this.skills.push(this.fb.control(value));
    skillInput.value = '';
  }
  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  addQualification(qInput: HTMLInputElement) {
    const value = qInput.value.trim();
    if (value) this.qualifications.push(this.fb.control(value));
    qInput.value = '';
  }
  removeQualification(index: number) {
    this.qualifications.removeAt(index);
  }

  addPrerequisite(pInput: HTMLInputElement) {
    const value = pInput.value.trim();
    if (value) this.prerequisites.push(this.fb.control(value));
    pInput.value = '';
  }
  removePrerequisite(index: number) {
    this.prerequisites.removeAt(index);
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = event.latLng.toJSON();
      const { lat, lng } = this.markerPosition;
      this.activityForm.patchValue({ location: `${lat}, ${lng}` });
    }
  }

  onSubmit() {
    if (this.activityForm.invalid) return;
    const activity: ActivityDetail = {
      id: Date.now(),
      createdAt: new Date(),
      ...this.activityForm.value
    };
    console.log('✅ Created Activity:', activity);
  }
}
