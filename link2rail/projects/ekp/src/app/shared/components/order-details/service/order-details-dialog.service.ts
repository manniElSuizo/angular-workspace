import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { OrderKey } from '@src/app/order-management/components/wagon-view/models/api-wagon-list';
import { RailOrder } from '@src/app/order-management/models/rail-order-api';
import { NewOrderService } from '@src/app/order-management/components/new-order/service/new-order.service';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailsDialogService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private newOrderService: NewOrderService,
    private dialog: MatDialog)// Inject MatDialog here
  { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showOrderDetailsDialog(orderId: number, orderKey: OrderKey, wagonNumber: string): void {
    this.getOrderDetails(orderId).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        this.openModalWindow(OrderDetailsComponent, {
          orderKey: orderKey,
          wagonNumber : wagonNumber,
          railOrder: result
        });
      },
      error: e => {
        console.log("e", e);
        if (e instanceof HttpErrorResponse && e.status == HttpStatusCode.NotFound) {
          this.openModalWindow(OrderDetailsComponent, {
            orderNumber: orderKey.orderNumber,
            orderAuthority: orderKey.orderAuthority,
          });
        }
      }
    });
  }
  private getOrderDetails(orderId: number): Observable<RailOrder> {
    return this.newOrderService.getOrder(orderId);
  }

  private openModalWindow(component: any, data: any): void {
    const ref = this.dialog.open(component, {
      data: data,
      width: '1000px',  // Adjust the width as needed
      //height: '800px',
      //minHeight: '50vh',
      maxHeight: '80vh', // Ensure dialog height doesn't exceed viewport height
      disableClose: true,  // Prevent closing the modal by clicking outside
    });
    ref.afterClosed().subscribe(result => { console.log(result) })
  }
}
