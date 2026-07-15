import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { User } from '../../../models/user.model';
import { OrganisationAdminAssignmentService } from '../../../services/api/organisation-admin-assignment.service';
import { OrganisationAdminAssignmentsComponent } from './organisation-admin-assignments.component';

describe('OrganisationAdminAssignmentsComponent', () => {
  let fixture: ComponentFixture<OrganisationAdminAssignmentsComponent>;
  let component: OrganisationAdminAssignmentsComponent;
  let assignmentService: jasmine.SpyObj<OrganisationAdminAssignmentService>;

  const member: User = {
    id: 1,
    name: 'Organisation Member',
    email: 'member@example.com',
    joinedAt: new Date()
  };
  const outsider: User = {
    id: 2,
    name: 'Outside User',
    email: 'outsider@example.com',
    joinedAt: new Date()
  };

  beforeEach(async () => {
    assignmentService = jasmine.createSpyObj<OrganisationAdminAssignmentService>(
      'OrganisationAdminAssignmentService',
      ['getAssignments', 'updateAssignments']
    );
    assignmentService.getAssignments.and.returnValue(of([{
      organisationId: 10,
      organisationName: 'Test Organisation',
      admins: [member, outsider],
      availableAdmins: [member]
    }]));

    await TestBed.configureTestingModule({
      imports: [OrganisationAdminAssignmentsComponent],
      providers: [
        { provide: OrganisationAdminAssignmentService, useValue: assignmentService },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationAdminAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows and selects only users who are members of the organisation', () => {
    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain(member.email);
    expect(content).not.toContain(outsider.email);
    expect(component.isSelected(10, member.id)).toBeTrue();
    expect(component.isSelected(10, outsider.id)).toBeFalse();
  });
});
