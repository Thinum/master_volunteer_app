import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityGoalsComponent } from './community-goals.component';

describe('CommunityGoalsComponent', () => {
  let component: CommunityGoalsComponent;
  let fixture: ComponentFixture<CommunityGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityGoalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
