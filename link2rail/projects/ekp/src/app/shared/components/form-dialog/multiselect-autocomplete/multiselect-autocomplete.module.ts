import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { MultiselectAutocompleteComponent } from "./multiselect-autocomplete.component";
import { SharedModule } from "@src/app/shared/shared.module";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";

@NgModule({
    declarations: [
      MultiselectAutocompleteComponent
    ],
    imports: [
      SharedModule,
      NgMultiSelectDropDownModule.forRoot()
    ],
    exports: [
      MultiselectAutocompleteComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  })
  export class MultiselectAutocompleteModule { }
