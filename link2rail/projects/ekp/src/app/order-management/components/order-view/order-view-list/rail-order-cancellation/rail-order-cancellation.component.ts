import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RailOrderService } from '@src/app/order-management/service/rail-order.service';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';
import { SharedModule } from '@src/app/shared/shared.module';
import { RailOrderSearchSummary } from '@src/app/trainorder/models/ApiRailOrder.model';

@Component({
  selector: 'app-rail-order-cancellation',
  templateUrl: './rail-order-cancellation.component.html',
  styleUrl: './rail-order-cancellation.component.scss',
  standalone: true,
  imports: [SharedModule]
})
export class RailOrderCancellationComponent {
  private railOrderService: RailOrderService = inject(RailOrderService);
  private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);
  protected railOrder: RailOrderSearchSummary;

  constructor(private dialogRef: MatDialogRef<RailOrderCancellationComponent>, @Inject(MAT_DIALOG_DATA) data: RailOrderSearchSummary) {
    this.railOrder = data;
  }

  decision(value: boolean) {
    if(value) {
      this.railOrderService.railOrdersCancel(this.railOrder.orderId).subscribe({
        next: () => {
          console.log('canceled: ', this.railOrder);
          this.dialogRef.close(true);
        },
        error: err => {
          console.log('canceled: ', this.railOrder);
          this.dialogRef.close(false);
          this.apiErrorDialogService.openApiErrorDialog(err);
        }
      });
      return;
    }

    this.dialogRef.close(false);
  }
}
