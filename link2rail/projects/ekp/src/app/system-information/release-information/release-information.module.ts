import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { TranslateModule } from "@ngx-translate/core";
import { ReleaseInformationComponent } from "./release-information.component";
import { ReleaseInformationService } from "./release-information.service";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { DBUIElementsModule } from '@db-ui/ngx-elements-enterprise/dist/lib';
@NgModule({
  declarations: [
    ReleaseInformationComponent
  ],
  imports: [
    CommonModule, 
    MatDialogModule,
    TranslateModule.forChild(),    
    PdfViewerModule,
    DBUIElementsModule
  ],
  providers: [
    ReleaseInformationService,
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ],
  exports: [
    ReleaseInformationComponent
  ]
})
export class ReleaseInformationModule {

}