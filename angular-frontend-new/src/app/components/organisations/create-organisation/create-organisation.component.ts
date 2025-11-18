import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OrganisationService } from "../../../services/api/organisation.service";
import { Organisation } from "../../../models/organisation.model";
import { GoogleMapsModule } from "@angular/google-maps";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatNativeDateModule } from "@angular/material/core";
import {MatSelectModule} from '@angular/material/select';
import { MOCK_USERS } from "../../../mock/mock-users";
import { User } from "../../../models/user.model";

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
    MatSelectModule
  ],
  templateUrl: "./create-organisation.component.html",
  styleUrl: "./create-organisation.component.css",
})

export class CreateOrganisationComponent {
  orgForm!: FormGroup;

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

  constructor(private fb: FormBuilder, private organisationService: OrganisationService) {}

  ngOnInit(): void {
    this.orgForm = this.fb.group({
      orgName: ['', Validators.required],
      body: ['', Validators.required],
      profilePicture: [''],
      locationLat: [null, Validators.required],
      locationLon: [null, Validators.required],
      deactivated: [false],
      users: [[]],
    });
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
    if (this.orgForm.invalid) return;

    const payload = {
      orgName: this.orgForm.value.orgName,
      body: this.orgForm.value.body,
      profilePicture: this.orgForm.value.profilePicture,
      location: {
        lat: this.orgForm.value.locationLat,
        lon: this.orgForm.value.locationLon,
      },
      deactivated: this.orgForm.value.deactivated,
      users: this.selectedUserRoles.map(entry => {
        const user = this.availableUsers.find(u => u.id === entry.userId)!;
        return { ...user, role: entry.role };
      }),
    };

    console.log('Organisation payload:', payload);
    alert('Organisation created! Check console for payload.');
    this.orgForm.reset();
    this.marker = null;
    this.selectedUserRoles = [];
  }
}
