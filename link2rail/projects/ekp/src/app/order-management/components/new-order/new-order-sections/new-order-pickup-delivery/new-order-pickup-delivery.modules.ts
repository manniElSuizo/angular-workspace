import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { NewOrderPickupDeliveryComponent } from './new-order-pickup-delivery.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DatePipe } from '@angular/common';
import { ElSAutocompleteModule } from '@src/app/shared/components/form-dialog/el-s-autocomplete/el-s-autocomplete.module';
import { AutocompleteModule } from '@src/app/shared/components/form-dialog/autocomplete/autocomplete.module';

@NgModule({
  declarations: [
    NewOrderPickupDeliveryComponent
  ],
  imports: [
    SharedModule,
    MatDialogModule,
    ElSAutocompleteModule,
    AutocompleteModule
  ],
  exports: [
    NewOrderPickupDeliveryComponent
  ],
  providers: [
    DatePipe
  ]

})
export class NewOrderPickupDeliveryModule { }
