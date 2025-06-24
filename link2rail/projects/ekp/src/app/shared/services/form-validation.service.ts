import { Injectable } from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { ValidationMode, VALIDATOR_FIELD_CONFIG, ValidatorFieldConfig } from "../../order-management/components/new-order/validators/validator-field.config";

@Injectable({
    providedIn: 'root',
})
export class FormValidationService {

    public validateForm(formGroup: AbstractControl, validationModes: ValidationMode[] | ValidationMode, formValidationConfig: ValidatorFieldConfig[], path: string = '') {
        let validationModesArr: ValidationMode[] = null;
        if (!(validationModes instanceof Array)) {
            validationModesArr = [validationModes];   
        } else {
            validationModesArr = validationModes;
        }
        
        const foundConfigs = formValidationConfig.filter(fc => fc.fieldName == path);
        if (foundConfigs && foundConfigs.length > 0) {
            this.clearAndAddValidatorsConfigs(formGroup, foundConfigs, validationModesArr);
        }

        if (formGroup instanceof FormGroup) {
            Object.keys(formGroup.controls).forEach(key => {
                formGroup.controls[key].clearValidators();
                formGroup.controls[key].updateValueAndValidity({ emitEvent: false });
                const innerpath = path ? path + '.' + key : key;
                if (formGroup.controls[key] instanceof FormGroup) {
                    this.validateForm(formGroup.controls[key], validationModesArr, formValidationConfig, innerpath);
                } else if (formGroup.controls[key] instanceof FormArray) {
                    (formGroup.controls[key] as FormArray).controls.forEach((fg: FormGroup) => this.validateForm(formGroup.controls[key], validationModesArr, formValidationConfig, path ? path + '.' + key : key));
                } else if(formGroup.controls[key] instanceof FormControl) {
                    const foundConfigs = VALIDATOR_FIELD_CONFIG.filter(fc => fc.fieldName == innerpath);
                    if (foundConfigs && foundConfigs.length > 0) {
                        this.clearAndAddValidatorsConfigs(formGroup.controls[key], foundConfigs, validationModesArr);
                    }
                }
            });
        } else if(formGroup instanceof FormArray) {
            formGroup.controls.forEach(control => {
                this.validateForm(control, validationModesArr, formValidationConfig, path);
            });
        }
    }

    public validateRailOrderForm(abstractControl: AbstractControl, validationModes: ValidationMode[] | ValidationMode, path: string = '') {
        this.validateForm(abstractControl, validationModes, VALIDATOR_FIELD_CONFIG, path);
        return;
    }
    
    public validate(formGroup: FormGroup, validationModes: ValidationMode[] | ValidationMode) {
        let validationModesArr: ValidationMode[] = null;
        if (!(validationModes instanceof Array)) {
            validationModesArr = [validationModes];
        } else {
            validationModesArr = validationModes;
        }

        VALIDATOR_FIELD_CONFIG.forEach((vfc: ValidatorFieldConfig) => {
            let control: AbstractControl = formGroup;
            const controls = vfc.fieldName.split('.');
            controls.forEach(controlName => {
                if (controlName && controlName.length > 0 && controlName != '') {
                    if (control instanceof FormArray) {
                        control.controls.forEach(innerGroup => {
                            control = innerGroup.get(controlName);
                        });
                    } else {
                        control = control.get(controlName);
                    }
                }
            });
            if (control instanceof FormArray) {
                (control as FormArray).controls.forEach(c => this.clearAndAddValidators(c, vfc, validationModesArr))
            } else {
                this.clearAndAddValidators(control, vfc, validationModesArr);
            }
        });
    }

    private clearAndAddValidators(control: AbstractControl<any, any>, vfc: ValidatorFieldConfig, validationModes: ValidationMode[]) {
        control.clearValidators();
        control.setErrors(null);
        if (vfc.validatorsAlways && vfc.validatorsAlways.length > 0) {
            control.addValidators(vfc.validatorsAlways);
        }
        if (validationModes.includes(ValidationMode.VALIDATORS_BOOKING)) {
            if (vfc.validatorsBooking && vfc.validatorsBooking.length > 0) {
                control.addValidators(vfc.validatorsBooking);
            }
        }
        if (validationModes.includes(ValidationMode.VALIDATORS_DRAFT)) {
            if (vfc.validatorsDraft && vfc.validatorsDraft.length > 0) {
                control.addValidators(vfc.validatorsDraft);
            }
        }
        if (validationModes.includes(ValidationMode.VALIDATORS_ORDER)) {
            if (vfc.validatorsOrder && vfc.validatorsOrder.length > 0) {
                control.addValidators(vfc.validatorsOrder);
            }
        }
        if (validationModes.includes(ValidationMode.VALIDATORS_BOOKING_AC)) {
            if (vfc.validatorsBookingAC && vfc.validatorsBookingAC.length > 0) {
                control.addValidators(vfc.validatorsBookingAC);
            }
        }
        if (validationModes.includes(ValidationMode.VALIDATORS_ORDER_AC)) {
            if (vfc.validatorsOrderAC && vfc.validatorsOrderAC.length > 0) {
                control.addValidators(vfc.validatorsOrderAC);
            }
        }
        control.markAllAsTouched();
        control.updateValueAndValidity({ emitEvent: false });
    }

    private clearAndAddValidatorsConfigs(control: AbstractControl<any, any>, vfcs: ValidatorFieldConfig[], validationModes: ValidationMode[]) {
        control.clearValidators();
        control.setErrors(null);
        vfcs.forEach(vfc => {
            if (vfc.validatorsAlways && vfc.validatorsAlways.length > 0) {
                control.addValidators(vfc.validatorsAlways);
            }
            if (validationModes.includes(ValidationMode.VALIDATORS_BOOKING)) {
                if (vfc.validatorsBooking && vfc.validatorsBooking.length > 0) {
                    control.addValidators(vfc.validatorsBooking);
                }
            }
            if (validationModes.includes(ValidationMode.VALIDATORS_DRAFT)) {
                if (vfc.validatorsDraft && vfc.validatorsDraft.length > 0) {
                    control.addValidators(vfc.validatorsDraft);
                }
            }
            if (validationModes.includes(ValidationMode.VALIDATORS_ORDER)) {
                if (vfc.validatorsOrder && vfc.validatorsOrder.length > 0) {
                    control.addValidators(vfc.validatorsOrder);
                }
            }
            if (validationModes.includes(ValidationMode.VALIDATORS_BOOKING_AC)) {
                if (vfc.validatorsBookingAC && vfc.validatorsBookingAC.length > 0) {
                    control.addValidators(vfc.validatorsBookingAC);
                }
            }
            if (validationModes.includes(ValidationMode.VALIDATORS_ORDER_AC)) {
                if (vfc.validatorsOrderAC && vfc.validatorsOrderAC.length > 0) {
                    control.addValidators(vfc.validatorsOrderAC);
                }
            }
        });
        control.markAllAsTouched();
        control.updateValueAndValidity({ emitEvent: false });
    }
}
