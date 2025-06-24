import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "@src/app/shared/shared.module";
import { InputFieldComponent } from "./input-field.component";

@NgModule({
    declarations: [
        InputFieldComponent
    ],
    imports: [
      SharedModule
    ],
    exports: [
        InputFieldComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class InputFieldModule { }
