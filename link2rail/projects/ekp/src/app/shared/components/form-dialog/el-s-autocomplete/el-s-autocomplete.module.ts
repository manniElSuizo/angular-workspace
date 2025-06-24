import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { ElSAutocompleteComponent } from "./el-s-autocomplete.component";

@NgModule({
    declarations: [
      ElSAutocompleteComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      TranslateModule
    ],
    exports: [
      ElSAutocompleteComponent
    ]
  })
  export class ElSAutocompleteModule { }