import { PipeTransform } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

export interface BasicFormFieldSettings {
    formControlName: string;
    formGroup: FormGroup;
    formControl?: FormControl;
    id?: string;
    name?: string;
    i18n: {
        label: string;
        placeholder?: string;
        errorText?: string;
        title?: string;
    },
    hideError?: boolean;
    showRequired?: boolean;
    showErrorCondition?: boolean;
    requiredMarker?: string;
    onChange?: Function;
    onInput?: Function;
    onBlur?: Function;
    onChangeArgs?: any[];
    onInputArgs?: any[];
    onBlurArgs?: any[];
}

export interface InputFieldSettings extends BasicFormFieldSettings {
    type?: string;
    maxLength?: number;
    minLength?: number;
}

export interface SelectFieldSettings extends BasicFormFieldSettings {
    options: any[];
    optionTransform: PipeTransform;
    optionValueProperty?: string;
    addEmptyOption?: boolean;
}