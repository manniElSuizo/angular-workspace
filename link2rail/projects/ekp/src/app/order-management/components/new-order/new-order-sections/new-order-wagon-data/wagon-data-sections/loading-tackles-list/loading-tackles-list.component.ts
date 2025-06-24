import { Component, Input, OnInit, AfterViewInit, inject, ChangeDetectorRef, SimpleChanges } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { initalLoadingTackles, LoadingTackles, RailOrder, WagonInformation } from "../../../../../../models/rail-order-api";
import { RailOrderInternalService } from "@src/app/order-management/service/rail-order-internal.service";
import { CodeNamePair } from "@src/app/order-management/models/general-order";
import { ValidationMode } from "../../../../validators/validator-field.config";
import { FormFieldService } from "../../../../service/form-field.service";
import { LoadingTacklesValidators } from "../goods-information-list/validators/loading-tackles.validators";

@Component({
  selector: 'app-loading-tackles-list',
  templateUrl: './loading-tackles-list.component.html',
  styleUrls: ['./loading-tackles-list.component.scss']
})
export class LoadingTacklesListComponent implements OnInit, AfterViewInit {

  @Input() railOrder: RailOrder;
  @Input() formGroup: FormGroup;
  @Input() editMode: boolean;
  @Input() wagonInformation: WagonInformation;
  @Input() validationMode: ValidationMode;
 
  
  protected loadingTackles: CodeNamePair[] = []; 
  private formFieldService: FormFieldService = inject(FormFieldService);
  private hasAC :boolean;

  constructor(private fb: FormBuilder, private railOrderInternalService: RailOrderInternalService, private cd: ChangeDetectorRef) {
    this.createDropdownFields();
  }

  ngOnInit(): void {
    this.initForm();
    const templateNumber = this.railOrder?.templateNumber?.toString().trim();
    this.hasAC = !!templateNumber; // Ensures a boolean value
  }

  ngAfterViewInit(): void {
    this.addLinesToForm();
    this.cd.detectChanges();
  }

  private createDropdownFields(): void {
    this.createLoadingTackes();
  }

  private createLoadingTackes(): void {
    this.railOrderInternalService.getLoadingTackles().subscribe((result: CodeNamePair[]) => {
      this.loadingTackles = result;
    }); 
  }

  private addLinesToForm() {
    if (this.wagonInformation.loadingTackles.length === 0) {
      this.addNewLine();
    } else if (this.wagonInformation.loadingTackles.length !== this.loadingTacklesList.length) {
      this.setFormValues();
    }
  }

  private initForm(): void {
    this.formGroup.addControl('loadingTacklesList', this.fb.array([]));
    if(this.validationMode != ValidationMode.VALIDATORS_DRAFT) {
      this.formGroup.get('loadingTacklesList').addValidators(LoadingTacklesValidators.validateLoadingTacklesFormArray(this.wagonInformation));
    }
    this.formGroup.get('loadingTacklesList').valueChanges.subscribe({
      next: (c) => this.onChangeFormGroup(c)
    });
  }

  private setFormValues() {
    this.loadingTacklesList.clear();
    if (this.wagonInformation.loadingTackles?.length) {
      this.wagonInformation.loadingTackles.forEach((item: LoadingTackles) => {
        this.addNewLine(item);
      });
    } else {
      this.addNewLine();
    }
    this.formFieldService.disableFields(this.formGroup, 'wagonDetails', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  }

  protected get loadingTacklesList(): FormArray {
    return this.formGroup.get('loadingTacklesList') as FormArray;
  }

  protected getControl(i: number, controlName: string): FormControl {
    return this.loadingTacklesList.at(i).get(controlName) as FormControl;
  }

  protected getLoadingTacklesAt(idx: number): FormGroup {
    return this.loadingTacklesList.at(idx) as FormGroup;
  }
  
  public getNumberOfLoadingTackles(i: number): FormControl {
    return this.getControl(i, 'numberOfLoadingTackles');
  }

  public getType(i: number): FormControl {
    return this.getControl(i, 'type');
  }

  public getIdentifier(i: number): FormControl {
    return this.getControl(i, 'identifier');
  }

  public getWeight(i: number): FormControl {
    return this.getControl(i, 'weight');
  }

  protected addNewLine(item?: LoadingTackles): void {
    const newItem = item || initalLoadingTackles();
  
    const itemGroup: FormGroup = this.fb.group({
      numberOfLoadingTackles: new FormControl(newItem.number),
      type: new FormControl(newItem.type),
      identifier: new FormControl(newItem.identifier),
      weight: new FormControl(newItem.weight)
    });
    this.loadingTacklesList.push(itemGroup);
   
    // Check if the FormGroup's controls are empty or undefined
    if (this.hasAC && this.isAllFieldsEmpty(itemGroup)) {
      this.disableAllFields(itemGroup);
    }
  
    if (!item) {
      this.wagonInformation.loadingTackles.push(newItem);
    }
  }

  private onChangeFormGroup(changes: any) {
    this.wagonInformation.loadingTackles = [];
    if(changes.length) {
      const length = Number(changes.length);
      for(let i = 0;  i < length; i++) {
        this.wagonInformation.loadingTackles.push({
          type: changes[i].type,
          weight: changes[i].weight ? Number(changes[i].weight) : null,
          identifier: changes[i].identifier,
          number: changes[i].numberOfLoadingTackles
        });
      }
    }
  }

  // Check if all controls in the FormGroup are empty, undefined, or null
  private isAllFieldsEmpty(itemGroup: FormGroup): boolean {
    let isEmpty = true;

    // Check for empty or undefined values for each control
    Object.keys(itemGroup.controls).forEach(key => {
        const control = itemGroup.get(key);

        if (control) {
            const value = control.value;

            // Check if the value is empty, undefined, or null for all fields except weight
            if (key !== 'weight' && (value !== '' && value !== undefined && value !== null)) {
                isEmpty = false;  // If any control has a non-empty value, set isEmpty to false
            }

            // Check for specific case where weight is 0
            if (key === 'weight' && value !== 0 && value !== '' && value !== undefined && value !== null) {
                isEmpty = false;  // Consider weight as "not empty" if it’s non-zero
            }
        }
    });

    return isEmpty;  // Return true if all fields are empty, undefined, or null
}

  // Disable all fields in the FormGroup
  private disableAllFields(itemGroup: FormGroup): void {
    Object.keys(itemGroup.controls).forEach(key => {
      const control = itemGroup.get(key);
      if (control) {
        control.disable({emitEvent: false});
      }
    });
  
    // Ensure Angular reflects changes (mark for change detection)
    this.cd.markForCheck();
  }

  protected removeLine(idx: number): void {
    if (this.loadingTacklesList.length > 1) {
      this.loadingTacklesList.removeAt(idx);
      this.wagonInformation.loadingTackles.splice(idx, 1);
    } else if (this.loadingTacklesList.length === 1) {
      this.loadingTacklesList.controls[0].get('numberOfLoadingTackles').clearValidators();
      this.loadingTacklesList.controls[0].get('numberOfLoadingTackles').setValue(null);      

      this.loadingTacklesList.controls[0].get('type').clearValidators();
      this.loadingTacklesList.controls[0].get('type').setValue(null);

      this.loadingTacklesList.controls[0].get('identifier').clearValidators();
      this.loadingTacklesList.controls[0].get('identifier').setValue(null);

      this.loadingTacklesList.controls[0].get('weight').clearAsyncValidators();
      this.loadingTacklesList.controls[0].get('weight').setValue(null);
      this.wagonInformation.loadingTackles = [];
    }
  }
  
  isRowModified(rowIndex: number): boolean {
    return this.loadingTacklesList.at(rowIndex)?.dirty || false;
  }
/*
  isControlInvalid(rowIndex: number, controlName: string): boolean {
    const control = this.getControl(rowIndex, controlName);
    return this.isRowModified(rowIndex) && control.invalid && (control.touched || control.dirty);
  }
    */
}