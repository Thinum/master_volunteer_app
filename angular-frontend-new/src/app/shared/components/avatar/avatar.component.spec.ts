import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let component: AvatarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AvatarComponent] }).compileComponents();
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
  });

  it('uses up to two initials when no image is available', () => {
    component.name = 'Ada Lovelace';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('AL');
  });

  it('falls back to initials when an image fails to load', () => {
    component.name = 'Grace Hopper';
    component.src = '/missing-avatar.png';
    fixture.detectChanges();

    fixture.debugElement.query(By.css('img')).triggerEventHandler('error');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('img'))).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('GH');
  });

  it('maps named sizes to a shared host size', () => {
    component.size = 'lg';
    fixture.detectChanges();

    expect(fixture.nativeElement.style.getPropertyValue('--app-avatar-size')).toBe('48px');
  });
});
