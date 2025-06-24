import { NgModule } from "@angular/core";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { SystemInformationComponent } from "./system-information.component";
import { MatTabsModule } from '@angular/material/tabs';
import { UserManualModule } from "./user-manual/user-manual.module";
import { ReleaseInformationModule } from "./release-information/release-information.module";
import { AppRoutingModule } from "../app-routing.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    SystemInformationComponent
  ],
  imports: [
    SharedModule, 
    MatDialogModule,
    MatTabsModule,
    UserManualModule,
    AppRoutingModule,
    ReleaseInformationModule
  ],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ]
})
export class SystemInformationModule {

}