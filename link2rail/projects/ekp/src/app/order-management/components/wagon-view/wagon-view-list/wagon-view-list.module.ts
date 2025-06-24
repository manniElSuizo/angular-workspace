import { NgModule } from '@angular/core';
import { WagonViewListComponent } from './wagon-view-list.component';
import { RouterModule } from '@angular/router';
import { wagonViewListRoutes } from './wagon-view-list.routes';
import { SharedModule } from '@src/app/shared/shared.module';
import { WagonViewFilterModule } from './wagon-view-filter/wagon-view-filter.module';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    WagonViewListComponent
  ],
  imports: [
    RouterModule.forChild(wagonViewListRoutes),
    WagonViewFilterModule,
    SharedModule,
    MatDialogModule
  ]
})
export class WagonViewListModule { }
