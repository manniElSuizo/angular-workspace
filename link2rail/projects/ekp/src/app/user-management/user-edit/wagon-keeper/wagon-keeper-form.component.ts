import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@src/app/shared/shared.module';
import { User } from '../../model/user.model';
import { UserListService } from '../../user-list/user-list.service';
import { ListKeyValue, MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { TranslateService } from '@ngx-translate/core';
import { WagonKeeper } from '../../model/wagon-keeper.model';

export const FIELD_NAME_WAGON_KEEPERS = "wagonKeeperCodes";

@Component({
  selector: 'app-wagon-keeper-form',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule,
    FormDialogModule
],
  templateUrl: './wagon-keeper-form.component.html',
  styleUrl: './wagon-keeper-form.component.scss'
})
export class WagonKeeperFormComponent implements OnInit, AfterViewChecked, OnChanges {
  @Input() user: User;
  @ViewChild('wkmsac') wagonKeeperMultiSelectAutocomplete: MultiselectAutocompleteComponent;

  protected multiselectParams: MultiselectAutocompleteParameters;

  public wagonKeeperForm: FormGroup;

  protected fieldName = FIELD_NAME_WAGON_KEEPERS;

  protected wagonKeepers: WagonKeeper[] = [];

  protected selectedWagonKeepers: ListKeyValue[] = [];

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private userListService: UserListService,
    private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.wagonKeeperForm = this.formBuilder.group({});

    this.setMultiselectParams();
    console.log("this.multiselectParams", this.multiselectParams);
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.user && this.wagonKeeperMultiSelectAutocomplete){
      this.addMultiselectChildFormGroup();
      this.setWagonKeeperValues();
    }
  }

  private setMultiselectParams() {
    this.multiselectParams = {
      i18n: {
        fieldText: this.translateService.instant("Wagonholder-component.Table-header.Wagonkeeper"),
        labelText: this.translateService.instant("Wagonholder-component.Table-header.Wagonkeeper"),
        errorText: "Error",
        searchPlaceholderText: this.translateService.instant("Shared.Search-button-label"),
        noDataAvailablePlaceholderText: "Keine Daten vorhanden"
      },
      fieldName: FIELD_NAME_WAGON_KEEPERS,
      fieldId: FIELD_NAME_WAGON_KEEPERS,
      divId: FIELD_NAME_WAGON_KEEPERS + "Div",
      formControlName: FIELD_NAME_WAGON_KEEPERS,

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.fetchWagonKeepers(searchInput, array);
      },
      selectedItems: [],
      minQueryLength: 1
    };
  }

  private addMultiselectChildFormGroup() {
    if(!this.wagonKeeperForm.get('childFormWagonKeeperCodes')) {
      this.wagonKeeperForm.addControl('childFormWagonKeeperCodes', this.wagonKeeperMultiSelectAutocomplete.multiselectForm);
      this.wagonKeeperMultiSelectAutocomplete.multiselectForm.setParent(this.wagonKeeperForm);
    }
  }

  public setWagonKeeperValues() {
    this.wagonKeeperMultiSelectAutocomplete.selectedItems = this.user.wagonKeepers && this.user.wagonKeepers.length ? this.user.wagonKeepers.map(wk => {
      return {key: wk.shortName, value: this.wagonKeeperToDisplayValue(wk)};
    }) : [];
    this.selectedWagonKeepers = this.wagonKeeperMultiSelectAutocomplete.selectedItems;
    this.wagonKeeperMultiSelectAutocomplete.updateKeyValueList();
    this.wagonKeeperCodes.setValue(this.user.wagonKeepers && this.user.wagonKeepers.length ? this.user.wagonKeepers.map(wk => {
      return {key: wk.shortName, value: this.wagonKeeperToDisplayValue(wk)};
    }) : null);
  }

  private wagonKeeperToDisplayValue(wk: WagonKeeper): string {
    return wk.longName + " (" + wk.shortName + ")";
  }

  protected searchWagonKeeper(): void {
    this.fetchWagonKeepers(this.wagonKeeperForm.get("wagonKeeperSearch").value, []);
  }

  private fetchWagonKeepers(query: string, selected: ListKeyValue[]): void {
    this.userListService.wagonKeepersGet(query).subscribe({
      next: wkr => {
        this.wagonKeepers = wkr.carKeepers;

        const resultList: ListKeyValue[] = [...selected];
        this.wagonKeepers = this.wagonKeepers.sort((a, b) => a.longName.localeCompare(b.longName));
        this.wagonKeepers.forEach(keeper => {
          const found = resultList.find(kv => kv.key == keeper.shortName && kv.value == this.wagonKeeperToDisplayValue(keeper));
          if (!found) {
            resultList.push({ key: keeper.shortName, value: this.wagonKeeperToDisplayValue(keeper) });
          }
        });
        this.wagonKeeperMultiSelectAutocomplete.dataList = resultList;
        console.log("this.multiselectVehicleKeeperCodes.dataList", this.wagonKeeperMultiSelectAutocomplete.dataList);
        return resultList;
      }
    });
  }

  protected removeWagonKeeper(key: string) {
    const idx = this.wagonKeeperMultiSelectAutocomplete.selectedItems.findIndex(v => v.key == key);
    this.wagonKeeperMultiSelectAutocomplete.selectedItems.splice(idx, 1);
    const resultList: ListKeyValue[] = [...this.wagonKeeperMultiSelectAutocomplete.selectedItems];
    this.wagonKeepers = this.wagonKeepers.sort((a, b) => a.longName.localeCompare(b.longName));
    this.wagonKeepers.forEach(keeper => {
      const found = resultList.find(kv => kv.key == keeper.shortName && kv.value == this.wagonKeeperToDisplayValue(keeper));
      if (!found) {
        resultList.push({ key: keeper.shortName, value: this.wagonKeeperToDisplayValue(keeper) });
      }
    });
    this.wagonKeeperMultiSelectAutocomplete.dataList = resultList;
    this.wagonKeeperCodes.setValue(this.wagonKeeperMultiSelectAutocomplete.selectedItems);
  }

  protected multiselectChangeEventListener(event): void {
    this.selectedWagonKeepers = this.wagonKeeperMultiSelectAutocomplete.selectedItems;
  }

  public getWagonKeeperCodes(): string[] | null {
    if(!this.wagonKeeperCodes.value || this.wagonKeeperCodes.value == null || !this.wagonKeeperCodes.value.length) {
      return [];
    }
    return this.wagonKeeperCodes.value.map((lkv: ListKeyValue) => lkv.key);
  }

  get wagonKeeperCodes(): FormControl {
    return this.wagonKeeperMultiSelectAutocomplete.multiselectForm.get(this.multiselectParams.fieldId) as FormControl;
  }
}

