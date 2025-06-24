import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AutocompleteConfig, AutocompleteDataElement } from '../el-s-autocomplete/el-s-autocomplete.component';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-autocomplete-internal',
  templateUrl: './autocomplete-internal.component.html',
  styleUrl: './autocomplete-internal.component.scss'
})
export class AutocompleteInternalComponent<T> implements AfterViewInit, OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() fieldName: string = null;
  @Input() fieldId: string = null;
  @Input() displayNameTransform: Function | string;
  @Input() minInputLength: number = 3;
  @Input() autocompleteResultList: T[];
  @Input() placeholder: string;
  @Input() title: string;
  @Input() arrayIndex: number = null;
  @Input() otherConfig: AutocompleteConfig = null;

  @Output() onSelectItem = new EventEmitter<T>();

  protected publicDatalist: AutocompleteDataElement<T>[] = [];
  protected internalDatalist: AutocompleteDataElement<T>[] = [];
  protected busy: boolean = true;

  private currentInput: string;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    if (!this.controlName || this.controlName.trim().length === 0) {
      console.error('Failed to setup autocomplete component. Missing form control name.');
      return;
    }
    if (!this.formGroup) {
      console.error('FormGroup object not yet initialized.');
      return;
    }

    this.registerForInputChanges();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['autocompleteResultList']) {
      this.loadList();
    }
  }

  private loadList(): void {
    this.publicDatalist = [];
    if (!this.autocompleteResultList) {
      throw 'result list must be provided';
    }
    this.toInternalDataList();
    if(this.internalDatalist.length <= 200) {
      this.publicDatalist = this.internalDatalist;
    }
    this.busy = false;
  }

  private selectSingleItem() {
    if (this.publicDatalist?.length == 1) {
      this.control.setValue(this.publicDatalist[0].displayValue, {emitEvent: false});
      this.currentInput = this.publicDatalist[0].displayValue;
      this.doOnAcChange();
    }
  }

  private blurAndHideDatalist() {
    const dataList = (document.querySelector("#datalist-" + this.getFieldId()) as HTMLElement);
    const x = this.elementRef.nativeElement.querySelector('#' + this.getFieldId());
    x?.blur();
    if (dataList) dataList.style.display = 'none';
  }

  private toInternalDataList() {
    this.autocompleteResultList.forEach((element: T) => {
      const transformed = this.transformToDisplayName(element);
      if (this.otherConfig?.doNotDedup) {
        this.internalDatalist.push({ displayValue: transformed, value: element });
        return;
      }

      if (this.internalDatalist.find(e => e.displayValue == transformed)) {
        return;
      }
      this.internalDatalist.push({ displayValue: transformed, value: element });
    });
  }

  private transformToDisplayName(option: T): string {
    if (typeof this.displayNameTransform == 'string' || this.displayNameTransform instanceof String) {
      return option[this.displayNameTransform as string];
    }
    return this.displayNameTransform(option);
  }

  private doOnAcChange(): void {
    const found = this.findByDisplayName();
    this.publicDatalist = [];
    if (!found) {
      this.clear();
      return;
    }
    
    this.blurAndHideDatalist();
    this.onSelectItem.emit(found);
  }

  protected clear(): void {
    this.control.setValue(null);
    this.publicDatalist = [];
    if(this.internalDatalist.length <= 200) {
      this.publicDatalist = this.internalDatalist;
    }
    this.onSelectItem.emit(null);
    this.busy = false;
    this.focus();
  }

  private focus(): void {
    const x = this.elementRef.nativeElement.querySelector('#' + this.getFieldId());
    x?.focus();
  }

  protected inputFieldHasContent(): boolean {
    return this.control?.value?.length > 0;
  }

  protected isEnabled(): boolean {
    return this.control?.enabled;
  }

  private registerForInputChanges(): void {
    this.control.valueChanges.subscribe({
      next: _ch => {
        this.currentInput = _ch;
        // if(this.findByDisplayName()) {
        //   return;
        // }
        this.publicDatalist = [];
        if(this.control?.value?.length >= this.minInputLength || this.internalDatalist.length <= 200) {
          this.publicDatalist = this.internalDatalist.filter(el => el.displayValue.toLowerCase().indexOf(_ch.toLowerCase()) > -1);
        }
        this.selectSingleItem();
      }
    });
  }

  private findByDisplayName(): T {
    const found = this.internalDatalist.find(element => element.displayValue == this.currentInput);
    if (!found) {
      return null;
    }
    return found.value;
  }

  protected getFieldId() {
    return (this.fieldId ? this.fieldId : this.controlName) + (this.arrayIndex ? this.arrayIndex : '');
  }

  protected getFieldName() {
    return this.fieldName ? this.fieldName : this.controlName;
  }

  protected get control(): FormControl {
    return this.formGroup?.get(this.controlName) as FormControl;
  }
}
