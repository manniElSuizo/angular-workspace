import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from "../multiselect-autocomplete.component";


@Component({
    selector: 'app-multiselect-autocomplete',
    template: ''
  })
  export class MultiselectAutocompleteComponentFake implements Partial<MultiselectAutocompleteComponent> {
    @Output() formFieldEventEmitter = new EventEmitter<Event>();
    @Input() multiselectAutocompleteParameters: MultiselectAutocompleteParameters = {
        i18n: {
            fieldText: '',
            labelText: '',
            errorText: '',
            searchPlaceholderText: '',
            noDataAvailablePlaceholderText: ''
        },
        fieldName: '',
        fieldId: '',
        formControlName: '',
        dataCallback: undefined,
        selectedItems: []
    };
  }