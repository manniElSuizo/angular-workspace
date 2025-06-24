import { TrainorderService } from "@src/app/trainorder/services/trainorder.service";
import { TrainDetailsService } from "./train-details.service";
import { ModalWindows } from "../../modal-windows/modal-windows";
import { TestBed } from "@angular/core/testing";
import { HttpClientModule } from "@angular/common/http";
import { trainDetailMock1, trainSummary1, trainChainMock, trainSummary4TrainChain } from "@src/app/trainorder/mockup/TrainItemMock";
import { of } from "rxjs";
import { TranslateModule } from "@ngx-translate/core";
import { TrainRemarksComponent } from "@src/app/trainorder/train-remarks/train-remarks.component";
import { TrainDetailsComponent } from "../train-details.component";
import { DatePipe } from "@angular/common";
import { DateTimePipe } from "@src/app/shared/pipes/date-time.pipe";
import { SharedModule } from "@src/app/shared/shared.module";

describe('TrainDetailsService', () => {
    let service: TrainDetailsService;
    let trainorderServiceMock;

    beforeEach(() => {
        trainorderServiceMock = jasmine.createSpyObj(['getTrainInfo', 'getTrainChainDetails']);
        trainorderServiceMock.getTrainInfo.and.returnValue(of(trainDetailMock1));
        trainorderServiceMock.getTrainChainDetails.and.returnValue(of(trainChainMock));
        TestBed.configureTestingModule(
            {
                providers: [
                    DatePipe,
                    DateTimePipe,
                    TrainDetailsService,
                    {
                        provide: TrainorderService,
                        useValue: trainorderServiceMock
                    },
                    ModalWindows
                ],
                imports: [
                    DatePipe,
                    HttpClientModule,
                    TranslateModule.forRoot(),
                    SharedModule
                ],
                declarations: [
                    DateTimePipe,
                    TrainRemarksComponent                ]
            }
        );

        service = TestBed.inject(TrainDetailsService);
    });

    afterEach(() => {
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call TrainOrderService.getTrainInfo once when calling trainRemarks with single train', () => {
        service.trainRemarks(trainSummary1);
        expect(trainorderServiceMock.getTrainInfo).toHaveBeenCalledTimes(1);
        expect(trainorderServiceMock.getTrainChainDetails).toHaveBeenCalledTimes(0);
    });

    it('should call TrainOrderService.getTrainChainDetails once when calling trainRemarks with train chain', () => {
        service.trainRemarks(trainSummary4TrainChain);
        expect(trainorderServiceMock.getTrainInfo).toHaveBeenCalledTimes(0);
        expect(trainorderServiceMock.getTrainChainDetails).toHaveBeenCalledTimes(1);
    });

    it('should call TrainOrderService.getTrainInfo once when calling trainDetails with single train', () => {
        service.trainDetails(trainSummary1);
        expect(trainorderServiceMock.getTrainInfo).toHaveBeenCalledTimes(1);
        expect(trainorderServiceMock.getTrainChainDetails).toHaveBeenCalledTimes(0);
    });

    it('should call TrainOrderService.getTrainChainDetails once when calling trainDetails with train chain', () => {
        service.trainDetails(trainSummary4TrainChain);
        expect(trainorderServiceMock.getTrainInfo).toHaveBeenCalledTimes(0);
        expect(trainorderServiceMock.getTrainChainDetails).toHaveBeenCalledTimes(1);
    });
});
