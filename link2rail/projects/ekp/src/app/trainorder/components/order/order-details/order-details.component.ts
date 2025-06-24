import { Component, Input } from '@angular/core';
import { OrderDetails } from '@src/app/trainorder/models/ApiOrders.model';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';

@Component({
    selector: 'app-order-details',
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.scss'],
})

export class OrderDetailsComponent {

  @Input()
  public orderDetails: OrderDetails;
  @Input()
  public customerProfile: CustomerProfile;

  protected toUpperOptionalString(value: string) {
    if (!value) return '';
    return value.toUpperCase();
  }

  protected profileSelected(): boolean {
    if (this.customerProfile) {
        return true;
    }
    return false;
  }
}
