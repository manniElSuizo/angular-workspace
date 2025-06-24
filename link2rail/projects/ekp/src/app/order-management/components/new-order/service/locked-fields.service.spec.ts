import { TestBed } from '@angular/core/testing';

import { LockedFieldsService } from './locked-fields.service';

describe('LockedFieldsService', () => {
  let service: LockedFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LockedFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
