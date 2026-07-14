import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../models/project.model';
import { OrganisationService } from '../../../services/api/organisation.service';
import { ProjectService } from '../../../services/api/project.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
  detailedProject?: Project;
  canManage = false;
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

    this.projectService.getProjectById(this.id).subscribe(project => {
      this.detailedProject = project;
      this.organisationService.getAdministeredOrganisations().subscribe({
        next: organisations => {
          this.canManage = organisations.some(org => org.id === project.organisationId);
        },
        error: () => this.canManage = false
      });
    });
  }

  get locationLabel(): string {
    const location = this.detailedProject?.location;
    return location ? `${location.lat}, ${location.lon}` : 'No location provided';
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
}
