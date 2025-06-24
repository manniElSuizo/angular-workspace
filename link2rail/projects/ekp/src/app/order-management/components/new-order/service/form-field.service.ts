import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { RailOrder } from '../../../models/rail-order-api';
import { fieldConfig } from './field-config';
import { FieldConfig } from '../models/new-order-field.config';

@Injectable({
  providedIn: 'root'
})
export class FormFieldService {

  private emitEvent: boolean = false;

  constructor() { }

  public disableFields(formGroup: FormGroup, formGroupName: string, railOrder: RailOrder, editMode: boolean, isNew: boolean = false): void {
    const isAc = (railOrder.templateNumber != null && railOrder.templateNumber.length > 0);
    if(isAc) {
      isNew = false;
    }
    if (!editMode) {
      formGroup.disable({emitEvent: this.emitEvent});
      return;
    }
    Object.keys(formGroup.controls).forEach(key => {
      if (formGroup.controls[key] instanceof FormGroup) {
        this.disableFields(formGroup.controls[key] as FormGroup, formGroupName + '.' + key, railOrder, editMode, isNew);
      } else if(formGroup.controls[key] instanceof FormArray) {
        (formGroup.controls[key] as FormArray).controls.forEach((fg: FormGroup) => this.disableFields(fg, formGroupName + '.' + key, railOrder, editMode, isNew));
      } else {
        if (this.isDisabled(`${formGroupName}.${key}`, railOrder, isAc, isNew)) {
          formGroup.controls[key].disable({emitEvent: this.emitEvent});
        }
      }
    });
  }

  // TODO if we want to use method in component, change access modifier to public
  private isDisabled(fieldName: string, railOrder: RailOrder, isAc: boolean, isNew: boolean): boolean {
    const foundFieldConfig: FieldConfig = fieldConfig.find(fc => fc.fieldName == fieldName);
    // if no config for field was found => field stays enabled; return
    if(!foundFieldConfig) {
      return false;
    }
    if (foundFieldConfig.allwaysDisabled) {
      return true;
    }
    if(isNew) {
      return false;
    }
    const railOrderStatus = railOrder.status;
    // if stage is configured as disable, return true
    if(foundFieldConfig.disableStage && foundFieldConfig.disableStage.length > 0 && foundFieldConfig.disableStage.includes(railOrder.orderStage)) {
      return true;
    }

    // if mask is loaded with AC AND config says that field is NOT editable in AC-Mode => disable field; return
    if(isAc && !foundFieldConfig.editableAC) {
      return true;
    }

    // if status array in config has entries AND contains current railOrderStatus => field stays enabled; return
    if(foundFieldConfig.editableStatus && foundFieldConfig.editableStatus.length > 0 && foundFieldConfig.editableStatus.includes(railOrderStatus)) {
      return false;
    }

    // disable field in all other cases
    return false;
  }
}
