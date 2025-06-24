import { TestBed } from '@angular/core/testing';

import { WagonviewService } from './wagonview.service';
import { HttpClientModule } from '@angular/common/http';

describe('WagonviewService', () => {
  let service: WagonviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(WagonviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
