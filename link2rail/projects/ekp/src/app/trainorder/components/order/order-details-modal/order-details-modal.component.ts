import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { OrderDetails } from '@src/app/trainorder/models/ApiOrders.model';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrderDetailsModule } from '../order-details/order-details.module';

@Component({
  selector: 'app-order-details-modal',
  templateUrl: './order-details-modal.component.html',
  styleUrls: ['./order-details-modal.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    OrderDetailsModule,
    MatDialogModule
  ]
})
export class OrderDetailsModalComponent {

  protected orderDetails: OrderDetails;
  protected orderNumber: string;

  constructor(@Inject(MAT_DIALOG_DATA) private param: { orderDetails: OrderDetails, orderNumber: string }) {
    this.orderDetails = param.orderDetails;
    this.orderNumber = param.orderNumber;
  }
}
