import { NgModule } from '@angular/core';
import { MultiselectAutocompleteModule } from './multiselect-autocomplete/multiselect-autocomplete.module';
import { InputFieldModule } from './input-field/input-field.module';
import { SelectFieldModule } from './select-field/select-field.module';
import { ElSAutocompleteModule } from './el-s-autocomplete/el-s-autocomplete.module';
import { AutocompleteInternalModule } from './autocomplete-internal/autocomplete-internal.module';
import { NumericInputModule } from './numeric-input/numeric-input.module';

@NgModule({
  exports: [
    MultiselectAutocompleteModule,
    InputFieldModule,
    SelectFieldModule,
    ElSAutocompleteModule,
    AutocompleteInternalModule,
    NumericInputModule
  ]
})
export class FormDialogModule { }
