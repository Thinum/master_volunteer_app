import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnreadBadgeComponent } from './unread-badge.component';

describe('UnreadBadgeComponent', () => {
  let component: UnreadBadgeComponent;
  let fixture: ComponentFixture<UnreadBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnreadBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnreadBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
