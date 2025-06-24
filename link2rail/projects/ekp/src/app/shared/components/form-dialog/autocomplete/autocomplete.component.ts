import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
 
export class SelectedAutoCompleteItem {
  constructor(private _code: string, private _fieldname: string, private _formArrayIndex: number) { }  
  get code() { return this._code; }
  get fieldname() { return this._fieldname; }
  get formArrayIndex() { return this._formArrayIndex; }
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss'
})
export class AutocompleteComponent implements AfterViewInit, OnChanges {

  @Input() formGroup: FormGroup;        
  @Input() fieldName: string;                                 // Unique input field name
  @Input() formArrayIndex: number = 0;                        // index if used within FormArray  
  @Input() minInputLength: number = 3;
  @Input() autocompleteResultList: any[];
  @Input() placeholder: string;
  @Input() title: string;
  @Input() label: string;
  @Input() maxInputLength: number = 256;
    
  @Output() doRequestSelectionListItems = new EventEmitter<string>();
  @Output() onSelectItem = new EventEmitter<SelectedAutoCompleteItem>();
  
  protected publicDatalist: any[] = [];
  protected busy: boolean;

  private privateDatalist: any[] = [];
  private inputChange$: Subject<string> = new Subject<string>();
  private currentInput: string;

  constructor(private elementRef:ElementRef) { }

  ngAfterViewInit(): void {          
    if (!this.fieldName || this.fieldName.trim().length === 0) {
      console.error('Failed to setup autocomplete component. Missing field name.');
      return;
    } 
    if (!this.formGroup) {
      console.error('FormGroup object not yet initialized.');
      return;      
    }
    this.registerForInputChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['autocompleteResultList']) {
      this.privateDatalist = changes['autocompleteResultList'].currentValue;
      if (this.privateDatalist?.length > 0) {
        // find matching entries
        let tmp: any[] = [];
        for (let item of this.privateDatalist) {
          if (item?.code?.toUpperCase().includes(this.currentInput.toUpperCase())) {
            tmp.push(item);
          }
        }
        this.privateDatalist = tmp;
        // remove double entries
        tmp = [];
        for (let item of this.privateDatalist) {
          const found = tmp.find(entry => { return item.code === entry.code; });
          if (!found) {
            tmp.push(item);
          }
        }
        this.privateDatalist = tmp;
        if (this.privateDatalist?.length === 1) { // If the result list contains only one entry, this is selected automatically
          this.onSelect(this.privateDatalist[0].code);
          const x = this.elementRef.nativeElement.querySelector('#' + this.fieldName);      
          x.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13}));
          //this.formGroup.get(this.fieldName).setValue('');
          this.privateDatalist = [];
        } else if (this.privateDatalist?.length > 1) { // If the results list contains more than one entry, the selection list is created and displayed.          
          for (let item of this.privateDatalist) {
            this.publicDatalist.push(item);
          }          
          this.updateDataListEventListener();
        }                
      } 
      this.busy = false;
    }
  }

  protected isEnabled(): boolean {
    return this.formGroup.get(this.fieldName)?.enabled;
  }

  get datalistname(): string {
    return this.fieldName + '_datalist';
  }

  protected autocompleteInputChanged(event: any): void {
    this.inputChange$.next(event.target.value);  
  }

  protected clear(): void {
    this.formGroup.get(this.fieldName).setValue(''); 
    this.onSelect('');
  }

  protected inputFieldHasContent(): boolean {
    return this.formGroup?.get(this.fieldName)?.value?.length > 0;
  }

  private onSelect(code: string): void {    
    const selectedItem = new SelectedAutoCompleteItem(code, this.fieldName, this.formArrayIndex);
    this.onSelectItem.emit(selectedItem);          
  }

  private addListener(e) {
    let qsli = document.querySelector('#' + e.target.getAttribute('list'));
    var options = qsli.querySelectorAll('option');
    let values = [];
    [].forEach.call(options, function(option) {
      values.push(option.value);
    });    
    let currentValue = e.target.value;
    if (values.indexOf(currentValue) !== -1) {
      this.onSelect(currentValue);      
    }
  }

  private updateDataListEventListener(): void {
    const x = this.elementRef.nativeElement.querySelector('#' + this.fieldName);
    x.removeEventListener('change', this.addListener.bind(this));
    let qsli = document.querySelector('#' + x.getAttribute('list'));
    var options = qsli.querySelectorAll('option');
    let values = [];
    [].forEach.call(options, function(option) {
      values.push(option.value);
    });
    x.addEventListener('change', this.addListener.bind(this));    
  }
  
  private registerForInputChanges(): void {
    this.inputChange$.subscribe(() => {
      this.requestSelectionListContent();
    });
  }

  private requestSelectionListContent(): void {
    this.publicDatalist = [];
    this.currentInput = this.formGroup.get(this.fieldName).value;
    if (this.currentInput?.length >= this.minInputLength) {
      this.busy = true;
      this.doRequestSelectionListItems.emit(this.currentInput);
    }
  }
}