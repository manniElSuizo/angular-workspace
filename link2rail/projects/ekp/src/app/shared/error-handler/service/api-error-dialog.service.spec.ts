import { TestBed } from '@angular/core/testing';

import { ErrorDialogService } from './api-error-dialog.service';

describe('ApiErrorDialogService', () => {
  let service: ErrorDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
