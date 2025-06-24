import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RailOrder } from '../../../../../models/rail-order-api';
import { NewOrderWagonDetailDialogComponent } from '../new-order-wagon-detail-dialog/new-order-wagon-detail-dialog.component';
import { NEW_ORDER_DAILOG_WIDTH } from '../../../service/railorder-order-dialog.service';
import { WagonDataCommunicationService } from './wagon-data-communication.service';
import { DangerousGoodsSelectionDialogComponent } from '../wagon-data-sections/goods-information-list/dangerous-goods-selection-dialog/dgs.component';
import { ValidationMode } from '../../../validators/validator-field.config';

@Injectable({
  providedIn: 'root'
})
export class NewOrderWagonDetailDialogService {

  private wagonDataCommunicationService: WagonDataCommunicationService = inject(WagonDataCommunicationService);

  constructor(private dialog: MatDialog) { }

  public openWagonDetailDialog(railOrder: RailOrder, idx: number, editMode: boolean, validationMode: ValidationMode, isFastEntry: boolean = false): MatDialogRef<NewOrderWagonDetailDialogComponent> {
    this.wagonDataCommunicationService.changeWagonInformation(railOrder.wagonInformation[idx], this.constructor.name);
    return this.dialog.open(NewOrderWagonDetailDialogComponent, {data: {railOrder: railOrder, idx: idx, editMode: editMode, validationMode: validationMode, isFastEntry: isFastEntry}, width: (NEW_ORDER_DAILOG_WIDTH - 100) + 'px', height: '90vh'});
  }

  public openDangerousGoodsDetailDialog(dangerousLawValidTo:String): MatDialogRef<DangerousGoodsSelectionDialogComponent> {
    return this.dialog.open(DangerousGoodsSelectionDialogComponent, {data: {dangerousLawValidTo: dangerousLawValidTo}, width: (NEW_ORDER_DAILOG_WIDTH - 100) + 'px', height: '90vh'});
  }
}
