import { TestBed } from '@angular/core/testing';

import { WagonholderService } from './wagonholder.service';
import { HttpClientModule } from '@angular/common/http';

describe('WagonholderService', () => {
  let service: WagonholderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule]
    });
    service = TestBed.inject(WagonholderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
