import { NgModule } from "@angular/core";
import { FooterComponent } from "./footer.component";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { MatDialogRef } from "@angular/material/dialog";
import { DocumentationModule } from "./documentation-component/documentation.module";
import { FeedbackComponent } from './feedback/feedback.component';

@NgModule({
  declarations: [
    FooterComponent,
    FeedbackComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    DocumentationModule
  ],
  exports: [
    FooterComponent
  ],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ]
})
export class FooterModule {

}
