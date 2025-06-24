import { NgModule } from "@angular/core";
import { DocumentationComponent } from "./documentation.component";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { DocumentationService } from "./documentation.service";
import { SharedModule } from "@src/app/shared/shared.module";
import { UserManualModule } from "@src/app/system-information/user-manual/user-manual.module";
import { AppRoutingModule } from "@src/app/app-routing.module";
import { ReleaseInformationModule } from "@src/app/system-information/release-information/release-information.module";

@NgModule({
  declarations: [
    DocumentationComponent
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
    DocumentationService,
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ]
})
export class DocumentationModule {

}
