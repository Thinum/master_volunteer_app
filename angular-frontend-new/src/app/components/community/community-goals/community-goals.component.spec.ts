import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { CommunityGoalService } from '../../../services/api/community-goal.service';
import { InterestService } from '../../../services/api/interest.service';
import { OrganisationService } from '../../../services/api/organisation.service';
import { CommunityGoalsComponent } from './community-goals.component';

describe('CommunityGoalsComponent', () => {
  let component: CommunityGoalsComponent;
  let fixture: ComponentFixture<CommunityGoalsComponent>;
  let engagementAccess$: Subject<any>;
  let communityGoalService: jasmine.SpyObj<CommunityGoalService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    engagementAccess$ = new Subject();
    communityGoalService = jasmine.createSpyObj<CommunityGoalService>(
      'CommunityGoalService',
      ['getGoalsForOrganisation', 'getGoalById', 'createGoal', 'updateGoal']
    );
    communityGoalService.getGoalsForOrganisation.and.returnValue(of([{
      id: 5,
      title: 'Test goal',
      targetValue: 3
    } as any]));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [CommunityGoalsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({ organisationId: '7' })) }
        },
        { provide: CommunityGoalService, useValue: communityGoalService },
        {
          provide: InterestService,
          useValue: jasmine.createSpyObj('InterestService', {
            getAllInterests: of([])
          })
        },
        {
          provide: OrganisationService,
          useValue: jasmine.createSpyObj('OrganisationService', {
            getEngagementLevels: engagementAccess$.asObservable()
          })
        },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps goals visible but disables management controls without access', () => {
    engagementAccess$.next({ canManageActivitiesAndGoals: false });
    fixture.detectChanges();

    const addButton: HTMLButtonElement = fixture.nativeElement.querySelector('.goals-add-btn');
    const editButton: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Edit goal"]');

    expect(component.goals.length).toBe(1);
    expect(addButton.disabled).toBeTrue();
    expect(editButton.disabled).toBeTrue();

    component.goToCreateGoal();
    component.goToEditGoal(component.goals[0]);
    component.onCreateGoal();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(communityGoalService.createGoal).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('enables goal management controls when organization access allows it', () => {
    engagementAccess$.next({ canManageActivitiesAndGoals: true });
    fixture.detectChanges();

    const addButton: HTMLButtonElement = fixture.nativeElement.querySelector('.goals-add-btn');
    const editButton: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Edit goal"]');

    expect(addButton.disabled).toBeFalse();
    expect(editButton.disabled).toBeFalse();

    component.goToCreateGoal();
    expect(router.navigate).toHaveBeenCalledWith(['/community-goals'], {
      queryParams: { organisationId: 7, mode: 'create' }
    });
  });
});
