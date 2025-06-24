import { Component, Inject } from '@angular/core';
import { WagonTrackingHistory } from './models/api-wagon-tracking-history.model';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';
import { OrderKey } from '@src/app/order-management/components/wagon-view/models/api-wagon-list';
import { SortConditionsModel } from '../../models/sort.models';
@Component({
  selector: 'app-tracking-history-wagon',
  templateUrl: './tracking-history-wagon.component.html',
  styleUrl: './tracking-history-wagon.component.scss',
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule
  ]
})

export class TrackingHistoryWagonComponent {

  protected sortTable() {
    this.sortConditions.asc = !this.sortConditions.asc;
    this.wagonTrackingHistory.reverse()
}
  protected wagonNumber: string ;
  protected orderNumber: number ;
  protected orderAuthority : number;
  protected wagonTrackingHistory : WagonTrackingHistory[];
  protected sortConditions: SortConditionsModel = { asc: true, field: 'eventDateTime' };
  constructor(@Inject(MAT_DIALOG_DATA) public data: {wagonTrackingHistoryList: WagonTrackingHistory[],
    orderKey : OrderKey,
    wagonNumber : string }) {
    this.wagonNumber = data.wagonNumber;
    this.orderNumber = data.orderKey.orderNumber;
    this.orderAuthority = data.orderKey.orderAuthority;
    this.wagonTrackingHistory = data.wagonTrackingHistoryList;
  }
}
