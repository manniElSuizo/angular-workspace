import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { initialSeal, RailOrder, Seal, WagonInformation } from "../../../../../../models/rail-order-api";
import { ValidationMode } from "../../../../validators/validator-field.config";
import { SealingValidators } from "../goods-information-list/validators/sealings.validators";

@Component({
  selector: 'app-sealing-list',
  templateUrl: './sealing-list.component.html',
  styleUrls: ['./sealing-list.component.scss']
})

export class SealingListComponent implements OnInit, AfterViewInit {
  @Input() railOrder: RailOrder;
  @Input() formGroup: FormGroup;
  @Input() editMode: boolean;
  @Input() wagonInformation: WagonInformation;
  @Input() validationMode: ValidationMode;

  private hasAC: boolean;

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initForm();
    const templateNumber = this.railOrder?.templateNumber?.toString().trim();
    this.hasAC = !!templateNumber; // Ensures a boolean value
  }

  ngAfterViewInit() {
    this.addLinesToForm();
    this.cd.detectChanges();
  }

  private initForm(): void {
    this.formGroup.addControl('sealingList', this.fb.array([]));
    if (this.validationMode !== ValidationMode.VALIDATORS_DRAFT) {
      this.formGroup.get('sealingList').addValidators(SealingValidators.validateSealsFormArray());
    }
    this.formGroup.get('sealingList').valueChanges.subscribe({
      next: (changes) => this.onChangeFormGroup(changes)
    });
  }

  private addLinesToForm(): void {
    if (this.wagonInformation.seals.length === 0) {
      this.addNewLine();
    } else if (this.wagonInformation.seals.length !== this.sealingList.length) {
      this.setFormValues();
    }
  }
  private onChangeFormGroup(changes: any): void {
    this.wagonInformation.seals = [];
    if (changes.length) {
      for (const change of changes) {
        this.wagonInformation.seals.push({
          type: change.type,
          referenceNumber: change.referenceNumber
        });
      }
    }
  }
  
  private setFormValues(): void {
    this.sealingList.clear();

    if (this.wagonInformation.seals?.length) {
      this.wagonInformation.seals.forEach((item: Seal) => {
        this.addNewLine(item);
      });
    } else {
      this.addNewLine();
    }
  }

  protected get sealingList(): FormArray {
    return this.formGroup.get('sealingList') as FormArray;
  }

  protected getControl(i: number, controlName: string): FormControl {
    return this.sealingList.at(i).get(controlName) as FormControl;
  }

  protected getType(i: number): FormControl {
    return this.getControl(i, 'type');
  }

  protected getReferenceNumber(i: number): FormControl {
    return this.getControl(i, 'referenceNumber');
  }

  protected addNewLine(item?: Seal): void {
    const newItem = item || initialSeal();

    const itemGroup: FormGroup = this.fb.group({
      type: new FormControl(newItem.type),
      referenceNumber: new FormControl(newItem.referenceNumber)
    });

    this.sealingList.push(itemGroup);

    if (!item) {
      this.wagonInformation.seals.push(newItem);
    }
  }

  private isAllFieldsEmpty(itemGroup: FormGroup): boolean {
    return Object.keys(itemGroup.controls).every(key => {
      const value = itemGroup.get(key)?.value;
      return value === '' || value === undefined || value === null;
    });
  }

  private disableAllFields(itemGroup: FormGroup): void {
    Object.keys(itemGroup.controls).forEach(key => {
      const control = itemGroup.get(key);
      if (control) {
        control.disable({ emitEvent: false });
      }
    });
    this.cd.markForCheck();
  }

  protected removeLine(idx: number): void {
    if (this.sealingList.length > 1) {
      // Remove the FormGroup from the sealingList FormArray
      this.sealingList.removeAt(idx);

      // Also remove the corresponding seal from the wagonInformation.seals array
      this.wagonInformation.seals.splice(idx, 1);
    } else if (this.sealingList.length === 1) {
      this.clearLastLine();
    }
    this.cd.detectChanges();
  }

  private clearLastLine(): void {
    const typeControl = this.sealingList.controls[0].get('type');
    const referenceNumberControl = this.sealingList.controls[0].get('referenceNumber');

    // Clear validators and reset values for 'type' and 'referenceNumber'
    typeControl?.clearValidators();
    typeControl?.setValue(null);
    typeControl?.setErrors(null);

    referenceNumberControl?.clearValidators();
    referenceNumberControl?.setValue(null);
    referenceNumberControl?.setErrors(null);

    this.wagonInformation.seals = []; // Reset the seals array
  }

  protected isRowModified(rowIndex: number): boolean {
    return this.sealingList.at(rowIndex)?.dirty || false;
  }
}