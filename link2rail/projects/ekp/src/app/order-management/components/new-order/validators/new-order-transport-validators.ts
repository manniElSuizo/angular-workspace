import { FormGroup, ValidatorFn } from "@angular/forms";

// Rule 57
export const orderedTrainReferenceValidators: ValidatorFn = (group: FormGroup) => {
  
    const trainReference =  group.get('orderedTrainReference')
    const trainReferenceValue = trainReference?.value ? trainReference?.value : null;
    let isValid:boolean = true;
    trainReference?.setErrors(null);
    if(isNaN(trainReferenceValue)){
        trainReference.setErrors({notNumerik : true});
        isValid = false;
    }
    if(trainReferenceValue?.length > 6 ){
        trainReference.setErrors({toLength : true});
        isValid = false;
    }

    return isValid ? null : { trainReferenceInValide: true };
};