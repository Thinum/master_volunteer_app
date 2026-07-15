import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: snackBar }]
    });
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('displays a concise first line instead of a stack trace', () => {
    service.showError('Error: Unable to save changes\n    at saveProfile');

    expect(snackBar.open).toHaveBeenCalledWith(
      'Unable to save changes',
      'Close',
      jasmine.objectContaining({
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      })
    );
  });

  it('hides Angular internals behind a useful generic message', () => {
    service.showError('NG0100: Expression has changed after it was checked');

    expect(snackBar.open).toHaveBeenCalledWith(
      'Something went wrong. Please try again.',
      'Close',
      jasmine.any(Object)
    );
  });
});
