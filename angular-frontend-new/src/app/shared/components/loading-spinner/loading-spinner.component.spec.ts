import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the overlay only while loading', () => {
    expect(fixture.nativeElement.querySelector('.loading-overlay')).toBeNull();

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.loading-overlay')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.loading-content').classList).toContain('is-loading');
  });

  it('supports a custom label and spinner diameter', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('label', 'Loading calendar…');
    fixture.componentRef.setInput('diameter', 56);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.loading-ring') as HTMLElement;
    expect(spinner.style.width).toBe('56px');
    expect(spinner.style.height).toBe('56px');
    expect(fixture.nativeElement.querySelector('.loading-label').textContent.trim()).toBe('Loading calendar…');
  });
});