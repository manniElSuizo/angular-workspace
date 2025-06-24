import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { OrderDetails, OrderItem } from '@src/app/trainorder/models/ApiOrders.model';
import { HttpErrorResponse } from "@angular/common/http";
import { TrainChainIdentifier, TrainIdentifier } from '@src/app/trainorder/models/ApiTrainsList.models';
import moment from 'moment';
import { TrainChain } from '@src/app/trainorder/models/ApiTrainsDetail.model';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrderDetailsModule } from '../order-details/order-details.module';

export enum ClosingType {
    CLOSE_ON_ERROR = "CLOSE_ON_ERROR",
    CLOSE_ON_CANCEL_CANCELLATION = "CLOSE_ON_CANCEL_CANCELLATION",
};

export interface CancellationTrainSummary {
    trainChainIdentifier: TrainChainIdentifier;
    trains: TrainIdentifier[];
}

enum ParameterType {
    TRAIN_SUMMARY,
    TRAIN_IDENTIFIER,
    ORDER_ITEM
}
@Component({
    selector: 'app-order-cancelation',
    templateUrl: './order-cancellation.component.html',
    styleUrls: ['./order-cancellation.component.scss'],
    standalone: true,
    imports: [
        SharedModule,
        MatDialogModule,
        OrderDetailsModule
    ]
})
export class OrderCancellationComponent implements OnInit {

    @ViewChild("arrowIcon") arrowIcon: ElementRef;
    @ViewChild("orderDetailsArea") orderDetailsArea: ElementRef;

    protected cancelForm: FormGroup;
    protected error: string = '';
    protected loadingInProgress: boolean = false;
    protected orderDetails: OrderDetails;
    protected parameterType: ParameterType;
    protected trainNumber: string;
    protected displayTrainNumber: string = '';
    protected otherRoundtrips: TrainIdentifier[];
    protected isRoundTrip: boolean = false;
    protected isIntermodal: boolean = false;

    private orderItem: OrderItem;
    private trainSummary: CancellationTrainSummary;
    private train: TrainIdentifier;
    private roundTrip: TrainChain;

    constructor(
        @Inject(MAT_DIALOG_DATA) public param: { order: OrderItem, trainSummary: CancellationTrainSummary, train: TrainIdentifier },
        private trainorderService: TrainorderService,
        private modalWindows: ModalWindows,
        private translation: TranslateService,
        private dialogRef: MatDialogRef<OrderCancellationComponent>
    ) {
        this.orderItem = param.order;
        this.trainSummary = param.trainSummary;
        this.train = param.train;
        this.determineParameterType();
    }

    ngOnInit(): void {
        this.createCancelForm();
        this.setTrainNumber();
        this.setIsTrainChain();
        this.fetchData();
        this.getTrainChain();
    }

    private setIsTrainChain() {
        this.isRoundTrip = false;
        this.isIntermodal = false;
        if(!this.trainSummary || !this.trainSummary.trainChainIdentifier) {
            return;
        }
        if(this.trainSummary.trainChainIdentifier.trainChainType) {
            if(this.trainSummary.trainChainIdentifier.trainChainType === 'INTERMODAL') {
                this.isIntermodal = true;
                return;
            }
            if(this.trainSummary.trainChainIdentifier.trainChainType === 'ROUNDTRIP') {
                this.isRoundTrip = true;
            }
        }
    }

    private getTrainChain(): void {
        if(!this.isRoundTrip) {
            return;
        }
        const trainChainId = this.trainSummary.trainChainIdentifier.trainChainId;
        const trainChainDate = this.trainSummary.trainChainIdentifier.trainChainDate;
        this.trainorderService.getTrainChainDetails(trainChainId, trainChainDate).subscribe((trainChain: TrainChain) => {
            this.roundTrip = trainChain;
            if(this.roundTrip.trains.length < 2) {
                this.isRoundTrip = false;
            }
            this.setOtherRoundtrips();
        });
    }

    private determineParameterType(): void {
        if (this.trainSummary) {
            this.parameterType = ParameterType.TRAIN_SUMMARY;
        } else if (this.train) {
            this.parameterType = ParameterType.TRAIN_IDENTIFIER;
        } else if (this.orderItem) {
            this.parameterType = ParameterType.ORDER_ITEM;
        } else {
            console.error('Failed to determine the type of given parameter!');
        }
    }

    private setTrainNumber() {
        if (this.trainSummary?.trains) {
            this.displayTrainNumber = this.trainSummary.trains.map(t => t.trainNumber).join(', ');
        }
        if (this.isIntermodal) {
            this.trainNumber = this.trainSummary.trains[0].trainNumber;
        } else if (this.parameterType === ParameterType.TRAIN_SUMMARY) {
            this.trainNumber = this.trainSummary.trains[0].trainNumber;
        } else if (this.parameterType === ParameterType.TRAIN_IDENTIFIER) {
            this.trainNumber = this.train.trainNumber;
            this.displayTrainNumber = this.trainNumber;
        } else if (this.parameterType === ParameterType.ORDER_ITEM) {
            const orderNumber: string = this.orderItem.orderNumber;
            this.displayTrainNumber = orderNumber;
        }
    }

    private fetchData(): void {
        if (this.isIntermodal) {
            const trainChainId: string = this.trainSummary.trainChainIdentifier.trainChainId;
            const trainChainDate: string = moment(this.trainSummary.trainChainIdentifier.trainChainDate).format('YYYY-MM-DD');
            this.fetchOrderDetailsByChain(trainChainId, trainChainDate);
        } else if (this.parameterType === ParameterType.TRAIN_SUMMARY) {
            const productionDate: string = moment(this.trainSummary.trains[0].productionDate).format('YYYY-MM-DD');
            this.fetchOrderDetailsByTrain(this.trainNumber, productionDate);
        } else if (this.parameterType === ParameterType.TRAIN_IDENTIFIER) {
            const productionDate: string = moment(this.train.productionDate).format('YYYY-MM-DD');
            this.fetchOrderDetailsByTrain(this.trainNumber, productionDate);
        } else if (this.parameterType === ParameterType.ORDER_ITEM) {
            const orderNumber: string = this.orderItem.orderNumber;
            this.fetchOrderDetailsByOrder(orderNumber);
        }
    }

    private fetchOrderDetailsByChain(trainChainId: string, trainChainDate: string): void {
        this.trainorderService.getOrderDetailsByChain(trainChainId, trainChainDate).subscribe({
            next: (result: OrderDetails) => {
                this.orderDetails = result;
            },
            error: (error: Error) => {
                console.log('Failed to fetch data.', error);
            }
        });
    }

    private fetchOrderDetailsByTrain(trainNumber: string, productionDate: string): void {
        this.trainorderService.getOrderDetailsByTrain(trainNumber, productionDate).subscribe({
            next: (result: OrderDetails) => {
                this.orderDetails = result;
            },
            error: (error: Error) => {
                console.log('Failed to fetch data.', error);
            }
        });
    }

    private fetchOrderDetailsByOrder(orderNumber: string): void {
        this.trainorderService.sendOrderDetailsRequest(orderNumber).subscribe({
            next: (result: OrderDetails) => {
                this.orderDetails = result;
            },
            error: (error: Error) => {
                console.error('Failed to fetch data', error);
            }
        });
    }

    private createCancelForm(): void {
        this.cancelForm = new FormGroup({
            reason: new FormControl()
        });
    }

    private setOtherRoundtrips(): void {
        this.otherRoundtrips = new Array();
        this.roundTrip.trains.forEach(t => {
            if(t.train.trainNumber != this.trainNumber) {
                this.otherRoundtrips.push(t.train);
            }
        });
    }

    protected getIdChain(): string {
        let result: string = '';
        if (this.trainSummary.trains.length > 1) {
          let counter = 0;
          for (let t of this.trainSummary.trains) {
            if (counter > 0) {
              result += ', ';
            }
            result += t.trainNumber;
            counter++;
          }
        }
        return result;
    }

    protected cancelOrder(): void {
        const reason = this.cancelForm.controls['reason']?.value;
        if (this.parameterType === ParameterType.TRAIN_SUMMARY) {
            if(this.isRoundTrip) {
                this.cancelRoundTrip(reason);
            } else if (!this.isIntermodal) {
                const trainNumber: string = this.trainSummary.trains[0].trainNumber;
                const productionDate: string = moment(this.trainSummary.trains[0].productionDate).format('YYYY-MM-DD');
                this.cancelOrderByTrainIdentifier(trainNumber, productionDate, reason);
            } else {
                console.log(this.trainSummary);
                const trainChainDate: string = moment(this.trainSummary.trainChainIdentifier.trainChainDate).format('YYYY-MM-DD');
                const trainChainId: string = this.trainSummary.trainChainIdentifier.trainChainId;
                this.cancelOrderByTrainChain(trainChainId, trainChainDate, reason);
            }
        } else if(this.parameterType === ParameterType.TRAIN_IDENTIFIER) {
            const productionDate = moment(this.train.productionDate).format('YYYY-MM-DD');
            this.cancelOrderByTrainIdentifier(this.train.trainNumber, productionDate, reason);
        } else if (this.parameterType === ParameterType.ORDER_ITEM) {
            const orderNumber: string = this.orderItem.orderNumber;
            this.cancelOrderByOrderItem(orderNumber, reason);
        }
    }

    private cancelOrderByTrainChain(trainChainId: string, trainChainDate: string, reason: string): void {
        this.loadingInProgress = true;
        this.trainorderService.postOrderCancellationByChain(trainChainId, trainChainDate, reason).subscribe({
            next: () => {
                this.resetAndCloseOrderForm();
            },
            error: (error: HttpErrorResponse) => {
                console.error(error);
                this.errorHandling(error);
            }
        });
    }

    private cancelRoundTrip(reason: string): void {
        this.loadingInProgress = true;
        const productionDate = moment(this.trainSummary.trains[0].productionDate).format('YYYY-MM-DD');
        this.trainorderService.postOrderCancellationByTrain(this.trainNumber, productionDate, reason).subscribe({
            next: (result) => {
                this.resetAndCloseOrderForm(this.getNextCancelableTrain());
            },
            error: (error: HttpErrorResponse) => {
                console.error(error);
                this.errorHandling(error);
            }
        });
    }

    private cancelOrderByTrainIdentifier(trainNumber: string, productionDate: string, reason: string): void {
        this.loadingInProgress = true;
        this.trainorderService.postOrderCancellationByTrain(trainNumber, productionDate, reason).subscribe({
            next: () => {
                this.resetAndCloseOrderForm();
            },
            error: (error: HttpErrorResponse) => {
                console.error(error);
                this.errorHandling(error);
            }
        });
    }

    private getNextCancelableTrain(): TrainIdentifier | null {
        let trainIdentifier = null;
        this.roundTrip.trains.forEach(t => {
            if (t.cancelable && t.train.trainNumber != this.trainNumber) {
                trainIdentifier = t.train;
            }
        });

        return trainIdentifier;
    }

    private cancelOrderByOrderItem(orderNumber: string, reason: string): void {
        this.loadingInProgress = true;
        this.trainorderService.postOrderCancelation(orderNumber, reason).subscribe({
            next: () => {
                this.resetAndCloseOrderForm();
            },
            error: (error: HttpErrorResponse) => {
                console.error(error);
                this.errorHandling(error);
            }
        });
    }

    protected openDetails() {
        this.arrowIcon.nativeElement.classList.toggle('arrow-up');
        this.orderDetailsArea.nativeElement.classList.toggle('order-details-area-show');
    }

    private errorHandling(response: HttpErrorResponse) {
        console.error(response);
        this.loadingInProgress = false;
        this.dialogRef.close(ClosingType.CLOSE_ON_ERROR);
        this.modalWindows.openErrorDialog({ apiProblem: response.error });
    }

    private resetAndCloseOrderForm(nextTrainToCancel: TrainIdentifier | null = null): void {
        this.loadingInProgress = false;
        this.dialogRef.close(nextTrainToCancel);
    }
    protected closeDialog() {
        this.dialogRef.close(ClosingType.CLOSE_ON_CANCEL_CANCELLATION);
    }
}
