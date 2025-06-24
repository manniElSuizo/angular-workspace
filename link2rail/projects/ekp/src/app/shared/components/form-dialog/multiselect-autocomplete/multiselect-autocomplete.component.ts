import { AfterViewInit, ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

export interface ListKeyValue {
  key: string;
  value?: string;
}

export interface MultiselectAutocompleteParameters {
  i18n: {
    fieldText: string;
    labelText: string;
    errorText: string;
    searchPlaceholderText?: string;
    noDataAvailablePlaceholderText?: string;
  };
  fieldName: string;
  fieldId: string;
  divId: string;
  formControlName: string;
  dataCallback: Function;
  selectedItems: ListKeyValue[];
  minQueryLength?: number;
};

@Component({
  selector: 'app-multiselect-autocomplete',
  templateUrl: './multiselect-autocomplete.component.html',
  styleUrls: ['./multiselect-autocomplete.component.scss'],
})
export class MultiselectAutocompleteComponent implements OnInit, AfterViewInit, OnDestroy, DoCheck {
  @Output() formFieldSelectionEmitter = new EventEmitter<ListKeyValue[]>();
  @Output() formFieldEventEmitter = new EventEmitter<Event>();
  @Output() formFieldContentDeletedEmitter = new EventEmitter<Event>();
  @Input() multiselectAutocompleteParameters: MultiselectAutocompleteParameters;
  @Input() allowSearchFilter: boolean = true;
  @Input() singleSelection: boolean = false;

  private _dataList: ListKeyValue[] = [];
  public multiselectForm: FormGroup;
  public selectedItems: ListKeyValue[] = []; 

  protected dropdownSettings: IDropdownSettings = { allowSearchFilter: false };
  public searchInput: string = '';
  protected searchPlaceholderText: string;
  protected noDataAvailablePlaceholderText: string;
  protected placeholder = "place holder text";
  protected checkAll = false;

  private isSelectionChanged = false;
  private minQueryLength: number = 3;
  private maxDataListItemLength: number = 29;

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit(): void {
    this.searchPlaceholderText = this.multiselectAutocompleteParameters.i18n.searchPlaceholderText ? this.multiselectAutocompleteParameters.i18n.searchPlaceholderText : this.translate.instant('ControlMultiSelect.searchPlaceholderText');
    this.noDataAvailablePlaceholderText = this.multiselectAutocompleteParameters.i18n.noDataAvailablePlaceholderText ? this.multiselectAutocompleteParameters.i18n.noDataAvailablePlaceholderText : this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText');
    this.selectedItems = this.multiselectAutocompleteParameters.selectedItems;
    this.dataList = [...this.selectedItems];
    if(this.multiselectAutocompleteParameters.minQueryLength) {
      this.minQueryLength = this.multiselectAutocompleteParameters.minQueryLength;
    }
    this.removeOutsideClickEventHandler();

    this.setPlaceholderText();
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.initializeDropdownSettings(this.allowSearchFilter);
    this.multiselectForm = this.formBuilder.group({});
    this.multiselectForm.addControl(this.multiselectAutocompleteParameters.fieldId, new FormControl(''));
  }

  ngDoCheck(): void {
    this.addEventListenerForFocus();
  }

  ngOnDestroy(): void {
  }

  private removeOutsideClickEventHandler() {
    // const elementsWithClickOutsideEvent = document.querySelectorAll(".multiselect-dropdown")

    // elementsWithClickOutsideEvent.forEach(el => {
    //   el.replaceWith(el.cloneNode(true));
    // });
  }

  private setPlaceholderText() {
    document.querySelectorAll(".filter-textbox > input").forEach(el => {
      el.setAttribute("placeholder", this.searchPlaceholderText);
    });
  }

  private addEventListenerForFocus() {
    const element = document.getElementById(this.multiselectAutocompleteParameters.fieldId);
    
    if(element && !element.onclick) {
      element.onclick = (event) => {
        const multi = document.getElementById(this.multiselectAutocompleteParameters.fieldId);
        const filterTextboxes = multi.getElementsByClassName("filter-textbox");
        if(filterTextboxes && filterTextboxes.length > 0) {
          filterTextboxes.item(0).querySelector("input")?.focus();
        }
      };
    }
  }

  private initializeDropdownSettings(allowSearchFilter: boolean): void {
    this.dropdownSettings = {
      singleSelection: this.singleSelection,
      enableCheckAll: this.checkAll,
      selectAllText: "Alle auswählen",
      unSelectAllText: "deselekt",
      idField: 'key',
      textField: 'value',
      searchPlaceholderText: this.searchPlaceholderText,
      maxHeight: 400,
      noDataAvailablePlaceholderText: this.noDataAvailablePlaceholderText,
      itemsShowLimit: 1,
      allowSearchFilter: allowSearchFilter,
      closeDropDownOnSelection: false,
      defaultOpen: false,
      allowRemoteDataSearch: true
    };
  }

  protected onItemSelect(item: any): void {
    console.log(`Item selected (onItemSelect): ${item}`);
  }

  protected onSelect(item: any): void {
    this.selectedItems.push(item);
    this.isSelectionChanged = true;    
  }

  protected onSelectAll(item: any): void {
    this.isSelectionChanged = true;
  }

  protected onDeSelect(item: any): void {
    this.selectedItems = this.selectedItems.filter(selected => selected.key !== item.key);
    this.isSelectionChanged = true;
  }

  protected onDeSelectAll(item: any): void {
    this.isSelectionChanged = true;
  }

  protected onFilterChange(event: any): void {
    this.searchInput = event;
    this.refreshKeyValueList();
    if (this.searchInput.length >= this.minQueryLength) {
      this.multiselectAutocompleteParameters.dataCallback(this.searchInput, this.selectedItems);
    } else if (this.searchInput.length === 0) {
      this.formFieldContentDeletedEmitter.emit();
    }
  }

  protected onDropDownClose(event: any): void {
    if (this.isSelectionChanged) {
      this.updateKeyValueList();
      this.sendSelectedItems(event, this.selectedItems);
      this.isSelectionChanged = false;
      return;
    }
  }

  private refreshKeyValueList(): void {
    this.dataList = [...this.selectedItems];    
  }

  protected adjustDataList(dataList: ListKeyValue[]): ListKeyValue[] {
    const result: ListKeyValue[] = [];
    for (let item of dataList) {
      const adjustedItem: ListKeyValue = {
        key: item.key,
        value: this.cutValue(item.value)
      }
      result.push(adjustedItem);
    }
    return result;
  }

  private cutValue(value: string): string {
    if (value?.length > this.maxDataListItemLength) {
      return value.substring(0, this.maxDataListItemLength) + ' ...';
    }
    return value;
  }

  public updateKeyValueList(): void {
    const unselectedItems = this.dataList.filter(item => !this.selectedItems.some(selected => selected.value === item.value));
    this.dataList = [
      ...this.selectedItems.sort((a, b) => {        
        return a.value.localeCompare(b.value);
      }),
      ...unselectedItems.sort((a, b) => a.value.localeCompare(b.value))
    ];
    this.removeDoubleEntries();
  }

  set dataList(value: ListKeyValue[]) {
    this._dataList = value; //this.adjustDataList(value);
  }

  get dataList() {
    return this._dataList;
  }

  private removeDoubleEntries(): void {
      const tempList: ListKeyValue[] = [];
      for (const item of this.dataList) {
        const found = tempList.find(entry => {
          return item.key === entry.key;
        });
        if (!found) {
          tempList.push(item);
        }
      }
      this.dataList = tempList;      
  }

  private sendSelectedItems(event: Event, selectedItems: ListKeyValue[]): void {    
    this.formFieldSelectionEmitter.emit(selectedItems);
    this.formFieldEventEmitter.emit(event);
  }  
}
