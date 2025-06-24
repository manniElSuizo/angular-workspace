import { TestBed } from '@angular/core/testing';

import { FormFieldService } from './form-field.service';
import { HttpClientModule } from '@angular/common/http';

describe('FormFieldService', () => {
  let service: FormFieldService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(FormFieldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
