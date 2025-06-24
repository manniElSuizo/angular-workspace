import { NgModule } from '@angular/core';
import { OrderViewListComponent } from './order-view-list.component';
import { RouterModule } from '@angular/router';
import { orderViewListRoutes } from './order-view-list.routes';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrderViewFilterModule } from './order-view-filter/order-view-filter.module';
import { PopupMenuModule } from '@src/app/shared/components/popup-menu/popup-menu.module';

@NgModule({
  declarations: [
    OrderViewListComponent
  ],
  imports: [
    RouterModule.forChild(orderViewListRoutes),
    OrderViewFilterModule,
    SharedModule,
    PopupMenuModule,
    MatDialogModule,
]
})
export class OrderViewListModule { }
