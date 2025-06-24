import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TrainorderService } from './trainorder.service';

describe('TrainorderService', () => {
  let service: TrainorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientModule, RouterTestingModule],
        providers: [TrainorderService]
    });
    service = TestBed.inject(TrainorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
