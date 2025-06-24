import { TestBed } from '@angular/core/testing';

import { WagonDataCommunicationService } from './wagon-data-communication.service';

describe('WagonDataCommunicationService', () => {
  let service: WagonDataCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WagonDataCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
