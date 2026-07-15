import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationListComponent } from './organisation-list.component';
import { Organisation } from '../../../../models/organisation.model';

describe('OrganisationListComponent', () => {
  let component: OrganisationListComponent;
  let fixture: ComponentFixture<OrganisationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('matches tags against normalized interest aliases and exact skills', () => {
    component.userInterestMatchLabels = ['coding', 'First aid'];
    component.userSkillMatchLabels = ['Digital_Skills'];

    expect(component.isUserMatchedTag('coding mentorship')).toBeTrue();
    expect(component.isUserMatchedTag(' first   aid ')).toBeTrue();
    expect(component.isUserMatchedTag('digital-skills')).toBeTrue();
    expect(component.isUserMatchedTag('advanced digital skills')).toBeFalse();
    expect(component.isUserMatchedTag('mentorship')).toBeFalse();
  });

  it('keeps matching tags visible when an organisation has more than three tags', () => {
    component.userInterestMatchLabels = ['Matching interest'];
    const organisation = {
      tags: ['First', 'Second', 'Third', 'Matching-interest']
    } as Organisation;

    expect(component.getVisibleTags(organisation)).toContain('Matching-interest');
  });
});
