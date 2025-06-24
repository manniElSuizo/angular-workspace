import { Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { CancellationConfirmationRoundtripComponent } from "../cancellation-confirmation-roundtrip/cancellation-confirmation-roundtrip.component";
import { TrainChainType, TrainIdentifier } from "@src/app/trainorder/models/ApiTrainsList.models";
import { TranslateService } from "@ngx-translate/core";
import { CancellationTrainSummary, ClosingType, OrderCancellationComponent } from "../order-cancellation.component";
import { OrderItem } from "@src/app/trainorder/models/ApiOrders.model";
import { Subject } from "rxjs";
import { ConfirmationDisplayComponent } from "@src/app/shared/components/confirmation-display/confirmation-display.component";

@Injectable({
    providedIn: 'root',
})
export class OrderCancellationService {
    private trainSummary: CancellationTrainSummary;

    public reloadSubject: Subject<boolean> = new Subject<boolean>();

    constructor(private dialog: MatDialog, private translation: TranslateService) { }

    public cancelOrder(order: OrderItem):  MatDialogRef<OrderCancellationComponent> {
        const ref = this.openModalWindowCancelOrder({ order: order });
        return ref;
    }

    public cancelTrainByTrainSummary(trainSummary: CancellationTrainSummary):  MatDialogRef<OrderCancellationComponent> {
        if(trainSummary.trainChainIdentifier?.trainChainType == TrainChainType.ROUNDTRIP) {
            this.trainSummary = trainSummary;
        }
        const data = { trainSummary: trainSummary };
        const ref = this.openModalWindowCancelOrder(data);
        ref.afterClosed().subscribe((nextTrainToCancel: TrainIdentifier | string | undefined) => {
            if(nextTrainToCancel && (nextTrainToCancel == ClosingType.CLOSE_ON_ERROR || nextTrainToCancel == ClosingType.CLOSE_ON_CANCEL_CANCELLATION)) {
                return;
            }
            if(nextTrainToCancel != null) {
                if((<TrainIdentifier>nextTrainToCancel).trainNumber !== undefined) {
                    this.confirmRoundtripCancellation((nextTrainToCancel as TrainIdentifier));
                }
                return;
            }
            this.openConfirmationDialog(this.translation.instant('Order-component.Cancellation.Cancelled'), 3);
        });
        return ref;
    }

    // TODO where is this method used? DELETE, if not used
    public cancelTrainByTrainIdentifier(train: TrainIdentifier): MatDialogRef<OrderCancellationComponent> {
        const ref = this.openModalWindowCancelOrder({ train: train });
        return ref;
    }

    private openModalWindowCancelOrder(data?: any): MatDialogRef<OrderCancellationComponent> {
        const width = 1000;
        let config = {};
        config = { data: data, width: width + 'px' };
        const ref = this.dialog.open(OrderCancellationComponent, config);
        return ref;
    }

    private confirmRoundtripCancellation(nextTrainToCancel: TrainIdentifier): MatDialogRef<CancellationConfirmationRoundtripComponent | ConfirmationDisplayComponent> {
        if (nextTrainToCancel == null) {
            const ref = this.openConfirmationDialog(this.translation.instant('Order-component.Cancellation.Cancelled'), 3);
            return ref;
        }
        const dialogRef = this.openCancellationConfirmationRoundtrip(nextTrainToCancel);
        dialogRef.afterClosed().subscribe(r => {
            if (r) {
                const trainSummary = this.trainSummary;
                trainSummary.trains[0] = nextTrainToCancel;
                this.cancelTrainByTrainSummary(trainSummary);
            }
        });
        return dialogRef;
    }

    private openConfirmationDialog(text: string, seconds: number): MatDialogRef<ConfirmationDisplayComponent> {
        const ref = this.dialog.open(ConfirmationDisplayComponent, {data: text});
        this.reloadSubject.next(true);
        setTimeout(() => ref.close(), seconds * 1000);
        return ref;
    }

    private openCancellationConfirmationRoundtrip(nextTrainToCancel: TrainIdentifier): MatDialogRef<CancellationConfirmationRoundtripComponent> {
        const config: MatDialogConfig = { data: { nextTrainToCancel: nextTrainToCancel }, width: '500px' };
        const ref = this.dialog.open(CancellationConfirmationRoundtripComponent, config);
        this.reloadSubject.next(true);
        return ref;
    }
}
