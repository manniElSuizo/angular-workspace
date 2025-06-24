import { TestBed } from '@angular/core/testing';
import { OrderCancellationService } from './order-cancellation.service';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { trainSummaryRoundTrip } from './test.mocks';
import { OrderModule } from '../../order.module';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';

describe('OrderCancellationService', () => {
  let service: OrderCancellationService;
  let mockTrainOrderServiceSpy;

  beforeEach(() => {
    mockTrainOrderServiceSpy = jasmine.createSpyObj('TrainorderService', ['getOrderDetailsByTrain', 'postOrderCancellationByTrain', 'getTrainChainDetails']);
    TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot(), OrderModule],
        providers: [
            { provide: MAT_DIALOG_DATA, useValue: trainSummaryRoundTrip },
            { provide: MatDialogRef, useValue: trainSummaryRoundTrip },
            { provide: TrainorderService, useValue: mockTrainOrderServiceSpy },
            { provide: TranslateService, useValue: {}},
            { provide: TranslatePipe, useValue: {}},
            ModalWindows
        ],
    });
    service = TestBed.inject(OrderCancellationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

//   it("should set reloadSubject.next to false on Error", () => {
//     mockTrainOrderServiceSpy.getOrderDetailsByTrain.and.returnValue(orderDetail);
//     mockTrainOrderServiceSpy.getTrainChainDetails.and.returnValue(trainChainDetailsRoundTrip);
//     mockTrainOrderServiceSpy.postOrderCancellationByTrain.and.throwError(HttpErrorResponse);

//     service.reloadSubject.subscribe((b: boolean | undefined | String) => {
//         expect(b).toBeTrue();
//     });
//     expect(service.cancelTrainByTrainSummary(trainSummaryRoundTrip)).toBeTrue();
//     expect(service.reloadSubject.next).toHaveBeenCalledTimes(1);
//   });

//   it("should set reloadSubject.next to true on success", () => {
//     mockTrainOrderServiceSpy.getOrderDetailsByTrain.and.returnValue(orderDetail);
//     mockTrainOrderServiceSpy.getTrainChainDetails.and.returnValue(trainChainDetailsRoundTrip);
//     mockTrainOrderServiceSpy.postOrderCancellationByTrain.and.returnValue(of());

//     service.reloadSubject.subscribe((b: boolean | undefined | String) => {
//         expect(b).toBeTrue();
//     })
//     service.cancelTrainByTrainSummary(trainSummaryRoundTrip);
//   });
});
