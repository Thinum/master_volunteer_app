import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { Organisation } from '../../../models/organisation.model';
import { Project } from '../../../models/project.model';
import { OrganisationService } from '../../../services/api/organisation.service';
import { ProjectService } from '../../../services/api/project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  administeredOrganisations: Organisation[] = [];
  projectId?: number;
  isSubmitting = false;
  mapCenter: google.maps.LatLngLiteral = { lat: 48.3069, lng: 14.2858 };
  mapZoom = 11;
  markerPosition: google.maps.LatLngLiteral | null = null;

  readonly projectForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.maxLength(2000)],
    organisationId: [0, Validators.min(1)],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
    latitude: [null as number | null],
    longitude: [null as number | null],
    closed: [false]
  }, { validators: [this.validDateRange] });

  constructor(
    private readonly route: ActivatedRoute,
    readonly router: Router,
    private readonly projectService: ProjectService,
    private readonly organisationService: OrganisationService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    this.projectId = routeId > 0 ? routeId : undefined;
    const requestedOrganisationId = Number(this.route.snapshot.queryParamMap.get('organisationId'));

    this.organisationService.getAdministeredOrganisations().subscribe({
      next: organisations => {
        this.administeredOrganisations = organisations ?? [];
        if (!this.administeredOrganisations.length) {
          this.snackBar.open('Only organization admins can manage projects.', 'Close', { duration: 3500 });
          this.router.navigate(['/organisations']);
          return;
        }

        if (this.projectId) {
          this.loadProject(this.projectId);
          return;
        }

        const selected = this.administeredOrganisations.some(org => org.id === requestedOrganisationId)
          ? requestedOrganisationId
          : this.administeredOrganisations[0].id;
        this.projectForm.patchValue({ organisationId: selected });
        this.centerMapOnOrganisation(selected);
      },
      error: () => this.router.navigate(['/organisations'])
    });
  }

  get isEditing(): boolean {
    return !!this.projectId;
  }

  get selectedOrganisation(): Organisation | undefined {
    const organisationId = this.projectForm.controls.organisationId.value;
    return this.administeredOrganisations.find(organisation => organisation.id === organisationId);
  }

  get descriptionLength(): number {
    return this.projectForm.controls.description.value?.length ?? 0;
  }

  get coordinateLabel(): string {
    if (!this.markerPosition) {
      return 'No project location selected';
    }
    return `${this.markerPosition.lat.toFixed(5)}, ${this.markerPosition.lng.toFixed(5)}`;
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) {
      return;
    }
    this.markerPosition = event.latLng.toJSON();
    this.projectForm.patchValue({
      latitude: this.markerPosition.lat,
      longitude: this.markerPosition.lng
    });
  }

  onOrganisationChange(organisationId: number): void {
    if (!this.markerPosition) {
      this.centerMapOnOrganisation(Number(organisationId));
    }
  }

  clearLocation(): void {
    this.markerPosition = null;
    this.projectForm.patchValue({ latitude: null, longitude: null });
    const organisationId = this.projectForm.controls.organisationId.value;
    if (organisationId) {
      this.centerMapOnOrganisation(organisationId);
    }
  }

  onSubmit(): void {
    if (this.projectForm.invalid || this.isSubmitting) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const value = this.projectForm.getRawValue();
    const project: Project = {
      id: this.projectId ?? 0,
      title: value.title?.trim() ?? '',
      description: value.description?.trim() ?? '',
      organisationId: value.organisationId ?? 0,
      startDate: this.toDateOnly(value.startDate),
      endDate: this.toDateOnly(value.endDate),
      location: value.latitude != null && value.longitude != null
        ? { lat: value.latitude, lon: value.longitude }
        : undefined,
      closed: !!value.closed
    };

    const request = this.projectId
      ? this.projectService.updateProject(this.projectId, project)
      : this.projectService.createProject(project);

    request.subscribe({
      next: saved => {
        this.snackBar.open(`Project ${this.isEditing ? 'updated' : 'created'}.`, 'Close', { duration: 2500 });
        this.router.navigate(['/projects', saved.id]);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Could not save project.', 'Close', { duration: 3500 });
      }
    });
  }

  private loadProject(id: number): void {
    this.projectService.getProjectById(id).subscribe({
      next: project => {
        if (!this.administeredOrganisations.some(org => org.id === project.organisationId)) {
          this.snackBar.open('You cannot edit this project.', 'Close', { duration: 3500 });
          this.router.navigate(['/projects', id]);
          return;
        }
        this.projectForm.patchValue({
          title: project.title,
          description: project.description,
          organisationId: project.organisationId,
          startDate: this.fromDateOnly(project.startDate),
          endDate: this.fromDateOnly(project.endDate),
          latitude: project.location?.lat ?? null,
          longitude: project.location?.lon ?? null,
          closed: project.closed
        });
        if (project.location) {
          this.markerPosition = { lat: project.location.lat, lng: project.location.lon };
          this.mapCenter = this.markerPosition;
          this.mapZoom = 14;
        } else {
          this.centerMapOnOrganisation(project.organisationId);
        }
      },
      error: () => this.router.navigate(['/organisations'])
    });
  }

  cancel(): void {
    const organisationId = this.projectForm.controls.organisationId.value;
    this.router.navigate(this.projectId
      ? ['/projects', this.projectId]
      : organisationId ? ['/organisations', organisationId] : ['/organisations']);
  }

  private validDateRange(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value as Date | null;
    const endDate = control.get('endDate')?.value as Date | null;
    return startDate && endDate && endDate < startDate ? { dateRange: true } : null;
  }

  private centerMapOnOrganisation(organisationId: number): void {
    const organisation = this.administeredOrganisations.find(candidate => candidate.id === organisationId);
    if (!organisation?.location) {
      return;
    }
    this.mapCenter = { lat: organisation.location.lat, lng: organisation.location.lon };
    this.mapZoom = 12;
  }

  private toDateOnly(date: Date | null): string {
    if (!date) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromDateOnly(value?: string): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
