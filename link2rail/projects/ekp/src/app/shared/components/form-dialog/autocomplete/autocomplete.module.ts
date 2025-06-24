import { NgModule } from "@angular/core";
import { AutocompleteComponent } from "./autocomplete.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [
      AutocompleteComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      TranslateModule
    ],
    exports: [
      AutocompleteComponent
    ]
  })
  export class AutocompleteModule { }