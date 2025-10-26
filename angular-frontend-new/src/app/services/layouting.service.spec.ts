import { TestBed } from '@angular/core/testing';

import { LayoutingService } from './layouting.service';

describe('LayoutingService', () => {
  let service: LayoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
