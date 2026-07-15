import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Project } from '../../../models/project.model';
import { Activity } from '../../../models/activity.model';
import { OrganisationService } from '../../../services/api/organisation.service';
import { ProjectService } from '../../../services/api/project.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule, RouterLink],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
  detailedProject?: Project;
  activities: Activity[] = [];
  canManage = false;
  isLoading = true;
  private id = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectService: ProjectService,
    private readonly organisationService: OrganisationService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id) {
      return;
    }

    forkJoin({
      project: this.projectService.getProjectById(this.id),
      activities: this.projectService.getProjectActivities(this.id)
    }).subscribe({
      next: ({ project, activities }) => {
        this.detailedProject = project;
        this.activities = activities ?? [];
        this.isLoading = false;
        this.organisationService.getAdministeredOrganisations().subscribe({
          next: organisations => {
            this.canManage = organisations.some(org => org.id === project.organisationId);
          },
          error: () => this.canManage = false
        });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Could not load this project.', 'Close', { duration: 3500 });
        this.router.navigate(['/organisations']);
      }
    });
  }

  get locationLabel(): string {
    const location = this.detailedProject?.location;
    return location ? `${location.lat}, ${location.lon}` : 'No location provided';
  }

  get statusLabel(): string {
    const project = this.detailedProject;
    if (!project) return '';
    if (project.closed) return 'Closed';
    if (!project.startDate || !project.endDate) return 'Open';
    const today = this.startOfDay(new Date());
    const start = this.parseDate(project.startDate);
    const end = this.parseDate(project.endDate);
    if (today < start) return 'Upcoming';
    if (today > end) return 'Ended';
    return 'Active';
  }

  get timeframeProgress(): number {
    const project = this.detailedProject;
    if (!project?.startDate || !project.endDate) return 0;
    const start = this.parseDate(project.startDate).getTime();
    const end = this.parseDate(project.endDate).getTime();
    const now = this.startOfDay(new Date()).getTime();
    if (end <= start) return now >= end ? 100 : 0;
    return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  }

  get completedActivities(): number {
    return this.activities.filter(activity => activity.status === 'finished').length;
  }

  getSpotsTaken(activity: Activity): number {
    return activity.spotsTaken ?? activity.participants?.length ?? 0;
  }

  createActivity(): void {
    const project = this.detailedProject;
    if (!project) return;
    this.router.navigate(['/createActivity'], {
      queryParams: { organisationId: project.organisationId, projectId: project.id }
    });
  }

  editProject(): void {
    this.router.navigate(['/projects', this.id, 'edit']);
  }

  deleteProject(): void {
    if (!this.canManage || !window.confirm('Delete this project?')) {
      return;
    }
    this.projectService.deleteProject(this.id).subscribe({
      next: () => {
        this.snackBar.open('Project deleted.', 'Close', { duration: 2500 });
        this.router.navigate(['/organisations']);
      },
      error: () => this.snackBar.open('Could not delete project.', 'Close', { duration: 3500 })
    });
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
}
