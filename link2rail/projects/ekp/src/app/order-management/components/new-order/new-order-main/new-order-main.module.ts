import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { newOrderMainRoutes } from './new-order-main.routes';
import { SharedModule } from '@src/app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { NewOrderConsignorConsigneeModule } from "../new-order-sections/new-order-consignor-consignee/new-order-consignor-consignee.modules";
import { NewOrderPickupDeliveryModule } from "../new-order-sections/new-order-pickup-delivery/new-order-pickup-delivery.modules";
import { NewOrderWagonDataModule } from "../new-order-sections/new-order-wagon-data/new-order-wagon-data.modules";
import { NewOrderCommercialModule } from "../new-order-sections/new-order-commercial/new-order-commercial.modules";
import { NewOrderTransportModule } from "../new-order-sections/new-order-transport/new-order-transport.modules";
import { NewOrderServiceModule } from "../new-order-sections/new-order-service/new-order-service.modules";
import { NewOrderSenderPolicyModule } from "../new-order-sections/new-order-sender-policy/new-order-sender-policy.modules";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    RouterModule.forChild(newOrderMainRoutes),
    SharedModule,
    NewOrderConsignorConsigneeModule,
    NewOrderPickupDeliveryModule,
    NewOrderWagonDataModule,
    NewOrderCommercialModule,
    NewOrderTransportModule,
    NewOrderServiceModule,
    NewOrderSenderPolicyModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule
  ]
})
export class NewOrderMainModule { }
