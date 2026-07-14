import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Organisation } from '../../../models/organisation.model';
import { Project } from '../../../models/project.model';
import { OrganisationService } from '../../../services/api/organisation.service';
import { ProjectService } from '../../../services/api/project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
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

  readonly projectForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    organisationId: [0, Validators.min(1)],
    latitude: [null as number | null],
    longitude: [null as number | null],
    closed: [false]
  });

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
      },
      error: () => this.router.navigate(['/organisations'])
    });
  }

  get isEditing(): boolean {
    return !!this.projectId;
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
          latitude: project.location?.lat ?? null,
          longitude: project.location?.lon ?? null,
          closed: project.closed
        });
      },
      error: () => this.router.navigate(['/organisations'])
    });
  }
}
