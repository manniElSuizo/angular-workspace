import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "@src/app/shared/shared.module";
import { NumericInputComponent } from "./numeric-input.component";

@NgModule({
    declarations: [
        NumericInputComponent
    ],
    imports: [
      SharedModule
    ],
    exports: [
        NumericInputComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class NumericInputModule { }
