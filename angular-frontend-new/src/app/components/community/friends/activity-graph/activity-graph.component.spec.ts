import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityGraphComponent } from './activity-graph.component';
import { provideRouter } from '@angular/router';

describe('ActivityGraphComponent', () => {
  let component: ActivityGraphComponent;
  let fixture: ComponentFixture<ActivityGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityGraphComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle activity visibility and rebuild graph', () => {
    const initialSize = component.selectedActivities.size;
    // Toggle off
    component.toggleActivity(1);
    expect(component.selectedActivities.size).toBe(initialSize - 1);
    expect(component.selectedActivities.has(1)).toBeFalse();

    // Toggle on
    component.toggleActivity(1);
    expect(component.selectedActivities.size).toBe(initialSize);
    expect(component.selectedActivities.has(1)).toBeTrue();
  });
});
