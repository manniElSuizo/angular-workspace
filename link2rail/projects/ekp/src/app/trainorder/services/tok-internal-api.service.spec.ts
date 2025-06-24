import { TestBed } from '@angular/core/testing';

import { TokInternalApiService } from './tok-internal-api.service';
import { HttpClientModule } from '@angular/common/http';

describe('TokInternalApiService', () => {
  let service: TokInternalApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(TokInternalApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
