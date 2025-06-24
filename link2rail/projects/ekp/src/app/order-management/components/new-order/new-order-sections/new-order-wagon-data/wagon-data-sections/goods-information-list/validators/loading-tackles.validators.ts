import { FormArray, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { WagonInformation } from "@src/app/order-management/models/rail-order-api";
import { WagonInformationUtils } from "../../wagon-information-utils";

export class LoadingTacklesValidators {
    static validateLoadingTacklesFormArray(wagonInformation: WagonInformation): ValidatorFn {
        return (formArray: FormArray): ValidationErrors | null => {
            const tacklesWeight = LoadingTacklesValidators.calculateLoadingTacklesWeight(formArray);
            const formArrayErrors: ValidationErrors[] = [];

            formArray.controls.forEach((formGroup: FormGroup) => {
                const loadingTackleNumberControl = formGroup.get('numberOfLoadingTackles');
                const loadingTackleTypeControl = formGroup.get('type');
                const loadingTackleWeightControl = formGroup.get('weight');
                const loadingTackleIdentifierControl = formGroup.get('identifier');

                const loadingTackleNumber = loadingTackleNumberControl?.value || 0;
                const loadingTackleType = loadingTackleTypeControl?.value || null;
                const loadingTackleWeight = loadingTackleWeightControl?.value || 0;

                // Initialize the error object for each control
                let numberErrors: ValidationErrors = {};
                let typeErrors: ValidationErrors = {};
                let weightErrors: ValidationErrors = {};

                // Validate the number of loading tackles
                if (!loadingTackleType && (loadingTackleNumber || loadingTackleWeight)) {
                    weightErrors = { ...weightErrors, typeRequired: true };
                    formArrayErrors.push(weightErrors);
                }

                if (loadingTackleNumber && loadingTackleNumber > 99) {
                    numberErrors = { ...numberErrors, numberTooLarge: true };
                    formArrayErrors.push(numberErrors);
                }

                if (!loadingTackleNumber && (loadingTackleType || loadingTackleWeight)) {
                    numberErrors = { ...numberErrors, numberRequired: true };
                    formArrayErrors.push(numberErrors);
                }

                if (!loadingTackleType && (loadingTackleNumber || loadingTackleWeight)) {
                    typeErrors = { ...typeErrors, typeRequired: true };
                    formArrayErrors.push(typeErrors);
                }

                if (!loadingTackleWeight && (loadingTackleNumber || loadingTackleType)) {
                    weightErrors = { ...weightErrors, weightRequired: true };
                    formArrayErrors.push(weightErrors);
                }

                // Check the total weight of the wagon
                const goodWeight = WagonInformationUtils.getGoodsWeight(wagonInformation);
                const totalWeight = tacklesWeight + goodWeight;

                if (totalWeight > 600000) {
                    weightErrors = { ...weightErrors, wagonWeightTooHigh: true };
                    formArrayErrors.push(weightErrors);
                }

                // Apply errors to the controls if there are any
                if (Object.keys(numberErrors).length > 0) {
                    loadingTackleNumberControl?.setErrors(numberErrors, { emitEvent: false });
                } else {
                    loadingTackleNumberControl?.setErrors(null, { emitEvent: false });
                }

                if (Object.keys(typeErrors).length > 0) {
                    loadingTackleTypeControl?.setErrors(typeErrors, { emitEvent: false });
                } else {
                    loadingTackleTypeControl?.setErrors(null, { emitEvent: false });
                }

                if (Object.keys(weightErrors).length > 0) {
                    loadingTackleWeightControl?.setErrors(weightErrors, { emitEvent: false });
                } else {
                    loadingTackleWeightControl?.setErrors(null, { emitEvent: false });
                }

                if (Object.keys(loadingTackleIdentifierControl?.errors || {}).length > 0) {
                    loadingTackleIdentifierControl?.setErrors({ identifierRequired: true });
                } else {
                    loadingTackleIdentifierControl?.setErrors(null, { emitEvent: false });
                }
            });
            return formArrayErrors.length ? formArrayErrors : null;
        }
    }
    static validateLoadingTacklesFormGroup(wagonInformation: WagonInformation): ValidatorFn {
        return (formGroup: FormGroup): ValidationErrors | null => {
            const loadingTackleNumberControl = formGroup.get('numberOfLoadingTackles');
            const loadingTackleTypeControl = formGroup.get('type');
            const loadingTackleWeightControl = formGroup.get('weight');
            const loadingTackleIdentifierControl = formGroup.get('identifier');

            const loadingTackleNumber = loadingTackleNumberControl?.value || 0;
            const loadingTackleType = loadingTackleTypeControl?.value || null;
            const loadingTackleWeight = loadingTackleWeightControl?.value || 0;

            // Initialize the error object for each control
            let numberErrors: ValidationErrors = {};
            let typeErrors: ValidationErrors = {};
            let weightErrors: ValidationErrors = {};

            const formGroupErrors: ValidationErrors[] = [];

            // Validate the number of loading tackles
            if (!loadingTackleType && (loadingTackleNumber || loadingTackleWeight)) {
                weightErrors = { ...weightErrors, typeRequired: true };
                formGroupErrors.push(weightErrors);
            }

            if (loadingTackleNumber && loadingTackleNumber > 99) {
                numberErrors = { ...numberErrors, numberTooLarge: true };
                formGroupErrors.push(numberErrors);
            }

            if (!loadingTackleNumber && (loadingTackleType || loadingTackleWeight)) {
                numberErrors = { ...numberErrors, numberRequired: true };
                formGroupErrors.push(numberErrors);
            }

            if (!loadingTackleType && (loadingTackleNumber || loadingTackleWeight)) {
                typeErrors = { ...typeErrors, typeRequired: true };
                formGroupErrors.push(typeErrors);
            }

            if (!loadingTackleWeight && (loadingTackleNumber || loadingTackleType)) {
                weightErrors = { ...weightErrors, weightRequired: true };
                formGroupErrors.push(weightErrors);
            }

            // Check the total weight of the wagon
            let tacklesWeight: number = 0;
            wagonInformation.loadingTackles.forEach(lt => {
                if (lt.weight) {
                    tacklesWeight += lt.weight;
                }
            });

            const goodWeight = WagonInformationUtils.getGoodsWeight(wagonInformation);
            const totalWeight = tacklesWeight + goodWeight;

            if (totalWeight > 600000) {
                weightErrors = { ...weightErrors, wagonWeightTooHigh: true };
                formGroupErrors.push(weightErrors);
            }

            // Apply errors to the controls if there are any
            if (Object.keys(numberErrors).length > 0) {
                loadingTackleNumberControl?.setErrors(numberErrors, { emitEvent: false });
            } else {
                loadingTackleNumberControl?.setErrors(null, { emitEvent: false });
            }

            if (Object.keys(typeErrors).length > 0) {
                loadingTackleTypeControl?.setErrors(typeErrors, { emitEvent: false });
            } else {
                loadingTackleTypeControl?.setErrors(null, { emitEvent: false });
            }

            if (Object.keys(weightErrors).length > 0) {
                loadingTackleWeightControl?.setErrors(weightErrors, { emitEvent: false });
            } else {
                loadingTackleWeightControl?.setErrors(null, { emitEvent: false });
            }

            if (Object.keys(loadingTackleIdentifierControl?.errors || {}).length > 0) {
                loadingTackleIdentifierControl?.setErrors({ identifierRequired: true });
            } else {
                loadingTackleIdentifierControl?.setErrors(null, { emitEvent: false });
            }
            return formGroupErrors.length ? formGroupErrors : null;
        }
    }

    private static calculateLoadingTacklesWeight(formArray: FormArray): number {
        let totalWeight = 0;

        // Iterate over the form array of loading tackles
        formArray.controls.forEach((loadingTackleGroup: FormGroup) => {
            const weightControl = loadingTackleGroup.get('weight');
            const weight = Number(weightControl?.value) || 0;

            // Sum the weights of each loading tackle
            totalWeight += weight;
        });

        return totalWeight;
    }
}