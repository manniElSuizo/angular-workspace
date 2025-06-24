import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";
import { PackingUnit, RailOrder, WagonInformation } from "../../../models/rail-order-api";

export class BaseValidators {


    static firstGoodNhmValidator(goodNhmCode: string | null, group: AbstractControl) {

        const isInternationalTransport = BaseValidators.isInterNationalTransportByControl(group as FormGroup);
        const invalidNhmCodeError = { invalidNhmCode: true };

        if (!goodNhmCode) return invalidNhmCodeError;

        // If not international transport no further checks
        if (!isInternationalTransport) return null;

        // Check NHM code validity: must be 6 characters and not start with '00'
        if (goodNhmCode.trim().length !== 6) return invalidNhmCodeError;
        if (goodNhmCode.startsWith('00')) return invalidNhmCodeError;
        return null;
    }

    static loadingStateRequiredValidator(goodWeight: number, loadingState: boolean): ValidationErrors | null {

        // If loadingState is false, it's required
        if (String(loadingState).length == 0) {
            return { LoadingStateRequired: true };
        }

        if (String(loadingState) == 'null') {
            return { LoadingStateRequired: true };
        }

        if (String(loadingState) == 'false') {
            // Check if there's weight for an empty wagon
            if (goodWeight > 0) {
                return { EmptyWagonHavingWeight: true };
            }

        }

        if ((String(loadingState) == 'true' && !goodWeight)) {
            // return { EmptyWagonHavingWeight: true };
        }

        // All validations passed
        return null;
    }


    static wagonNumbersSet: Set<string> = new Set();

    static clearWagonNumbersSet() {
        BaseValidators.wagonNumbersSet.clear();
    }

    static wagonNumberLengthValidator(controlValue: string): ValidationErrors | null {
        let isValid = true;
        const cleanWagonNumber = controlValue?.replace(/\D/g, '') || null;
        // Validate the length of the wagon number
        if (!cleanWagonNumber || cleanWagonNumber.length !== 12) {
            isValid = false;
        }
        if(!controlValue) controlValue="-";
        return isValid ? null : { ensureValidWagonNumber: controlValue };
    }

    static wagonNumberLuhnValidator(controlValue: string): ValidationErrors | null {
        let isValid = true;
        const cleanWagonNumber = controlValue?.replace(/\D/g, '') || null;

        // Validate the length of the wagon number
        if (cleanWagonNumber) {
            const isLuhn = BaseValidators.validateLuhn(cleanWagonNumber);
            if (!isLuhn) {
                isValid = false;
            }
        }

        return isValid ? null : { invalidChecksum: controlValue };
    }

    static wagonNumberDuplicateValidator(controlValue: string): ValidationErrors | null {

        let isValid = true;
        const cleanWagonNumber = controlValue?.replace(/\D/g, '') || null;


        // Validate the length of the wagon number

        if (cleanWagonNumber && BaseValidators.wagonNumbersSet.has(cleanWagonNumber)) {
            isValid = false;
        } else if (cleanWagonNumber) {
            BaseValidators.wagonNumbersSet.add(cleanWagonNumber);
        }

        return isValid ? null : { duplicateNumber: cleanWagonNumber };
    }

    static goodWeightIsNumeric(controlValue: number): ValidationErrors | null {
        let isValid = true;
        if (String(controlValue).length > 0 && isNaN(controlValue)) {
            isValid = false;
            { goodWeightNotNumeric: true }
        }
        return null;
    }

    static goodWeightStringIsNumeric(weight: string): ValidationErrors | null {
        // Trim whitespace from input
        const trimmedWeight = weight.trim();
    
        // Regex for matching integers or numbers with optional commas or periods as decimal separators
        const numericPattern = /^\d+([,.]0+)?$/;  // Matches integers or numbers like ".0", ",0", ".00", ",00", etc.
    
        // Check if the weight matches the numeric pattern
        if (!numericPattern.test(trimmedWeight)) {
            return { goodWeightNotNumeric: weight };
        }
    
        // Further validation: Check if the weight is a positive number and not zero or negative
        const numericValue = parseFloat(trimmedWeight.replace(',', '.')); // Replace comma with dot for float conversion
        if (numericValue < 0) {
            return { invalidWeight: weight };
        }
        return null;
    }

    static additionalDescriptionLength(controlValue: string): ValidationErrors | null {
        let isValid = true;
        if (controlValue && String(controlValue).length > 300) {
            isValid = false;
            return { additionInformationTooLong: controlValue }
        }
        return null;
    }

    static wagonNumberIsNumeric(controlValue: string): ValidationErrors | null {
        let isValid = true;
         // Remove spaces, hyphens, and any non-numeric characters
    const cleanWagonNumber = controlValue?.replace(/[\s-]/g, '');

    // Validate if the cleaned value is numeric and matches the expected conditions
     isValid = cleanWagonNumber?.length > 11 && !isNaN(Number(cleanWagonNumber));
     if(!controlValue) controlValue="-";
        return isValid ? null : { ensureValidWagonNumber: controlValue };
    }

    /**
     * Validate a number using the Luhn Algorithm.
     * @param number - The string representation of the number to validate.
     * @returns true if the number is valid according to Luhn's algorithm, false otherwise.
     */
    static validateLuhn(number: string) {

        let sum = 0;
        let shouldDouble = false;
        if (!number || number == '') return true;
        // Process digits from right to left
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i], 10);

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return sum % 10 === 0;
    }


    // Static method to validate type of wagon
    static typeOfWagonValidator(wagonNumber: string, typeOfWagon: string): ValidationErrors | null {
        const missingWagonTypeError = { noTypeOfWagon: true };

        const cleanWagonNumber = wagonNumber?.replace(/\D/g, '') || null;
        const isLuhn = BaseValidators.validateLuhn(cleanWagonNumber);
        if (!cleanWagonNumber && !typeOfWagon) return missingWagonTypeError;
        if(cleanWagonNumber?.length ==0 && !typeOfWagon) return missingWagonTypeError;
        if (!wagonNumber && !typeOfWagon) return missingWagonTypeError;
        if (!isLuhn && !typeOfWagon) return missingWagonTypeError;
        return null;
    }

    // Static method to validate first good weight

    static goodWeightReqiredValidator(goodWeight: number, loadingState: boolean, isWeightRequired: boolean): ValidationErrors | null {

        if ( String(loadingState) == 'true') {
            if (isWeightRequired && !goodWeight) {
                return { noGoodWeight: true }
            } 

            if(isWeightRequired && goodWeight < 0) {
                return { noGoodWeight: true }
            }
        }

        if ( String(loadingState) == 'false') {
                if(goodWeight > 0) {
                    return { EmptyWagonHavingWeight: true };
                }
        }

        
        return null;
    }
    static nhmHasSixNumbers(nhmCode: string): ValidationErrors | null {
        if (!/^\d{6}$/.test(nhmCode)) {
            return { nhmHasSixNumbers: nhmCode }
        }
        return null;
    }

    static valueHasNoDecimal(weight: number): ValidationErrors | null {
        if (weight === null || weight === undefined) {
            return null; // No weight, no validation error.    
        }
        const value = weight.toString();
        if (value.includes(',') || value.includes('.')) {
            return { decimalPlacesGoodWeight: weight };
        }
        return null; // Valid case. 
    }

    static stringHasNoDecimal(weight: string): ValidationErrors | null {
        if (!weight) {
            return null; // No weight, no validation error.
        }
    
        // Trim and remove unwanted characters (keeping only digits, '.' and ',')
        weight = weight.trim().replace(/[^0-9.,]/g, '');
    
        // Allow cases ending with .0, ,0, .00, or ,00
        if (
            (weight.includes('.') && !weight.match(/\.\d*0$/)) || 
            (weight.includes(',') && !weight.match(/,\d*0$/))
        ) {
            return { decimalPlacesGoodWeight: weight };
        }
    
        return null; // Valid case.
    }
    

    static valueIsPositiv(value: number): ValidationErrors | null {
        let isValid = (value !== null) && (value < 0) ? false : true;
        return isValid ? null : { noGoodWeight: true };
    }

    static isNationalTransport(railOrder: RailOrder): boolean {
        const pickupCountry = String(railOrder?.acceptancePoint?.authority)
        const deliveryCountry = String(railOrder?.deliveryPoint?.authority);
        return pickupCountry === '80' && deliveryCountry === '80';
    };

    static isMultiNationalTransport(railOrder: RailOrder): boolean {
        const pickupCountry = String(railOrder?.acceptancePoint?.authority)
        const deliveryCountry = String(railOrder?.deliveryPoint?.authority);
        return pickupCountry !== '80' && deliveryCountry !== '80';
    };

    static isInterNationalTransport(railOrder: RailOrder): boolean {
        const pickupCountry = String(railOrder?.acceptancePoint?.authority)
        const deliveryCountry = String(railOrder?.deliveryPoint?.authority);
        return pickupCountry !== '80' || deliveryCountry !== '80';
    };

    static isWagonWeightTooHigh(wagon: WagonInformation): ValidationErrors | null {
        let isValid = true;

        // Calculate loading tackles weight (ensure parsing to number)
        const loadingTacklesWeight = wagon.loadingTackles?.reduce(
            (sum, tackle) => sum + Number(tackle.weight || 0), 0
        ) || 0;

        // Calculate goods weight (ensure parsing to number)
        const goodsWeight = wagon.goods?.reduce(
            (sum, good) => sum + Number(good.weight || 0), 0
        ) || 0;

        // Check if total weight exceeds the limit
        if ((loadingTacklesWeight + goodsWeight) > 600000) {
            isValid = false;
        }

        return isValid ? null : { wagonWeightTooHigh: true };
    }

    static EiuEvuWithoutPermissionNumber(imCode: string, permissionNumber: string): ValidationErrors | null {
        // If both imCode and permissionNumber are absent, no validation error
        if (!imCode && !permissionNumber) {
            return null;
        }
        // If imCode exists but permissionNumber is missing, return validation error
        if (!imCode && permissionNumber) {
            return { hasImCodeWithoutPermissionNumber: true };
        }
        // Otherwise, no validation error
        return null;
    }

    static PermissionNumberWithoutEiuEvu(imCode: string, permissionNumber: string) {
        // If both imCode and permissionNumber are absent, no validation error
        if (!imCode && !permissionNumber) {
            return null;
        }
        // If permissionNumber exists but imCode is missing, return validation error
        if (!permissionNumber && imCode) {
            return { hasPermissionNumberWithoutImCode: true };
        }
        // Otherwise, no validation error
        return null;
    }

    static hasVolumeWithoutUnit(volume: number, unit: string): ValidationErrors | null {
        // If both volume and unit are absent, no validation error
        if (!volume && !unit) {
            return null;
        }

        // If volume exists but unit is missing, return validation error
        if (volume && !unit) {
            return { hasVolumeWithoutUnit: true };
        }

        // Otherwise, no validation error
        return null;
    }

    static hasUnitWithoutVolume(volume: number, unit: string): ValidationErrors | null {
        // If both volume and unit are absent, no validation error
        if (!volume && !unit) {
            return null;
        }

        // If unit exists but volume is missing, return validation error
        if (!volume && unit) {
            return { hasUnitWithoutVolume: true };
        }

        // Otherwise, no validation error
        return null;
    }

    static packingUnitNumberRequiredValidator(packingUnit: PackingUnit): ValidationErrors | null {
        if (!packingUnit.description && !packingUnit.type) {
            return null;
        }

        // If type exists but number is missing, return validation error
        if (packingUnit.type && !packingUnit.description) {
            return { packingUnitNumberRequired: true };
        }

        // Otherwise, no validation error
        return null;
    }

    static packingUnitTypeRequiredValidator(packingUnit: PackingUnit): ValidationErrors | null {
        if (!packingUnit.description && !packingUnit.type) {
            return null;
        }

        // If type exists but number is missing, return validation error
        if (!packingUnit.type && packingUnit.description) {
            return { packingUnitTypeRequired: true };
        }

        // Otherwise, no validation error
        return null;
    }

    static wasteIdRequiredValidator(modeOfTransport: string | null, wasteId: number | null): ValidationErrors | null {
        // If modeOfTransport is 'AT' and wasteId is missing, return the error
        return modeOfTransport === 'AT' && !wasteId ? { wasteIdRequired: true } : null;
    }

    static isValidMrnSubtype(mrnSubType: string | null): ValidationErrors | null {
        if (!mrnSubType || mrnSubType.length === 0) {
            return null;
        }
    
        const formattedSubType = this.parseMrnSubtype(mrnSubType);
        const validMrnSubTypes = ['03', '04', '05', '06', '07', '08', '09'];
    
        return validMrnSubTypes.includes(formattedSubType) ? null : { invalidMrnSubtype: mrnSubType };
    }
    
    static parseMrnSubtype(mrnSubType: string | null): string | null {
        if (!mrnSubType) return null; // Handle null or undefined input
    
        // Remove non-digit characters
        const parsed = mrnSubType.replace(/\D/g, '');
    
        // If parsed string is empty, return null
        if (parsed.length === 0) return null;
    
        // Pad with leading zero if length is less than 2
        return parsed.padStart(2, '0');
    }

    static validateMrnIdentifierRequired(mrnIdentifier: string | null, mrnSubType: string | null): ValidationErrors | null {
        const mrnSubTypeToNotValidate = ['01', '02'];
        if(mrnSubTypeToNotValidate.includes(mrnSubType)) {
            return null;
        }

        if (mrnSubType && !mrnIdentifier) {
            return { required: true };
        }
        return null;
    }

    static validateMrnIdentifierByType(mrnIdentifier: string | null, mrnSubType: string | null): ValidationErrors | null {
        if (!mrnIdentifier) return null;
        let hasError = false;
        const mrnSubTypeToValidate = ['03', '04', '05', '06', '07', '08', '09'];
    
        if (mrnSubTypeToValidate.includes(mrnSubType)) {
            if (['03', '04', '05'].includes(mrnSubType)) {
                if (mrnIdentifier?.startsWith("MRN")) {
                    // Must be exactly 21 characters long
                    if (mrnIdentifier.length !== 21) {
                        hasError = true;
                    }
                } else {
                    // Must be exactly 18 characters long
                    if (!mrnIdentifier || mrnIdentifier.length !== 18) {
                        hasError = true;
                    }
                }
            } else if (['06', '07', '08', '09'].includes(mrnSubType)) {
                // Validate MRN 06, 07, 08, 09: Max 21 characters, only alphanumeric
                if (!mrnIdentifier?.match(/^[a-zA-Z0-9]*$/) || mrnIdentifier.length > 21) {
                    hasError = true;
                }
            }
        }
    
        // Return errors if any, otherwise null
        return hasError ? { invalidFormatMrn: true } : null;
    }
    

    static MrnSubTypeRequiredValidator(mrnIdentifier: string | null, mrnSubType: string | null): ValidationErrors | null {
        if (!mrnIdentifier && !mrnSubType) {
            return null;
        }
        return (mrnIdentifier && !mrnSubType) ? { mrnSubTypeRequired: true } : null;
    }


    static isNationalTransportByControl(group: FormGroup): boolean {
        const pickupCountry = group.get('pickupDelivery').get('pickupCountry')?.value;
        const deliveryCountry = group.get('pickupDelivery').get('deliveryCountry')?.value;
        return pickupCountry === '80' && deliveryCountry === '80';
    };

    static isMultiNationalTransportByControl(group: FormGroup): boolean {
        const pickupCountry = group.get('pickupDelivery').get('pickupCountry')?.value;
        const deliveryCountry = group.get('pickupDelivery').get('deliveryCountry')?.value;
        return pickupCountry !== '80' && deliveryCountry !== '80';
    };

    static isInterNationalTransportByControl(group: FormGroup): boolean {
        const pickupCountry = group.get('pickupDelivery').get('pickupCountry')?.value;
        const deliveryCountry = group.get('pickupDelivery').get('deliveryCountry')?.value;
        return pickupCountry !== '80' || deliveryCountry !== '80';
    };

    static authorizationNumbersSet: Set<string> = new Set();

    static clearAuthorizationNumbersSet() {
        BaseValidators.authorizationNumbersSet.clear();
    }
    
}