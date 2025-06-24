// Angular
import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
// RxJS
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
// Services
import { RailOrderInternalService } from "@src/app/order-management/service/rail-order-internal.service";
// Models
import { CodeNamePair } from "@src/app/order-management/models/general-order";
import { ExceptionalConsignment, initialExceptionalConsignment, RailOrder, WagonInformation } from "../../../../../../models/rail-order-api";
// Validators
import { ValidationMode } from "../../../../validators/validator-field.config";
import { WagonInformationUtils } from "../wagon-information-utils";
import { AuthorisationValidators } from "../goods-information-list/validators/authorizations.validators";


@Component({
  selector: 'app-authorization-list',
  templateUrl: './authorization-list.component.html',
  styleUrls: ['./authorization-list.component.scss']
})

export class AuthorizationListComponent implements OnInit {

  @Input() railOrder: RailOrder;
  @Input() formGroup: FormGroup;
  @Input() editMode: boolean;
  @Input() wagonInformation: WagonInformation;
  @Input() validationMode: ValidationMode;

  private hasAC: boolean;
  private railwayCompanyChange: Subject<string> = new Subject<string>();
  protected railwayCompanyAutocomplete: CodeNamePair[] = [];

  constructor(private fb: FormBuilder,
    private railOrderInternalService: RailOrderInternalService,
    private cd: ChangeDetectorRef) {
    this.registerForInputChanges();
  }

  ngOnInit(): void {
    this.initForm();
    const templateNumber = this.railOrder?.templateNumber?.toString().trim();
    this.hasAC = !!templateNumber;
  }

  ngAfterViewInit(): void {
    this.addLinesToForm();
    this.cd.detectChanges();
  }

  private addLinesToForm(): void {
    if (this.wagonInformation.exceptionalConsignments?.length === 0) {
      this.addNewLine();
    } else if (this.wagonInformation.seals.length !== this.authorizationList.length) {
      this.setFormValues();
    }
  }

  private registerForInputChanges(): void {
    this.railwayCompanyChange.pipe(debounceTime(500)).subscribe((input: string) => {
      this.getRailwayCompanyAutocomplete(input);
    });
  }

  private initForm(): void {
    this.formGroup.addControl('authorizationList', this.fb.array([]));
    if (this.validationMode !== ValidationMode.VALIDATORS_DRAFT) {
      this.formGroup.get('authorizationList').addValidators(AuthorisationValidators.validateAuthorisationFormArray(this.wagonInformation));
    }

    this.formGroup.get('authorizationList').valueChanges.subscribe({
      next: (changes) => this.onChangeFormGroup(changes)
    });
  }

  private onChangeFormGroup(changes: any): void {
    this.wagonInformation.exceptionalConsignments = [];
    if (changes.length) {
      for (const change of changes) {
        this.wagonInformation.exceptionalConsignments.push({
          imCode: change.imCode,
          permissionNumber: change.permissionNumber,
        });
      }
    }
  }

  private setFormValues(): void {
    // Clear existing form array if needed
    this.authorizationList?.clear();

    const consignments = this.wagonInformation?.exceptionalConsignments;

    if (consignments?.length) {
      let isBzaAlreadyAdded = false;

      consignments.forEach((item: ExceptionalConsignment) => {
        const isBza = item.imCode === '2180';

        // Add the first occurrence of imCode '2180' only once
        if (isBza && !isBzaAlreadyAdded) {
          isBzaAlreadyAdded = true;
          this.addNewLine(item);
        } else if (!isBza) {
          this.addNewLine(item);
        }
      });
    } else {
      // Add an empty line if there are no consignments
      this.addNewLine(null);
    }
  }

  protected get authorizationList(): FormArray {
    return this.formGroup?.get('authorizationList') as FormArray;
  }

  protected getControl(i: number, controlName: string): FormControl {
    const group = this.authorizationList.at(i) as FormGroup;
    return group.get(controlName) as FormControl;
  }

  protected getImCode(i: number): FormControl {
    return this.getControl(i, 'imCode');
  }

  protected getPermissionNumber(i: number): FormControl {
    return this.getControl(i, 'permissionNumber');
  }

  protected addNewLine(item?: ExceptionalConsignment | null): void {
    if (item == null || !item) {
      item = initialExceptionalConsignment();
      this.wagonInformation.exceptionalConsignments.push(item);
    }

    const itemGroup: FormGroup = this.fb.group({
      imCode: new FormControl(item.imCode),
      permissionNumber: new FormControl(item.permissionNumber)
    });

    this.authorizationList.push(itemGroup);

  }

  protected removeLine(idx: number): void {
    const listLength = this.authorizationList.length;

    if (listLength > 1) {
      this.authorizationList.removeAt(idx);
      this.wagonInformation.exceptionalConsignments.splice(idx + 1, 1);
    } else {
      this.resetLine(0);
      this.wagonInformation.exceptionalConsignments = listLength === 2
        ? this.wagonInformation.exceptionalConsignments.slice(0, 1)
        : [];
    }

    this.authorizationList.updateValueAndValidity();
  }

  private resetLine(index: number): void {
    const group = this.authorizationList.at(index);
    const imCodeControl = group.get('imCode');
    const permissionNumberControl = group.get('permissionNumber');

    imCodeControl?.clearValidators();
    imCodeControl?.setValue(null);
    imCodeControl?.setErrors(null);

    permissionNumberControl?.clearValidators();
    permissionNumberControl?.setValue(null);
    permissionNumberControl?.setErrors(null);
  }
  
  protected autocompleteInputChanged(event: any, field: string): void {
    if (field === 'im-code') {
      this.railwayCompanyChange.next(event.target.value);
    } else {
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

  private getRailwayCompanyAutocomplete(input: string): void {
    this.railOrderInternalService.getRailwayCompanies().subscribe((result: CodeNamePair[]) => {
      // Step 1: Filter out '2180' and then build a distinct list of valid companies
      const filteredResults = result.filter(company => company.code !== '2180');

      // Step 2: Remove duplicates based on 'company.code'
      const distinctResults = Array.from(
        new Map(filteredResults.map(company => [company.code, company])).values()
      );
      // Step 3: Sort the results by 'company.code' in ascending order
      const sortedResults = distinctResults.sort((a, b) => a.code.localeCompare(b.code));

      // Optionally, update the autocomplete with the sorted distinct results
      this.railwayCompanyAutocomplete = sortedResults;

    });
  }

  protected trackByFn(index: any, item: any): any {
    return index;
  }

  protected imCodeSelected(index: number): void {
    const consignments = this.wagonInformation?.exceptionalConsignments;
    const selectedImCode = this.getImCode(index)?.value;

    if (!consignments || !selectedImCode) return;
    const isBza = consignments[0]?.imCode === '2180';
    const targetIndex = isBza ? index + 1 : index;

    // Add a new line if the target consignment doesn't exist
    if (!consignments[targetIndex]) {
      this.addNewLine(null);
    }

    consignments[targetIndex].imCode = selectedImCode;
  }

  protected permissionNumberChanged(index: number) {
    const exceptionalConsignments = this.wagonInformation?.exceptionalConsignments;
    if (!exceptionalConsignments) return;

    const permissionNumber = this.getPermissionNumber(index)?.value;

    if (exceptionalConsignments[0]?.imCode === "2180") {
      // Ensure there is a next entry
      if (!exceptionalConsignments[index + 1]) {
        this.addNewLine(null);
      }
      exceptionalConsignments[index + 1].permissionNumber = permissionNumber;
    } else {
      // Ensure there is a current entry
      if (!exceptionalConsignments[index]) {
        this.addNewLine(null);
      }
      exceptionalConsignments[index].permissionNumber = permissionNumber;
    }
    WagonInformationUtils.checkForDuplicatePermissionNumbers(this.formGroup);
  }

  protected removeInvalidImCodeOnBlur(index: number): void {
    
    const imCodeControl = this.getImCode(index);
    const enteredImCode = imCodeControl?.value;

    // Step 1: Filter out the valid company codes from distinctResults
    const validCompanyCodes = this.railwayCompanyAutocomplete.map(company => company.code.toLowerCase());

    // Step 2: Check if the entered value is a valid company code
    const isValidImCode = !enteredImCode || validCompanyCodes.includes(enteredImCode.toLowerCase());

    // Step 3: If the input is invalid, clear the value and set an error
    if (!isValidImCode) {
      // Clear the input field
      imCodeControl.setValue(null);

      // Set an error to indicate the input is invalid
      imCodeControl.setErrors({ invalidCompanyCode: true });

      // Trigger validation again
      imCodeControl.updateValueAndValidity();
    }
  }
}