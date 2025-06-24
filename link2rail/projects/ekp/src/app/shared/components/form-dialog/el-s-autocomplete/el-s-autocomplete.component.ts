import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged, Subject, switchMap} from "rxjs";

export interface AutocompleteDataElement<T> {
    displayValue: string;
    value: T;
}

export interface AutocompleteConfig {
    doNotDedup?: boolean;
    errorConfig?: {
        errorText?: string;
        errorCondition?: boolean;
    }
}

@Component({
    selector: 'app-el-s-autocomplete',
    templateUrl: './el-s-autocomplete.component.html',
    styleUrl: './el-s-autocomplete.component.scss'
})
export class ElSAutocompleteComponent<T> implements AfterViewInit, OnChanges {

    @Input() formGroup: FormGroup;
    @Input() fieldName: string;                                 // Unique input field name
    @Input() displayNameTransform: Function | string;
    @Input() minInputLength: number = 3;
    @Input() autocompleteResultList: T[];
    @Input() placeholder: string;
    @Input() title: string;
    @Input() arrayIndex: number = null;
    @Input() otherConfig: AutocompleteConfig = null;
    @Input() debounceTime: number = 500;                      // Time in ms to wait before sending request. Debounce is omitted if set to 0. Default is 500ms.

    @Output() doRequestSelectionListItems = new EventEmitter<string>();
    @Output() onSelectItem = new EventEmitter<T>();

    protected publicDatalist: AutocompleteDataElement<T>[] = [];
    protected busy: boolean;

    // private privateDatalist: T[] = [];
    private inputChange$: Subject<string> = new Subject<string>();
    private currentInput: string;

    constructor(private elementRef: ElementRef) { }

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
        if (changes['autocompleteResultList'] && this.autocompleteResultList) {
            this.toInternalDataList();
            if (this.publicDatalist?.length == 1) {
                // if only one element is in reulst -> select automatically
                this.onSelectItem.emit(this.publicDatalist[0].value);
                this.formGroup.get(this.fieldName).setValue(this.publicDatalist[0].displayValue, {emitEvent: false});
                const dataList = (document.querySelector("#datalist-" + this.fieldName) as HTMLElement);
                if (dataList) dataList.style.display = 'none';
                const x = this.elementRef.nativeElement.querySelector('#' + this.fieldName);
                x?.blur();
            }
            this.busy = false;
        }
    }

    protected transformToDisplayName(option: T): string {
        if (typeof this.displayNameTransform == 'string' || this.displayNameTransform instanceof String) {
            return option[this.displayNameTransform as string];
        }
        return this.displayNameTransform(option);
    }

    protected autocompleteInputChanged(event: any): void {
        if (event.data && event.data.length) {
            const found = this.publicDatalist.find(element => element.displayValue == event.target.value);
            
            if (!found) {
                this.inputChange$.next(event.target.value);
            }
        }
    }

    protected onAcChange($event) {
        this.currentInput = $event.target.value;
        const found = this.findByDisplayName();

        if (!found) {
            this.clear();
            return;
        }
        this.onSelectItem.emit(found);
    }

    protected clear(): void {
        this.formGroup.get(this.fieldName).setValue(null);
        this.publicDatalist = [];
        this.onSelectItem.emit(null);
        this.busy = false;
    }

    protected inputFieldHasContent(): boolean {
        return this.formGroup?.get(this.fieldName)?.value?.length > 0;
    }

    protected isEnabled(): boolean {
        return this.formGroup.get(this.fieldName)?.enabled;
    }

    private registerForInputChanges(): void {
        if (this.debounceTime == 0) {
            this.inputChange$.subscribe(() => {
                this.requestSelectionListContent();
            });
        } else {
            this.inputChange$
                .pipe(
                    debounceTime(this.debounceTime)
                )
                .subscribe(() => {
                    this.requestSelectionListContent();
                });
        }

        this.formGroup.get(this.fieldName).valueChanges.subscribe({
            next: _ch => {
                if (!this.formGroup.get(this.fieldName).value || this.formGroup.get(this.fieldName).value == null) {
                    this.publicDatalist = [];
                }
            }
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


    private toInternalDataList() {
        this.autocompleteResultList.forEach((element: T) => {
            const transformed = this.transformToDisplayName(element);
            if (this.otherConfig?.doNotDedup) {
                this.publicDatalist.push({displayValue: transformed, value: element});
                return;
            }

            if (this.publicDatalist.find(e => e.displayValue == transformed)) {
                return;
            }
            this.publicDatalist.push({displayValue: transformed, value: element});
        });
    }

    private findByDisplayName(): T {
        const found = this.publicDatalist.find(element => element.displayValue == this.currentInput);
        if (!found) {
            return null;
        }
        return found.value;
    }
}