import { Injectable, OnDestroy } from '@angular/core';
import { TrackingHistoryWagonComponent } from '../tracking-history-wagon.component';
import { TrackingHistoryWagonService } from './tracking-history-wagon.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { OrderKey } from '@src/app/order-management/components/wagon-view/models/api-wagon-list';
import { WagonTrackingHistory, WagonTrackingHistoryRequest } from '../models/api-wagon-tracking-history.model';

@Injectable({
  providedIn: 'root'
})
export class TrackingHistoryWagonDialogService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private trackingHistoryWagonService: TrackingHistoryWagonService,
    private dialog: MatDialog
  ) {

  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public showWagonTrackingHistoryDialog(orderId: number, wagonNumber: string, orderKey: OrderKey): void {
    this.getTrackingHistoryWagon(orderId, wagonNumber).pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.openModalWindow(TrackingHistoryWagonComponent,
          {
            wagonTrackingHistoryList: result,
            orderKey: orderKey,
            wagonNumber: wagonNumber
          });
      });
  }

  private getTrackingHistoryWagon(orderId: number, wagonNumber: string): Observable<WagonTrackingHistory[]> {
    const wagonTrackingHistoryRequest: WagonTrackingHistoryRequest = {
      wagonNumber: wagonNumber,
      orderId: orderId
    };
    return this.trackingHistoryWagonService.getWagonTrackingHistory(wagonTrackingHistoryRequest);
  }

  private openModalWindow(component: any, data: any): void {
    this.dialog.open(component, {
      data: data,
      width: '1000px',  // Adjust the width as needed
      maxHeight: '90vh', // Ensure dialog height doesn't exceed viewport height
      disableClose: true,  // Prevent closing the modal by clicking outside
    });
  }
}
