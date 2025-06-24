import { Injectable } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RailOrder } from '@src/app/order-management/models/rail-order-api';
import { NewOrderWagonImportDialogComponent } from '../new-order-wagon-import-dialog/new-order-wagon-import-dialog.component';
export const NEW_ORDER_DAILOG_WIDTH = 1710;

@Injectable({
  providedIn: 'root'
})

export class NewOrderWagonImportDialogService {

  constructor(private dialog: MatDialog) { }

  public openWagonImportDialog(railOrder: RailOrder): MatDialogRef<NewOrderWagonImportDialogComponent> {

    return this.dialog.open(NewOrderWagonImportDialogComponent, { data: { railOrder: railOrder }, width: (NEW_ORDER_DAILOG_WIDTH - 100) + 'px', height: '80vh', disableClose: true });
  }

}
