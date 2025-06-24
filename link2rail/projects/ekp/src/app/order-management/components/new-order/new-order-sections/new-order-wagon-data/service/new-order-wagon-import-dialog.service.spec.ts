import { TestBed } from '@angular/core/testing';

import { NewOrderWagonImportDialogService } from './new-order-wagon-import-dialog.service';

describe('NewOrderWagonImportDialogService', () => {
  let service: NewOrderWagonImportDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewOrderWagonImportDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
