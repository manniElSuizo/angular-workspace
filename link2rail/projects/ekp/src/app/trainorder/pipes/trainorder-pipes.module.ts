import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NhmCodePipe } from "./nhm-code.pipe";
import { BorderCodeNamePipe } from "./border-code-name.pipe";
import { TrainTypePipe } from "./train-type.pipe";
import { BorderStationPipe } from "./border-station.pipe";
import { TrainCancelablePipe } from "./train-cancelable.pipe";

@NgModule({
  imports: [
    CommonModule    
  ],
  declarations: [
    NhmCodePipe,
    BorderCodeNamePipe,
    BorderStationPipe,
    TrainTypePipe,
    TrainCancelablePipe
  ],
  exports: [
    NhmCodePipe,
    BorderCodeNamePipe,
    BorderStationPipe,
    TrainTypePipe,
    TrainCancelablePipe
  ],
  providers: [
    BorderCodeNamePipe,
    TrainCancelablePipe
  ]
})
export class TrainorderPipesModule {

}