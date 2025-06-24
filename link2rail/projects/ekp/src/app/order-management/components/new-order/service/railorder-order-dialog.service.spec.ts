import { TestBed } from '@angular/core/testing';

import { RailOrderDialogService } from './railorder-order-dialog.service';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';

describe('RailOrderDialogService', () => {
  let service: RailOrderDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, HttpClientModule]
    });
    service = TestBed.inject(RailOrderDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

