import { TestBed } from '@angular/core/testing';
import { FileExportService } from './file-export.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateOrderInternalStatusPipe } from '../../pipes/translate-order-internal-status.pipe';
import { TranslateWagonStatusPipe } from '../../pipes/translate-wagon-status.pipe';
import { TranslateOrderStatusPipe } from '../../pipes/translate-order-status.pipe';

import { SharedModule } from '../../shared.module';

class MockTranslateWagonStatusPipe {
  transform(value: any): any {
    return `Mocked: ${value}`;
  }
}

class MockTranslateOrderStatusPipe {
  transform(value: any): any {
    return `Mocked: ${value}`;
  }
}

class MockTranslateOrderInternalStatusPipe {
  transform(value: any): any {
    return `Mocked: ${value}`;
  }
}
describe('FileExportService', () => {
  let service: FileExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), SharedModule],
      providers: [
        FileExportService,
        TranslateOrderInternalStatusPipe,
        // Use mock classes for pipes
        { provide: TranslateWagonStatusPipe, useClass: MockTranslateWagonStatusPipe },
        { provide: TranslateOrderStatusPipe, useClass: MockTranslateOrderStatusPipe },
        { provide: TranslateOrderInternalStatusPipe, useClass: MockTranslateOrderInternalStatusPipe }

      ]
    });
    service = TestBed.inject(FileExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply mocked transformation for wagon status', () => {
    const pipe = TestBed.inject(TranslateWagonStatusPipe);
    const result = pipe.transform('ACTIVE');
    expect(result).toBe('Mocked: ACTIVE'); // Check if the mock transformation works
  });

  it('should apply mocked transformation for order status', () => {
    const pipe = TestBed.inject(TranslateOrderStatusPipe);
    const result = pipe.transform('CLOSED');
    expect(result).toBe('Mocked: CLOSED'); // Check if the mock transformation works
  });
});