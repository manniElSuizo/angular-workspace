import { inject, Injectable, OnDestroy, ViewContainerRef } from '@angular/core';
import { NewOrderService } from './new-order.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { NewOrderMainComponent } from '../new-order-main/new-order-main.component';
import { initialRailOrder } from '../../../models/rail-order-api';
import { OrderInfoData } from '../models/order-info-data.model';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';
import { Subject } from 'rxjs';
import { RailOrderCancellationComponent } from '../../order-view/order-view-list/rail-order-cancellation/rail-order-cancellation.component';
import { RailOrderSearchSummary } from '@src/app/trainorder/models/ApiRailOrder.model';
import { RailOrderCodeSearchSummary } from '../../order-code-view/models/ApiRailOrderCode.model';
import { OrderTemplateRenameComponent } from '../../order-code-view/order-template-rename/order-template-rename.component';
import { FastEntryComponent } from '../fast-entry/fast-entry.component';
import { LoadingSpinnerService } from '@src/app/shared/services/loading-spinner/loading-spinner.service';
import { LoadingSpinnerComponent } from '@src/app/shared/components/loading-spinner/loading-spinner.component';

export const NEW_ORDER_DAILOG_WIDTH = 1710;

@Injectable({
  providedIn: 'root'
})
export class RailOrderDialogService implements OnDestroy {
  private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);
  private loadingSpinnerService: LoadingSpinnerService = inject(LoadingSpinnerService);

  constructor(
    private newOrderService: NewOrderService,
    private dialog: MatDialog // Inject MatDialog here
  ) { }

  ngOnDestroy(): void {
  }

  public openDialogWithOrderTemplate(templateNumber: string, fastEntry: boolean = false, isEditable: boolean = true): void {
    this.loadingSpinnerService.startLoading();

    this.newOrderService.getRailOrderTemplateByTemplateNumber(templateNumber).subscribe({
      next: railOrder => {
        if(fastEntry) {
          this.openModalWindow(FastEntryComponent, { railOrder: railOrder });
        } else {
          this.openModalWindow(NewOrderMainComponent, { railOrder: railOrder, editMode: isEditable , isNew:true } as OrderInfoData);
        }

        this.loadingSpinnerService.stopLoading();
      },
      error: e => {
        this.apiErrorDialogService.openApiErrorDialog(e);

        this.loadingSpinnerService.stopLoading();
      }
    });
  }

  public showNewOrderDialog(orderId: number | null, editMode: boolean = true, isNew: boolean = false): Subject<boolean> {
    const returnSubj = new Subject<boolean>();
    if(!orderId){
      const orderInfoData: OrderInfoData = {
        isNew: isNew,
        editMode: editMode,
        railOrder: initialRailOrder()
      };

      this.openModalWindow(NewOrderMainComponent, orderInfoData).afterClosed().subscribe({
        next: r => {
          if(r) {
            returnSubj.next(true);
          } else {
            returnSubj.next(false);
          }
        }
      });
      return returnSubj;
    }

    // this.getOrder(orderId).pipe(takeUntil(this.destroy$)).subscribe(result => {
    this.newOrderService.getOrder(orderId).subscribe({
      next: result => {
        console.log(result);
        this.openModalWindow(NewOrderMainComponent, {railOrder: result, editMode: editMode, isNew: false} as OrderInfoData).afterClosed().subscribe({
          next: r => {
            if(r) {
              returnSubj.next(true);
            } else {
              returnSubj.next(false);
            }
          }
        });
      },
      error: err => this.apiErrorDialogService.openApiErrorDialog(err)
    });
    return returnSubj;
  }

  public openCancellationConfirmation(railOrder: RailOrderSearchSummary): Subject<boolean> {
    const subject = new Subject<boolean>();
    let config: MatDialogConfig = { position: { top: '30vh' }, data: railOrder };
    let dialogRef: MatDialogRef<RailOrderCancellationComponent> = this.dialog.open(RailOrderCancellationComponent, config);
    dialogRef.afterClosed().subscribe(decision => {
      subject.next(decision);
    });
    return subject;
  }

  public openRenameOrderTemplateDialog(orderTemplate: RailOrderCodeSearchSummary): MatDialogRef<OrderTemplateRenameComponent> {
    return this.dialog.open(OrderTemplateRenameComponent, {data: orderTemplate});
  }

  private openModalWindow(component: any, data: any): MatDialogRef<NewOrderMainComponent> {
    const ref = this.dialog.open<NewOrderMainComponent>(component, {
      data: data,
      width: NEW_ORDER_DAILOG_WIDTH + 'px',  // Adjust the width as needed
      //maxWidth: '95vw',
      //height: 'auto',
      //height: '700px',
      height: '90vh', // Ensure dialog height doesn't exceed viewport height
      disableClose: true,  // Prevent closing the modal by clicking outside
    });
    ref.addPanelClass('modal-fullscreen');
    ref.afterClosed().subscribe(result => {  });
    return ref;
  }

}
