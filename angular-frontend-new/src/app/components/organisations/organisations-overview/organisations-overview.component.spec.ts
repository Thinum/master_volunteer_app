import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationsOverviewComponent } from './organisations-overview.component';

describe('OrganisationsOverviewComponent', () => {
  let component: OrganisationsOverviewComponent;
  let fixture: ComponentFixture<OrganisationsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
