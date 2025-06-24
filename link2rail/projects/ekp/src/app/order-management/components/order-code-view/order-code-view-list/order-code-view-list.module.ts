import { NgModule } from '@angular/core';
import { OrderCodeViewListComponent } from './order-code-view-list.component';
import { orderCodeViewListRoutes } from './order-code-view-list.routes';
import { RouterModule } from '@angular/router';
import { OrderCodeViewFilterModule } from './order-code-view-filter/order-code-view-filter.module';
import { SharedModule } from '@src/app/shared/shared.module';
import { PopupMenuModule } from '@src/app/shared/components/popup-menu/popup-menu.module';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [
    OrderCodeViewListComponent
  ],
  imports: [
    RouterModule.forChild(orderCodeViewListRoutes),
    OrderCodeViewFilterModule,
    SharedModule,
    PopupMenuModule,
    MatDialogModule,
  ]
})
export class OrderCodeViewListModule { }
