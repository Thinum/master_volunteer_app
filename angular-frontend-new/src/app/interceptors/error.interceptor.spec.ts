import { TestBed } from '@angular/core/testing';
import { ErrorInterceptor } from './error.interceptor';
import { ErrorService } from '../services/errorService/error.service';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let errorServiceMock: any;

  beforeEach(() => {
    errorServiceMock = jasmine.createSpyObj('ErrorService', ['showError']);
    TestBed.configureTestingModule({
      providers: [
        ErrorInterceptor,
        { provide: ErrorService, useValue: errorServiceMock }
      ]
    });
    interceptor = TestBed.inject(ErrorInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
