import { TestBed } from '@angular/core/testing';

import { NewOrderWagonDetailDialogService } from './new-order-wagon-detail-dialog.service';

describe('NewOrderWagonDetailDialogService', () => {
  let service: NewOrderWagonDetailDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewOrderWagonDetailDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
