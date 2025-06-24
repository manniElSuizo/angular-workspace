import { FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";

export class ConsignorConsigneeValidators {
    
    static freightPayerConsignorAuthority(freightpayerConsignorGroup: FormGroup): ValidationErrors | null {
        const authorityOfCustomerIdControl = freightpayerConsignorGroup.get('authorityOfCustomerId');
        const authorityOfCustomerId = authorityOfCustomerIdControl?.value || null;
        const zipCode = freightpayerConsignorGroup.get('zipCode')?.value || null;
        const sgv = freightpayerConsignorGroup.get('sgv')?.value || null;
        const error = { freightpayerConsignorGroupAuthorityMissing: true };
    
        if (!authorityOfCustomerId && (zipCode || sgv)) {
            authorityOfCustomerIdControl?.setErrors({ ...authorityOfCustomerIdControl.errors, ...error });
            return error;
        }
    
        // Clear only this specific error without affecting others
        if (authorityOfCustomerIdControl?.hasError('freightpayerConsignorGroupAuthorityMissing')) {
            const currentErrors = { ...authorityOfCustomerIdControl.errors };
            delete currentErrors.freightpayerConsignorGroupAuthorityMissing;
            authorityOfCustomerIdControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
        }
    
        return null;
    }
    
    static freightpayerConsignorSgvZip(freightpayerConsignorGroup: FormGroup): ValidationErrors {
        freightpayerConsignorGroup.get('zipCode').setErrors(null);
        freightpayerConsignorGroup.get('sgv').setErrors(null);
        const freightpayerConsignorZip = freightpayerConsignorGroup.get('zipCode');
        const freightpayerConsignorSgv = freightpayerConsignorGroup.get('sgv');

        const zip = freightpayerConsignorGroup.get('zipCode').value;
        const sgv = freightpayerConsignorGroup.get('sgv').value;
        const zipEmpty = (!zip || zip == null || zip.trim().length < 1);
        const sgvEmpty = (!sgv || sgv == null || sgv < 1);
        const error = { freightpayerConsignorInvalidCombinationSgvZip: true };

        if ((zipEmpty && sgvEmpty) || (!zipEmpty && !sgvEmpty)) {
            return null;
        }

        if (sgvEmpty) {
            freightpayerConsignorSgv.setErrors(error);
            return {error};
        }
        return null;
    }

    static freightpayerConsignorSgvIsNumeric(freightpayerConsignorGroup: FormGroup): ValidationErrors {
        
        const sgvControl = freightpayerConsignorGroup.get('sgv');
        const sgv = freightpayerConsignorGroup.get('sgv').value;
        const isSgvNumeric= ConsignorConsigneeValidators.valueIsNumeric(sgv);
        const error = { freightpayerConsignorSgvNotNumeric: true }
        if (isSgvNumeric == false) {
            sgvControl.setErrors(error)
            return error ;
        }
        return null;
    }


    static valueIsNumeric(value: string | null) {
        if (!value) return null;
        const cleanValue: string = value?.replace(/\D/g, '') || null;
        if (!cleanValue) return false;
        if (cleanValue.length != value.trim().length) {
            return false;
        }
        return true;
    }

    static freightpayerConsignorZipSgv(freightpayerConsignorGroup: FormGroup): ValidationErrors {
        freightpayerConsignorGroup.get('zipCode').setErrors(null);
        //freightpayerConsignorGroup.get('sgv').setErrors(null);
        const zip = freightpayerConsignorGroup.get('zipCode').value;
        const sgv = freightpayerConsignorGroup.get('sgv').value;
        const zipEmpty = (!zip || zip == null || zip.trim().length < 1);
        const sgvEmpty = (!sgv || sgv == null || sgv < 1);

        if ((zipEmpty && sgvEmpty) || (!zipEmpty && !sgvEmpty)) {
            return null;
        }

    if (zipEmpty) {
            return { freightpayerConsignorInvalidCombinationZipSgv: true };
        }
        return null;

    }

    static loadingPartyCustomerIdNumeric(formGroup: FormGroup): ValidationErrors {
        const isValid = ConsignorConsigneeValidators.customerIdValidation(formGroup.get('sgv') as FormControl, formGroup.get('authorityOfCustomerId') as FormControl);
        if (isValid) {
            return null;
        }
        return { loadingPartyCustomerIdMustBeNumeric: true };
    }

    

    static consigneeCustomerIdNumeric(formGroup: FormGroup): ValidationErrors {
        const isValid = ConsignorConsigneeValidators.customerIdValidation(formGroup.get('customerId') as FormControl, formGroup.get('authorityOfCustomerId') as FormControl);
        if (isValid) {
            return null;
        }
        return { consigneeCustomerIdMustBeNumeric: true };
    }

    private static customerIdValidation(formControlCustomerId: FormControl, formControlAuthority: FormControl): boolean {
        const authorityOfCustomerId = formControlAuthority.value;
        if (authorityOfCustomerId == '80') {
            const customerId = formControlCustomerId.value;
            if (isNaN(Number(customerId))) {
                return false;
            }
        }
        return true;
    }

    static ConsigneeGermanZipCode(consigneeGroup: FormGroup): ValidationErrors | null {
        const zipCodeControl = consigneeGroup.get('zipCode');
        const authorityControl = consigneeGroup.get('authorityOfCustomerId');
        zipCodeControl.setErrors(null); // Clear previous errors
        consigneeGroup.setErrors(null);
        if (!zipCodeControl || !authorityControl) {
            return null; // Exit if controls are missing
        }

        const zip = zipCodeControl.value?.trim(); // Trim zip code value
        const authorityOfCustomerId = authorityControl.value;
    
        if (zip && authorityOfCustomerId === '80') {
            if (zip.length !== 5) {
                const error = { zipCodeGermanInvalid: true };
                zipCodeControl.setErrors(error);
                return error;
            }
        }

        if(!zip || zip =='') {
            const error = { zipCodeRequired : true };
            zipCodeControl.setErrors(error);
            return error;
        }
    
        return null; // Return null if no validation errors
    }
    

    static loadingPartySgvZip(loadingPartyGroup: FormGroup): ValidationErrors {
        
        loadingPartyGroup.get('sgv').setErrors(null);
        const zip = loadingPartyGroup.get('zipCode').value;
        const authorityOfCustomerId = loadingPartyGroup.get('authorityOfCustomerId').value;
        
            if (zip && authorityOfCustomerId == '80' && (!loadingPartyGroup.get('sgv').value || loadingPartyGroup.get('sgv').value.trim().length < 1)) {
                loadingPartyGroup.get('sgv').setErrors({ loadingPartyCustomerIdInvalidCombinationSgvZip: true });
                return { loadingPartyCustomerIdInvalidCombinationSgvZip: true };
        }
        return null;
    }

    static unloadingPartySgv(unloadingParty: FormGroup): ValidationErrors {
        
        unloadingParty.get('sgv').setErrors(null);
        const zip = unloadingParty.get('zipCode').value;
        const authorityOfCustomerId = unloadingParty.get('authorityOfCustomerId').value;
        /*
            if (zip && authorityOfCustomerId == '80' && (!unloadingParty.get('sgv').value || unloadingParty.get('sgv').value.trim().length < 1)) {
                unloadingParty.get('sgv').setErrors({ unloadingPartySgvZip: true });
                return { unloadingPartySgvZip: true };
        }*/


          if(authorityOfCustomerId == '80' && !ConsignorConsigneeValidators.valueIsNumeric(unloadingParty.get('sgv').value)){
            unloadingParty.get('sgv').setErrors({ unloadingPartySgvNoNumeric: true });
            return { unloadingPartySgvNoNumeric: true };
        }
        return null;   
    }

    static unloadingPartyZip(unloadingParty: FormGroup): ValidationErrors {
        unloadingParty.get('zipCode').setErrors(null);
        const sgv = unloadingParty.get('sgv').value;
        const authorityOfCustomerId = unloadingParty.get('authorityOfCustomerId').value;
        if (sgv && authorityOfCustomerId == '80' && (!unloadingParty.get('zipCode').value || unloadingParty.get('zipCode').value.trim().length < 1)) {
            unloadingParty.get('zipCode').setErrors({ unloadingPartyZipRequired: true });
            return { unloadingPartyZipRequired: true };
        }

        return null;
    }

    static loaderZip(loadingPartyGroup: FormGroup): ValidationErrors {
        loadingPartyGroup.get('zipCode').setErrors(null);
        const sgv = loadingPartyGroup.get('sgv').value;
        const authorityOfCustomerId = loadingPartyGroup.get('authorityOfCustomerId').value;
        if (sgv && authorityOfCustomerId == '80' && (!loadingPartyGroup.get('zipCode').value || loadingPartyGroup.get('zipCode').value.trim().length < 1)) {
            loadingPartyGroup.get('zipCode').setErrors({ loaderZipRequired: true });
            return { loaderZipRequired: true };
        }

        return null;
    }

   

    static freightPayerConsigneeSgvNumeric(freightPayerConsignee: FormGroup): ValidationErrors {
        freightPayerConsignee.get('sgv').setErrors(null);
        const authorityOfCustomerId = freightPayerConsignee.get('authorityOfCustomerId').value;
        if (authorityOfCustomerId == '80' && (!freightPayerConsignee.get('sgv').value || freightPayerConsignee.get('sgv').value.trim().length < 1)) {
            freightPayerConsignee.get('sgv').setErrors({ freightPayerSgvRequired: true });
            return { freightPayerSgvRequired: true };
        }
        if(authorityOfCustomerId == '80' && !ConsignorConsigneeValidators.valueIsNumeric(freightPayerConsignee.get('sgv').value)){
            freightPayerConsignee.get('sgv').setErrors({ freightPayerSgvNoNumeric: true });
            return { freightPayerSgvNoNumeric: true };
        }
        return null;   
    }

    static freightPayerConsigneeZipCodeRequired(freightPayerConsignee: FormGroup): ValidationErrors {

        freightPayerConsignee.get('zipCode').setErrors(null);
        const authorityOfCustomerId = freightPayerConsignee.get('authorityOfCustomerId').value;
        if ( authorityOfCustomerId == '80' && (!freightPayerConsignee.get('zipCode').value || freightPayerConsignee.get('zipCode').value.trim().length < 1)) {
            freightPayerConsignee.get('zipCode').setErrors({ freightPayerZipRequired: true });
            return {freightPayerZipRequired: true };
        }
        return null;
    }

}