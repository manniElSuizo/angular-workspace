import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "@src/app/shared/shared.module";
import { SelectFieldComponent } from "./select-field.component";

@NgModule({
    declarations: [
        SelectFieldComponent
    ],
    imports: [
      SharedModule
    ],
    exports: [
        SelectFieldComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class SelectFieldModule { }
