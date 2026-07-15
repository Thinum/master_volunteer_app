import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrganisationAdminAssignment } from '../../../models/organisation-admin-assignment.model';
import { User } from '../../../models/user.model';
import { OrganisationAdminAssignmentService } from '../../../services/api/organisation-admin-assignment.service';

@Component({
  selector: 'app-organisation-admin-assignments',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './organisation-admin-assignments.component.html',
  styleUrl: './organisation-admin-assignments.component.css'
})
export class OrganisationAdminAssignmentsComponent implements OnInit {
  assignments: OrganisationAdminAssignment[] = [];
  selectedAdminIds = new Map<number, Set<number>>();
  savingOrganisationId?: number;
  loading = true;

  constructor(
    private readonly assignmentService: OrganisationAdminAssignmentService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.assignmentService.getAssignments().subscribe({
      next: assignments => {
        this.assignments = assignments;
        assignments.forEach(assignment => this.setSelection(assignment));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('You do not have access to organization admin assignments.', 'Close', {
          duration: 4000
        });
      }
    });
  }

  isSelected(organisationId: number, adminId: number): boolean {
    return this.selectedAdminIds.get(organisationId)?.has(adminId) ?? false;
  }

  toggleAdmin(organisationId: number, adminId: number, change: MatCheckboxChange): void {
    const selected = this.selectedAdminIds.get(organisationId) ?? new Set<number>();
    change.checked ? selected.add(adminId) : selected.delete(adminId);
    this.selectedAdminIds.set(organisationId, selected);
  }

  save(assignment: OrganisationAdminAssignment): void {
    this.savingOrganisationId = assignment.organisationId;
    const adminIds = Array.from(this.selectedAdminIds.get(assignment.organisationId) ?? []);

    this.assignmentService.updateAssignments(assignment.organisationId, adminIds).subscribe({
      next: updated => {
        const index = this.assignments.findIndex(item => item.organisationId === updated.organisationId);
        if (index >= 0) {
          this.assignments[index] = updated;
        }
        this.setSelection(updated);
        this.savingOrganisationId = undefined;
        this.snackBar.open('Admin assignments saved.', 'Close', { duration: 2500 });
      },
      error: () => {
        this.savingOrganisationId = undefined;
        this.snackBar.open('Could not save admin assignments.', 'Close', { duration: 3500 });
      }
    });
  }

  adminLabel(admin: User): string {
    return admin.name || admin.username || admin.email;
  }

  private setSelection(assignment: OrganisationAdminAssignment): void {
    const availableAdminIds = new Set(assignment.availableAdmins.map(admin => admin.id));
    this.selectedAdminIds.set(
      assignment.organisationId,
      new Set(assignment.admins
        .filter(admin => availableAdminIds.has(admin.id))
        .map(admin => admin.id))
    );
  }
}
