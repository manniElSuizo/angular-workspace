import { NgModule } from '@angular/core';
import { TrainorderRoutingModule } from './trainorder.routes';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TrainRemarksComponent } from './train-remarks/train-remarks.component';
import { ModalWindows } from '../shared/components/modal-windows/modal-windows';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TrainRemarksComponent,
  ],
  imports: [
    TrainorderRoutingModule,
    TranslateModule
  ],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    },
    {
      provide: MAT_DIALOG_DATA,
      useValue: {}
    },
    ModalWindows
  ]
})
export class TrainorderModule { }
