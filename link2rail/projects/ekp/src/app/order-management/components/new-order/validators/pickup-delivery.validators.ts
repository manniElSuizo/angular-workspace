import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";

export class PickupDeliveryValidators {

    static shippingDateValidatorOrder(group: AbstractControl): ValidationErrors | null {
        const formGroup = group.get('pickupDelivery') as FormGroup;
        const shippingDateControl = formGroup.get('shippingDate');
        const shippingTimeControl = formGroup.get('shippingTime');
        shippingDateControl.setErrors(null);
        shippingTimeControl.setErrors(null);

        // Check if controls exist
        if (!shippingDateControl || !shippingTimeControl) {
            return null; // No validation possible if controls are missing
        }
        const shippingDateValue = shippingDateControl.value;
        const shippingTimeValue = shippingTimeControl.value;
        let dateError:ValidationErrors=null;
        let timeError:ValidationErrors=null;
        let invalidShippingDateError:ValidationErrors = null
        let shippingDateInPastError:ValidationErrors = null

        // Check if both date and time are provided
        if (!shippingDateValue) {
            shippingDateControl.setErrors({ shippingDateRequired: true })
            
            dateError = { shippingDateRequired: true }; // No validation if either value is missing
        }

        if (!shippingTimeValue) {
            shippingTimeControl.setErrors({ shippingTimeRequired: true })
            timeError = { shippingTimeRequired: true };
        }
        
        // Combine date and time into a single Date object
        const shippingDate = new Date(`${shippingDateValue}T${shippingTimeValue}`);
        if (isNaN(shippingDate.getTime())) {
            invalidShippingDateError =  { invalidShippingDate: true }; // Invalid date
        }

        // Compare shipping date with the current date
        const now = new Date();
        if (shippingDate < now) {
            //shippingDateControl.setErrors({ shippingDateInPast: true })
           // shippingDateInPastError = { shippingDateInPast: true }; // Shipping date is in the past
        }

        const dateDateTimeErrors = {
            ...(dateError || {}),
            ...(timeError || {}),
            ...(invalidShippingDateError || {}),
            ...(shippingDateInPastError || {}),
        };

        return  Object.keys(dateDateTimeErrors).length > 0 ? dateDateTimeErrors : null;
    }

    static shippingDateValidatorBooking(group: AbstractControl): ValidationErrors | null {
        const formGroup = group.get('pickupDelivery') as FormGroup;
        const shippingDateControl = formGroup.get('shippingDate');
        const shippingTimeControl = formGroup.get('shippingTime');
        shippingDateControl.setErrors(null);
        shippingTimeControl.setErrors(null);

        // Check if controls exist
        if (!shippingDateControl || !shippingTimeControl) {
            return null; // No validation possible if controls are missing
        }
        const shippingDateValue = shippingDateControl.value;
        const shippingTimeValue = shippingTimeControl.value;

        // Check if both date and time are provided
        if (!shippingDateValue) {
            shippingDateControl.setErrors({ shippingDateRequired: true })
            return { shippingDateRequired: true }; // No validation if either value is missing
        }

        if (!shippingTimeValue) {
            shippingTimeControl.setErrors({ shippingTimeRequired: true })
            return { shippingTimeRequired: true };
        }

        // Combine date and time into a single Date object
        const shippingDate = new Date(`${shippingDateValue}T${shippingTimeValue}`);
        if (isNaN(shippingDate.getTime())) {
            return { invalidShippingDate: true }; // Invalid date
        }

        // Compare shipping date with the current date
        const now = new Date();
        if (shippingDate < now) {
               shippingDateControl.setErrors({ shippingDateInPast: true })
               return {  shippingDateInPast: true }; // Shipping date is in the past
        }

        return null; // No errors
    }

    static pickupStationHasMaritimePoint(group: AbstractControl): ValidationErrors | null {
        const pickupCountry = group.get('pickupCountry')?.value;
        const locationCode = group.get('pickupStation')?.value;
        const pickupSealoadingpoint = group.get('pickupSealoadingpoint')?.value;
        const pickupSealoadingpointControl = group.get('pickupSealoadingpoint');
        const pickupSealoadingpointCount = group.get('pickupSealoadingpointCount')?.value;

        if (pickupCountry  && String(pickupCountry) != '80') return null;

        if (!locationCode) {
            // If there's no locationCode, no need to proceed
            return null;
        }

        if (!pickupSealoadingpoint && pickupSealoadingpointCount > 0) {
            const err = { pickupSealoadingpointRequired: true };
            pickupSealoadingpointControl?.setErrors(err); // Set the error
        } else {
            pickupSealoadingpointControl?.setErrors(null); // Clear errors if any
        }

        // Return the validation result
        return !pickupSealoadingpoint && pickupSealoadingpointCount > 0
            ? { pickupSealoadingpointRequired: true }
            : null;

    }

    static deliveryStationHasMaritimePoint(group: AbstractControl): ValidationErrors | null {
        const deliveryCountry = group.get('deliveryCountry')?.value;
        const locationCode = group.get('deliveryStation')?.value;
        const deliverySealoadingpoint = group.get('deliverySealoadingpoint')?.value;
        const deliverySealoadingpointControl = group.get('deliverySealoadingpoint');
        const deliverySealoadingpointCount = group.get('deliverySealoadingpointCount')?.value;

        if (deliveryCountry  && String(deliveryCountry) != '80') return null;
        
        if (!locationCode) {
            // If there's no locationCode, no need to proceed
            deliverySealoadingpointControl
            return null;
        }

        if (!deliverySealoadingpoint && deliverySealoadingpointCount > 0) {
            const err = { deliverySealoadingpointRequired: true };
            deliverySealoadingpointControl?.setErrors(err); // Set the error
        } else {
            deliverySealoadingpointControl?.setErrors(null); // Clear errors if any
        }

        // Return the validation result
        return !deliverySealoadingpoint && deliverySealoadingpointCount > 0
            ? { deliverySealoadingpointRequired: true }
            : null;

    }

}