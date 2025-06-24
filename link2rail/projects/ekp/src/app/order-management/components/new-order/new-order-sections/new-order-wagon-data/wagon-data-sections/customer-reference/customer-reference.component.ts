import { AfterViewInit, ChangeDetectorRef, Component, inject, Input } from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { ExternalReference, RailOrder, WagonInformation } from "@src/app/order-management/models/rail-order-api";
import { ValidationMode } from "../../../../validators/validator-field.config";
import { CustomerReferenceValidators } from "../goods-information-list/validators/customer-references.validators";

@Component({
  selector: 'app-customer-reference',
  templateUrl: './customer-reference.component.html',
  styleUrls: ['./customer-reference.component.scss']
})
export class CustomerReferenceComponent implements AfterViewInit {
  @Input() formGroup: FormGroup;
  @Input() railOrder: RailOrder;
  @Input() editMode: boolean;
  @Input() wagonInformation: WagonInformation;
  @Input() validationMode: ValidationMode;
  @Input() idx: number; // wagon

  private hasAC: boolean;

  ngOnInit(): void {
    this.initForm();
    const templateNumber = this.railOrder?.templateNumber?.toString().trim();
    this.hasAC = !!templateNumber;
  }

  ngAfterViewInit(): void {
    this.addLinesToForm();
    this.cd.detectChanges();
  }

  constructor(private cd: ChangeDetectorRef) {

  }

  private onChangeFormGroup(changes: any): void {
    const wagonInfo = this.railOrder?.wagonInformation[this.idx];

    if (wagonInfo?.externalReferences) {
      // Loop through each form control in the 'customerReferenceFormArray'
      this.customerReferenceFormArray.controls.forEach((control) => {
        const formValue = control.value;

        if (formValue?.identifier) {
          // Find the corresponding 'CRR' reference from the wagon's externalReferences
          const existingReference = wagonInfo.externalReferences.find(
            ref => ref?.type === 'CRR' && ref?.identifier === formValue.identifier
          );

          if (existingReference) {
            // Example of modifying an existing reference - you can update other fields if necessary
            existingReference.identifier = formValue.identifier;  // You may choose to update other fields here as well
          } else {
            // If the 'CRR' reference doesn't exist, you can add a new one to the externalReferences
            const newReference: ExternalReference = {
              type: 'CRR',
              identifier: formValue.identifier,  
            };
            wagonInfo.externalReferences.push(newReference);
          }
        }
      });
    }
  }

  private addLinesToForm(): void {
    const wagonInfo = this.railOrder?.wagonInformation[this.idx];

    // Early return if no external references
    if (!wagonInfo?.externalReferences?.length) {
      this.addLine();
      return;
    }

    // Check if 'CRR' type exists and add line if found
    const crrItem = wagonInfo.externalReferences.find(item => item?.type === 'CRR');
    if (crrItem) {
      this.addLine(crrItem);
    } else {
      this.addLine();
    }
  }

  private initForm(): void {
    this.formGroup.addControl('customerReferenceFormArray', new FormArray([]));
    if (this.validationMode != ValidationMode.VALIDATORS_DRAFT) {
       this.formGroup.get('customerReferenceFormArray').addValidators(CustomerReferenceValidators.validateCustomerReferenceFormArray());
    }
    this.formGroup.get('customerReferenceFormArray').valueChanges.subscribe({
      next: (c) => this.onChangeFormGroup(c)
    });
  }

  protected addLine(reference?: ExternalReference): void {
    if (this.customerReferenceFormArray?.length < 5) {
      this.customerReferenceFormArray.push(this.createGroup(reference));
    }
  }

  private createGroup(reference?: ExternalReference): FormGroup {
    const formGroup: FormGroup = new FormGroup({
      'identifier': new FormControl(reference?.identifier || '')
    });
    return formGroup;
  }

  protected removeLine(idx: number): void {
    if (this.customerReferenceFormArray.length > 1) {
      const tmp: ExternalReference[] = [];
      const temp: AbstractControl<any, any>[] = [];
      let count_1 = 0;
      for (const item of this.customerReferenceFormArray.controls) {
        if (count_1 !== idx) {
          temp.push(item);
        }
        count_1++;
      }
      this.customerReferenceFormArray.controls = temp;
      let counter = 0;
      for (const item of this.railOrder.wagonInformation[this.idx].externalReferences) {
        if (counter !== idx) {
          tmp.push(item);
        }
        counter++;
      }
      this.railOrder.wagonInformation[this.idx].externalReferences = tmp;
    } else if (this.customerReferenceFormArray.length === 1) {
      const ctl = this.customerReferenceFormArray.controls[0];
      ctl.clearValidators();
      ctl.reset();
      ctl.updateValueAndValidity();
      this.railOrder.wagonInformation[this.idx].externalReferences = [];
    }
  }

  get customerReferenceFormArray(): FormArray {
    return this.formGroup.get('customerReferenceFormArray') as FormArray;
  }
}