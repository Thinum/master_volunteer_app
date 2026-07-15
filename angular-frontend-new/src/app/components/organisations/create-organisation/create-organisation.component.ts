import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OrganisationService } from "../../../services/api/organisation.service";
import { Organisation, OrganisationCategory } from "../../../models/organisation.model";
import { GoogleMapsModule } from "@angular/google-maps";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatChipSelectionChange, MatChipsModule } from "@angular/material/chips";
import { MatNativeDateModule } from "@angular/material/core";
import {MatSelectModule} from '@angular/material/select';
import { MOCK_USERS } from "../../../mock/mock-users";
import { User } from "../../../models/user.model";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

const DEFAULT_ORGANISATION_TAGS = [
  'community',
  'education',
  'environment',
  'health',
  'social impact',
  'youth',
  'families',
  'sustainability',
  'inclusion',
  'animals',
  'culture',
  'technology',
  'emergency support',
  'local projects'
];

//TODO: Mock this properly
interface SelectedUserRole {
  userId: number;
  role: string;
}


@Component({
  selector: "app-create-organisation",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatNativeDateModule,
    GoogleMapsModule,
    CommonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: "./create-organisation.component.html",
  styleUrl: "./create-organisation.component.css",
})

export class CreateOrganisationComponent implements OnInit {
  orgForm!: FormGroup;
  availableTags = [...DEFAULT_ORGANISATION_TAGS];
  categories: OrganisationCategory[] = [
    'Technology',
    'Environment',
    'Education',
    'Health',
    'Culture',
    'Social',
    'Community'
  ];
  isSubmitting = false;

  // Map
  center = { lat: 48.3069, lng: 14.2858 };
  zoom = 12;
  marker: google.maps.LatLngLiteral | null = null;

  // Mock users
  availableUsers: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', joinedAt: new Date(), isActive: true },
    { id: 2, name: 'Bob Martin', email: 'bob@example.com', joinedAt: new Date(), isActive: true },
    { id: 3, name: 'Diana King', email: 'diana@example.com', joinedAt: new Date(), isActive: true },
  ];

  roles = ['Contact', 'Admin', 'Manager', 'Support'];
  selectedUserRoles: SelectedUserRole[] = [];

  constructor(
    private fb: FormBuilder,
    private organisationService: OrganisationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.orgForm = this.fb.group({
      orgName: ['', Validators.required],
      body: ['', Validators.required],
      category: [null, Validators.required],
      tags: this.fb.array([]),
      profilePicture: [''],
      locationLat: [null, Validators.required],
      locationLon: [null, Validators.required],
      deactivated: [false],
      users: [[]],
    });

    this.organisationService.getAllOrganisations().subscribe({
      next: organisations => {
        const existingTags = (organisations ?? []).reduce<string[]>(
          (tags, organisation) => [...tags, ...(organisation.tags ?? [])],
          []
        );
        this.availableTags = this.uniqueLabels([...DEFAULT_ORGANISATION_TAGS, ...existingTags]);
      },
      error: () => {
        this.availableTags = [...DEFAULT_ORGANISATION_TAGS];
      }
    });
  }

  get tags(): FormArray {
    return this.orgForm.get('tags') as FormArray;
  }

  addTag(tagInput: HTMLInputElement): void {
    const value = tagInput.value.trim();
    if (value && !this.isTagSelected(value)) {
      this.tags.push(this.fb.control(value));
      this.availableTags = this.uniqueLabels([...this.availableTags, value]);
    }
    tagInput.value = '';
  }

  toggleTag(tag: string, event: MatChipSelectionChange): void {
    const index = this.tags.controls.findIndex(control => this.normalizeTag(control.value) === this.normalizeTag(tag));
    if (event.selected && index < 0) {
      this.tags.push(this.fb.control(tag));
    } else if (!event.selected && index >= 0) {
      this.tags.removeAt(index);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.tags.controls.some(control => this.normalizeTag(control.value) === this.normalizeTag(tag));
  }

  tagHue(tag: string): string {
    let hash = 0;
    for (const character of this.normalizeTag(tag)) {
      hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
    }
    return String(Math.abs(hash) % 360);
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const pos = event.latLng.toJSON();
      this.marker = pos;
      this.orgForm.patchValue({
        locationLat: pos.lat,
        locationLon: pos.lng,
      });
    }
  }

  addUserRole(userId: number, role: string) {
    if (this.selectedUserRoles.some(r => r.userId === userId)) return;
    this.selectedUserRoles.push({ userId, role });
    this.orgForm.patchValue({ users: this.selectedUserRoles });
  }

  removeEntry(index: number) {
    this.selectedUserRoles.splice(index, 1);
    this.orgForm.patchValue({ users: this.selectedUserRoles });
  }

  getUserName(id: number): string {
    const user = this.availableUsers.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  }

  onSubmit() {
    if (this.orgForm.invalid || this.isSubmitting) {
      this.orgForm.markAllAsTouched();
      return;
    }

    const payload: Organisation = {
      id: 0,
      orgName: this.orgForm.value.orgName,
      body: this.orgForm.value.body,
      profilePicture: this.orgForm.value.profilePicture,
      createdAt: new Date(),
      location: {
        lat: this.orgForm.value.locationLat,
        lon: this.orgForm.value.locationLon,
      },
      deactivated: this.orgForm.value.deactivated,
      category: this.orgForm.value.category,
      tags: this.tags.controls.map(control => String(control.value).trim()).filter(Boolean),
      orgContacts: [],
      orgAdmins: []
    };

    this.isSubmitting = true;
    this.organisationService.addOrganisation(payload).subscribe({
      next: organisation => {
        this.snackBar.open('Organization created successfully.', 'Close', { duration: 3000 });
        this.router.navigate(['/organisations', organisation.id]);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('The organization could not be created. Please try again.', 'Close', { duration: 4500 });
      }
    });
  }

  private normalizeTag(value: unknown): string {
    return String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  }

  private uniqueLabels(values: string[]): string[] {
    const unique = new Map<string, string>();
    for (const value of values) {
      const label = String(value ?? '').trim();
      if (label) unique.set(this.normalizeTag(label), label);
    }
    return [...unique.values()].sort((a, b) => a.localeCompare(b));
  }
}
