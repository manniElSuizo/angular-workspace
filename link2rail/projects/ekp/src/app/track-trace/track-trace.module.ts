import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrackTraceRoutingModule } from './track-trace-routing.module';
import { WagonholderModule } from './wagonholder/wagonholder.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TrackTraceRoutingModule,
    WagonholderModule,
    SharedModule
  ]
})
export class TrackTraceModule { }