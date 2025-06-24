import { AbstractControl, FormArray, ValidationErrors } from "@angular/forms";
import { BaseValidators } from "./base-validations";

export class WagonListValidators {

    static wagonListValidatorOrder(group: AbstractControl): ValidationErrors | null {

        const wagonList = group.get('wagonData').get('wagonInformationList');
        const formArray = wagonList as FormArray;
        BaseValidators.clearWagonNumbersSet();

        let requiresGoodWeight = true;
        let isValid = true;

        const specialTreatmentOrders = group.get('service')?.get('serviceSpecification') as FormArray;
        const serviceGoodWeightObligatoryCodes = ['341', '342', '344', '345'];

        // Determine if the service requires good weight
        specialTreatmentOrders.controls.forEach((control) => {
            const productExtraChargeCode = control.get('productExtraChargeCode')?.value || null;
            if (serviceGoodWeightObligatoryCodes.includes(String(productExtraChargeCode))) {
                requiresGoodWeight = false;
            }
        });


        if (Array.isArray(formArray.controls)) {
            formArray.controls?.forEach((control) => {
                const wagonNumberControl = control.get('wagonNumber');
                wagonNumberControl.setErrors(null);
                const wagonNumber = wagonNumberControl?.value || null;

                const typeOfWagonControl = control.get('typeOfWagon');
                typeOfWagonControl.setErrors(null);
                const typeOfWagon = typeOfWagonControl?.value || null;

                const firstGoodWeightControl = control.get('firstGoodWeight');
                firstGoodWeightControl.setErrors(null);
                const goodWeight = firstGoodWeightControl?.value || null;

                const firstGoodNhmCodeControl = control.get('firstGoodNhmCode');
                firstGoodNhmCodeControl.setErrors(null);
                const nhmCode = firstGoodNhmCodeControl?.value || null;

                const loadingStatusControl = control.get('loadingStatus');
                loadingStatusControl.setErrors(null);
                const loadingState = loadingStatusControl?.value ?? null;



                const lengthErrors = BaseValidators.wagonNumberLengthValidator(wagonNumber);
                const luhnErrors = BaseValidators.wagonNumberLuhnValidator(wagonNumber);
                const wagonNumberDuplicateErrors = BaseValidators.wagonNumberDuplicateValidator(wagonNumber);
                const wagonNumberIsNumericErrors = BaseValidators.wagonNumberIsNumeric(wagonNumber);


                // Combine errors from validators
                const combinedWagonNumberErrors = {
                    ...(lengthErrors || {}),
                    ...(luhnErrors || {}),
                    ...(wagonNumberDuplicateErrors || {}),
                    ...(wagonNumberIsNumericErrors || {}),
                };

                // Apply combined errors to the control
                wagonNumberControl?.setErrors(
                    Object.keys(combinedWagonNumberErrors).length > 0 ? combinedWagonNumberErrors : null
                );

                // Update validity status
                if (Object.keys(combinedWagonNumberErrors).length > 0) {
                    isValid = false;
                }


                const missingWagonTypeError = BaseValidators.typeOfWagonValidator(wagonNumber, typeOfWagon)
                typeOfWagonControl.setErrors(missingWagonTypeError)
                if (typeOfWagonControl.errors) {
                    isValid = false;
                }


                const firstGoodNhmError = BaseValidators.firstGoodNhmValidator(nhmCode, group);
                const firstGoodNhmErrors = {
                    ...(firstGoodNhmError || {}),
                };

                firstGoodNhmCodeControl?.setErrors(
                    Object.keys(firstGoodNhmErrors).length > 0 ? firstGoodNhmErrors : null
                );

                if (firstGoodNhmCodeControl.errors) {
                    isValid = false;
                }

                const goodWeightReqiredError = BaseValidators.goodWeightReqiredValidator(goodWeight, loadingState, requiresGoodWeight);
                const valueHasNoDecimalError = BaseValidators.valueHasNoDecimal(goodWeight);
                const valueIsPositivError = BaseValidators.valueIsPositiv(goodWeight);

                const combinedGoodWeightErrors = {
                    ...(goodWeightReqiredError || {}),
                    ...(valueHasNoDecimalError || {}),
                    ...(valueIsPositivError || {}),
                };

                // Apply combined errors to the control
                firstGoodWeightControl?.setErrors(
                    Object.keys(combinedGoodWeightErrors).length > 0 ? combinedGoodWeightErrors : null
                );

                if (firstGoodWeightControl.errors?.length > 0) {
                    isValid = false;
                }

                // Loading State
                const loadingStateErrors = BaseValidators.loadingStateRequiredValidator(goodWeight, loadingState);
                const combinedloadingStateErrors = {
                    ...(loadingStateErrors || {}),
                };

                // Apply combined errors to the control
                loadingStatusControl?.setErrors(
                    Object.keys(combinedloadingStateErrors).length > 0 ? combinedloadingStateErrors : null
                );

                if (combinedloadingStateErrors.errors?.length > 0) {
                    isValid = false;
                }
            });
        }

        return isValid ? null : { wagonListInvalid: true };
    }


    static wagonListValidatorBooking(group: AbstractControl): ValidationErrors | null {
        const wagonList = group.get('wagonData').get('wagonInformationList');
        const formArray = wagonList as FormArray;
        BaseValidators.clearWagonNumbersSet();

        let requiresGoodWeight = true;
        let isValid = true;

        const specialTreatmentOrders = group.get('service')?.get('serviceSpecification') as FormArray;
        const serviceGoodWeightObligatoryCodes = ['341', '342', '344', '345'];

        // Determine if the service requires good weight
        specialTreatmentOrders.controls.forEach((control) => {
            const productExtraChargeCode = control.get('productExtraChargeCode')?.value || null;
            if (serviceGoodWeightObligatoryCodes.includes(String(productExtraChargeCode))) {
                requiresGoodWeight = false;
            }
        });


        if (Array.isArray(formArray.controls)) {
            formArray.controls?.forEach((control) => {
                const wagonNumberControl = control.get('wagonNumber');
                wagonNumberControl.setErrors(null);
                const wagonNumber = wagonNumberControl?.value || null;

                const typeOfWagonControl = control.get('typeOfWagon');
                typeOfWagonControl.setErrors(null);
                const typeOfWagon = typeOfWagonControl?.value || null;

                const firstGoodWeightControl = control.get('firstGoodWeight');
                firstGoodWeightControl.setErrors(null);
                const goodWeight = firstGoodWeightControl?.value || null;

                const firstGoodNhmCodeControl = control.get('firstGoodNhmCode');
                firstGoodNhmCodeControl.setErrors(null);
                const nhmCode = firstGoodNhmCodeControl?.value || null;

                const loadingStatusControl = control.get('loadingStatus');
                loadingStatusControl.setErrors(null);
                const loadingState = loadingStatusControl?.value ?? null;

                if (wagonNumber) {

                    const lengthErrors = BaseValidators.wagonNumberLengthValidator(wagonNumber);
                    const luhnErrors = BaseValidators.wagonNumberLuhnValidator(wagonNumber);
                    const wagonNumberDuplicateErrors = BaseValidators.wagonNumberDuplicateValidator(wagonNumber);
                    const wagonNumberIsNumericErrors = BaseValidators.wagonNumberIsNumeric(wagonNumber);

                    // Combine errors from validators
                    const combinedWagonNumberErrors = {
                        ...(lengthErrors || {}),
                        ...(luhnErrors || {}),
                        ...(wagonNumberDuplicateErrors || {}),
                        ...(wagonNumberIsNumericErrors || {}),
                    };

                    // Apply combined errors to the control
                    wagonNumberControl?.setErrors(
                        Object.keys(combinedWagonNumberErrors).length > 0 ? combinedWagonNumberErrors : null
                    );

                    // Update validity status
                    if (Object.keys(combinedWagonNumberErrors).length > 0) {
                        isValid = false;
                    }
                } else {
                    wagonNumberControl?.setErrors(null)
                }

                const missingWagonTypeError = BaseValidators.typeOfWagonValidator(wagonNumber, typeOfWagon)
                typeOfWagonControl.setErrors(missingWagonTypeError)
                if (typeOfWagonControl.errors) {
                    isValid = false;
                }


                const firstGoodNhmError = BaseValidators.firstGoodNhmValidator(nhmCode, group);
                const firstGoodNhmErrors = {
                    ...(firstGoodNhmError || {}),
                };

                firstGoodNhmCodeControl?.setErrors(
                    Object.keys(firstGoodNhmErrors).length > 0 ? firstGoodNhmErrors : null
                );

                if (firstGoodNhmCodeControl.errors) {
                    isValid = false;
                }

                //const goodWeightReqiredError = BaseValidators.goodWeightReqiredValidator(goodWeight, loadingState, requiresGoodWeight);
                const valueHasNoDecimalError = BaseValidators.valueHasNoDecimal(goodWeight);
                const valueIsPositivError = BaseValidators.valueIsPositiv(goodWeight);

                // Combine errors from validators
                const combinedGoodWeightErrors = {
                    ...(valueHasNoDecimalError || {}),
                    ...(valueIsPositivError || {}),
                };

                // Apply combined errors to the control
                firstGoodWeightControl?.setErrors(
                    Object.keys(combinedGoodWeightErrors).length > 0 ? combinedGoodWeightErrors : null
                );

                if (firstGoodWeightControl.errors?.length > 0) {
                    isValid = false;
                }
                const loadingStateErrors = BaseValidators.loadingStateRequiredValidator(goodWeight, loadingState);

                const combinedloadingStateErrors = {
                    ...(loadingStateErrors || {}),
                };

                if (combinedloadingStateErrors.errors?.length > 0) {
                    isValid = false;
                }

                // Apply combined errors to the control
                loadingStatusControl?.setErrors(
                    Object.keys(combinedloadingStateErrors).length > 0 ? combinedloadingStateErrors : null
                );

                if (firstGoodWeightControl.errors?.length > 0) {
                    isValid = false;
                }
            });
        }
        // Return overall validity
        return isValid ? null : { wagonListInvalid: true };
    }
}