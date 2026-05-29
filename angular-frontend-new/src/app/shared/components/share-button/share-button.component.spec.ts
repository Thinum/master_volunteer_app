import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareButtonComponent } from './share-button.component';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { of, throwError } from 'rxjs';
import { User } from '../../../models/user.model';

describe('ShareButtonComponent', () => {
  let component: ShareButtonComponent;
  let fixture: ComponentFixture<ShareButtonComponent>;
  let volunteerServiceSpy: jasmine.SpyObj<VolunteerService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let clipboardSpy: jasmine.SpyObj<Clipboard>;

  beforeEach(async () => {
    volunteerServiceSpy = jasmine.createSpyObj('VolunteerService', ['getCurrentUser']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);

    await TestBed.configureTestingModule({
      imports: [ShareButtonComponent],
      providers: [
        { provide: VolunteerService, useValue: volunteerServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Clipboard, useValue: clipboardSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShareButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy URL with user ID when share is clicked', () => {
    const mockUser: User = { id: 123, name: 'Test User', email: 'test@example.com', joinedAt: new Date() };
    volunteerServiceSpy.getCurrentUser.and.returnValue(of(mockUser));
    clipboardSpy.copy.and.returnValue(true);

    component.share();

    expect(volunteerServiceSpy.getCurrentUser).toHaveBeenCalled();
    expect(clipboardSpy.copy).toHaveBeenCalledWith(jasmine.stringMatching(/userId=123/));
    expect(snackBarSpy.open).toHaveBeenCalledWith('Link with your ID copied to clipboard!', 'Close', jasmine.any(Object));
  });

  it('should copy current URL without user ID if service fails', () => {
    volunteerServiceSpy.getCurrentUser.and.returnValue(throwError(() => new Error('Service Error')));
    clipboardSpy.copy.and.returnValue(true);

    component.share();

    expect(clipboardSpy.copy).toHaveBeenCalledWith(window.location.href);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Link copied to clipboard!', 'Close', jasmine.any(Object));
  });
});
