import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsGraphComponent } from './friends-graph.component';

describe('FriendsGraphComponent', () => {
  let component: FriendsGraphComponent;
  let fixture: ComponentFixture<FriendsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
