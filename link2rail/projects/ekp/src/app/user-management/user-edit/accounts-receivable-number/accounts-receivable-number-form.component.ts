import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@src/app/shared/shared.module';
import { User } from '../../model/user.model';
import { UserListService } from '../../user-list/user-list.service';
import { ListKeyValue, MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { TranslateService } from '@ngx-translate/core';
import { AccountsReceivableNumber } from '../../model/accountsreveivablenumber.model';

export const FIELD_NAME_ACCOUNTS_RECEIVABLE_NUMBER = "AccountsReceivableNumbers";

@Component({
  selector: 'app-accounts-receivable-number-form',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule,
    FormDialogModule
],
  templateUrl: './accounts-receivable-number-form.component.html',
  styleUrl: './accounts-receivable-number-form.component.scss'
})
export class AccountsReceivableNumberComponent implements OnInit, AfterViewChecked, OnChanges {
  @Input() user: User;
  @ViewChild('armsac') accountsReceivableNumberMultiSelectAutocomplete: MultiselectAutocompleteComponent;

  protected multiselectParams: MultiselectAutocompleteParameters;

  public accountsReceivableNumberForm: FormGroup;

  protected fieldName = FIELD_NAME_ACCOUNTS_RECEIVABLE_NUMBER;

  protected accountsReceivableNumbers: AccountsReceivableNumber[] = [];

  protected selectedAccountsReceivableNumbers: ListKeyValue[] = [];

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private userListService: UserListService,
    private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.accountsReceivableNumberForm = this.formBuilder.group({});

    this.setMultiselectParams();
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.user && this.accountsReceivableNumberMultiSelectAutocomplete){
      this.addMultiselectChildFormGroup();
      this.setAccountsReceivableNumberValues();
    }
  }

  private setMultiselectParams() {
    this.multiselectParams = {
      i18n: {
        fieldText: this.translateService.instant("User-management-component.AccountsreceivableNumber"),
        labelText: this.translateService.instant("User-management-component.AccountsreceivableNumber"),
        errorText: this.translateService.instant('error text'),
        searchPlaceholderText: this.translateService.instant('User-management-component.SearchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translateService.instant('User-management-component.NoDataAvailablePlaceholderText')
      },
      fieldName: FIELD_NAME_ACCOUNTS_RECEIVABLE_NUMBER,
      fieldId: FIELD_NAME_ACCOUNTS_RECEIVABLE_NUMBER,
      divId: FIELD_NAME_ACCOUNTS_RECEIVABLE_NUMBER + "Div",
      formControlName: FIELD_NAME_ACCOUNTS_RECEIVABLE_NUMBER,

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.fetchAccountsReceivableNumbers(searchInput, array);
      },
      selectedItems: [],
      minQueryLength: 1
    };
  }

  private addMultiselectChildFormGroup() {
    if(!this.accountsReceivableNumberForm.get('childFormAccountsReceivableNumbers')) {
      this.accountsReceivableNumberForm.addControl('childFormAccountsReceivableNumbers', this.accountsReceivableNumberMultiSelectAutocomplete.multiselectForm);
      this.accountsReceivableNumberMultiSelectAutocomplete.multiselectForm.setParent(this.accountsReceivableNumberForm);
    }
  }

  public setAccountsReceivableNumberValues() {
    this.accountsReceivableNumberMultiSelectAutocomplete.selectedItems = this.user.accountsReceivableNumbers && this.user.accountsReceivableNumbers.length ? this.user.accountsReceivableNumbers.map(ar => {
      return {key: ar.accountsReceivableNumber, value: this.accountsReceivableNumberToDisplayValue(ar)};
    }) : [];
    this.selectedAccountsReceivableNumbers = this.accountsReceivableNumberMultiSelectAutocomplete.selectedItems;
    this.accountsReceivableNumberMultiSelectAutocomplete.updateKeyValueList();
    this.accountsReceivableNumbersFormControl.setValue(this.user.accountsReceivableNumbers && this.user.accountsReceivableNumbers.length ? this.user.accountsReceivableNumbers.map(ar => {
      return {key: ar.accountsReceivableNumber, value: this.accountsReceivableNumberToDisplayValue(ar)};
    }) : null);
  }

  private accountsReceivableNumberToDisplayValue(ar: AccountsReceivableNumber): string {
    return ar.customerName + " (" + ar.accountsReceivableNumber + ")";
  }

  protected searchAccountsReceivableNumber(): void {
    this.fetchAccountsReceivableNumbers(this.accountsReceivableNumberForm.get("accountsReceivableNumberSearch").value, []);
  }

  private fetchAccountsReceivableNumbers(query: string, selected: ListKeyValue[]): void {
    this.userListService.accountsReceivableNumbersGet(query).subscribe({
      next: arr => {
        this.accountsReceivableNumbers = arr.accountsReceivableNumbers;

        const resultList: ListKeyValue[] = [...selected];
        this.accountsReceivableNumbers = this.accountsReceivableNumbers.sort((a, b) => a.customerName.localeCompare(b.customerName));
        this.accountsReceivableNumbers.forEach(ar => {
          const found = resultList.find(kv => kv.key == ar.accountsReceivableNumber && kv.value == this.accountsReceivableNumberToDisplayValue(ar));
          if (!found) {
            resultList.push({ key: ar.accountsReceivableNumber, value: this.accountsReceivableNumberToDisplayValue(ar) });
          }
        });
        this.accountsReceivableNumberMultiSelectAutocomplete.dataList = resultList;
        return resultList;
      }
    });
  }

  protected removeAccountsReceivableNumber(key: string) {
    const idx = this.accountsReceivableNumberMultiSelectAutocomplete.selectedItems.findIndex(v => v.key == key);
    this.accountsReceivableNumberMultiSelectAutocomplete.selectedItems.splice(idx, 1);
    const resultList: ListKeyValue[] = [...this.accountsReceivableNumberMultiSelectAutocomplete.selectedItems];
    this.accountsReceivableNumbers = this.accountsReceivableNumbers.sort((a, b) => a.customerName.localeCompare(b.customerName));
    this.accountsReceivableNumbers.forEach(ar => {
      const found = resultList.find(kv => kv.key == ar.accountsReceivableNumber && kv.value == this.accountsReceivableNumberToDisplayValue(ar));
      if (!found) {
        resultList.push({ key: ar.accountsReceivableNumber, value: this.accountsReceivableNumberToDisplayValue(ar) });
      }
    });
    this.accountsReceivableNumberMultiSelectAutocomplete.dataList = resultList;
    this.accountsReceivableNumbersFormControl.setValue(this.accountsReceivableNumberMultiSelectAutocomplete.selectedItems);
  }

  protected multiselectChangeEventListener(event): void {
    this.selectedAccountsReceivableNumbers = this.accountsReceivableNumberMultiSelectAutocomplete.selectedItems;
  }

  public getAccountsReceivableNumbers(): string[] | null {
    if(!this.accountsReceivableNumbersFormControl.value || this.accountsReceivableNumbersFormControl.value == null || !this.accountsReceivableNumbersFormControl.value.length) {
      return [];
    }
    return this.accountsReceivableNumbersFormControl.value.map((lkv: ListKeyValue) => lkv.key);
  }

  get accountsReceivableNumbersFormControl(): FormControl {
    return this.accountsReceivableNumberMultiSelectAutocomplete.multiselectForm.get(this.multiselectParams.fieldId) as FormControl;
  }
}

