import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesSmallCardComponent } from './activities-small-card.component';

describe('ActivitiesSmallCardComponent', () => {
  let component: ActivitiesSmallCardComponent;
  let fixture: ComponentFixture<ActivitiesSmallCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesSmallCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitiesSmallCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
