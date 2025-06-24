import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { AutocompleteInternalComponent } from "./autocomplete-internal.component";

@NgModule({
    declarations: [
        AutocompleteInternalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule
    ],
    exports: [
        AutocompleteInternalComponent
    ]
})
export class AutocompleteInternalModule { }