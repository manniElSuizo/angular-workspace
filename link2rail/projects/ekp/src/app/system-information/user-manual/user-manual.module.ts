import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { TranslateModule } from "@ngx-translate/core";
import { UserManualComponent } from "./user-manual.compoonent";
import { UserManualService } from "./user-manual.service";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { DBUIElementsModule } from '@db-ui/ngx-elements-enterprise/dist/lib';

@NgModule({
  declarations: [
    UserManualComponent
  ],
  imports: [
    CommonModule, 
    MatDialogModule,
    TranslateModule.forChild(),
    PdfViewerModule,
    DBUIElementsModule
  ],
  providers: [
    UserManualService,
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ],
  exports: [
    UserManualComponent
  ]
})
export class UserManualModule {

}