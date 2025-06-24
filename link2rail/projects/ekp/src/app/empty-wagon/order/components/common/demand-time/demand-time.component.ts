import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    ViewChildren
} from '@angular/core';
import {
    ControlContainer,
    FormArray,
    FormControl,
    FormGroup,
    NgForm,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Country } from '@src/app/order-management/models/general-order';
import {OrderDemandDateTimeView} from '../../../models/order-demand-date-time-view';
import {formatDate} from '@angular/common';
import { MasterdataService } from '@src/app/empty-wagon/masterdata/services/masterdata.service';
import { DemandDateTimesRequestView } from '@src/app/empty-wagon/masterdata/models/demand-date-times-request-view';
import { DemandLocationView } from '@src/app/empty-wagon/common/models/demand-location-view';
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "../../../../../shared/shared.module";
import {DemandTypeComponent} from "../demand-type/demand-type.component";
import moment from 'moment';
import {BehaviorSubject, Observable} from "rxjs";
import {totalWagonsValidator} from "../../../validators/total-wagons.validator";
import {OrderDemandTypeView} from "../../../models/order-demand-type-view";
import {
    MasterdataDateForCommercialLocationRequestView
} from "../../../../masterdata/models/masterdata-date-for-commercial-location-request-view";
import {DemandDateTimeValidator} from "../../../validators/demand-date-time.validator";
import {CommercialLocation} from "../../../../api/generated";

@Component({
    selector: 'app-demand-time',
    templateUrl: './demand-time.component.html',
    styleUrls: ['./demand-time.component.scss'],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        SharedModule,
        DemandTypeComponent
    ],
    standalone: true,
    viewProviders: [{provide: ControlContainer, useExisting: NgForm}],
})
export class DemandTimeComponent implements OnInit {
    @Input() data: OrderDemandDateTimeView;
    @Input() demandLocation: DemandLocationView;
    @Input() action: string;
    @Input() formGroup: FormGroup;
    @Input() runningNumber: number;
    @Input() showWagonAmountNotValid: boolean;

    @Output() addDemandDateTime = new EventEmitter<any>();
    @Output() removeDemandDateTime = new EventEmitter<any>();

    @ViewChildren(DemandTypeComponent) demandTypeComponents: QueryList<DemandTypeComponent>;

    protected countries$: Observable<Country[]>;
    protected demandDateTimes: string[] = [];
    protected timeRangeIsSelectable: boolean = false;
    protected minDemandDate: string;
    protected maxDemandDate: string;
    protected isWorkingDay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor(
        private masterDataService: MasterdataService,
        private demandDateTimeValidator: DemandDateTimeValidator,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {

        this.initForm();
        this.fillForm();
        this.cdr.detectChanges();
    }

    public fillForm(data: OrderDemandDateTimeView = null) {
        if (!data && !this.data) return;
        if (!this.data) this.data = data;

        if (this.action === 'create') {
            this.fillControlsForCreation();
            return;
        }
        this.fillControlsForView();
    }

    private fillControlsForView() {
        const {deliveryDateTime = null} = this.data;
        this.demandDateControl.setValue(
            deliveryDateTime
                ? formatDate(deliveryDateTime, 'yyyy-MM-dd', 'en')
                : null
        );

        this.timeControl.setValue(
            deliveryDateTime
                ? formatDate(deliveryDateTime, 'HH:mm', 'en')
                : null
        );
    }

    public removeFormGroup() {
        this.removeDemandDateTime.emit(this.runningNumber);
    }

    public addFormGroup() {
        this.addDemandDateTime.emit(this.runningNumber);
    }

    public fillData(data: OrderDemandDateTimeView = null): OrderDemandDateTimeView | null {
        this.demandTypesArray.setErrors(totalWagonsValidator()(this.demandTypesArray));
        if (!data && !this.data) return null;
        const demandTime = !data ? this.data : data;

        demandTime.deliveryDateTime = new Date(`${this.demandDateControl.value}T${this.formatTime(this.timeControl.value)}`);
        demandTime.demands = [];
        const types: Array<OrderDemandTypeView> = [];
        this.demandTypeComponents.forEach(
            (component) => {
                const type = component.fillData();
                types.push(type)
            });
        demandTime.demands = types;
        this.data = demandTime;
        console.log('demandTime return', demandTime);
        return demandTime;
    }

    protected getDemandTypeFormGroup(idx: number): FormGroup {
        return this.demandTypesArray.controls[idx] as FormGroup;
    }

    onSelectDemandDate(event: any): void {
        const input = event.target as HTMLInputElement;

        console.log('onSelectDemandDate input', input);

        if (!event.target.value) {
            this.timeControl.setValue('');
            this.timeControl.disable();
            return;
        }
        this.isWorkingDate(this.demandLocation.commercialLocation, new Date(event.target.value));

        console.log('isWorkingDay', this.isWorkingDay$.getValue());
        console.log('this.demandDateControl.errors', this.demandDateControl?.errors);
        if (this.demandDateControl.errors) return;
        this.fillTimeControl(new Date(event.target.value));
    }

    private toDate(formattedDate: string): Date | null {
        if (!formattedDate) return null;
        return new Date(formattedDate);
    }

    private fillTimeControl(demandDate: Date): void {
        const requestView: DemandDateTimesRequestView = {
            demandDate,
            demandLocation: this.demandLocation
        };
        const time = (demandDate) ? formatDate(demandDate, 'HH:mm', 'en') : null;
        this.demandDateTimes = [];
        this.timeControl.setValue('');

        this.masterDataService.searchMasterDataDemandDateTimes(requestView).subscribe({
            next: (result) => {
                console.log('masterDataService', result);
                this.demandDateTimes = result;
                this.timeRangeIsSelectable = this.demandDateTimes.length > 0;
                if (this.demandDateTimes.filter(item => item === time).length > 0) this.timeControl.setValue(time);
                this.timeControl.enable();
            }
        });
    }

    protected onSelectTimeRange(event: any): void {
        console.log('Selected time range:', event.target.value);
    }

    protected fillControlsForCreation(): void {

        this.initMaxDemandDate();
        this.minDemandDate = (new Date()).toISOString().substring(0, 10);
        ;
        this.fillControlsAndSetValidatorsForCreation();
    }

    private fillControlsAndSetValidatorsForCreation() {
        const date = (this.data.deliveryDateTime) ? this.data.deliveryDateTime : this.minDate;
        this.demandDateControl.setValue(formatDate(date, 'yyyy-MM-dd', 'en'));
        this.addValidatorsForCreation();
        this.fillTimeControl(date);
    }

    private addValidatorsForCreation() {
        this.demandDateControl.addValidators([
                Validators.required,
                this.demandDateTimeValidator.checkMaxDate(this.maxDate),
                this.demandDateTimeValidator.checkMinDate(this.minDate)
            ]
        );

        this.timeControl.setValidators(Validators.required);

        this.timeControl.setAsyncValidators(
            this.demandDateTimeValidator.lastCustomerOrderDateTime(this.demandDateControl, this.demandLocation)
        )
    }

    protected initMaxDemandDate() {
        this.maxDemandDate = moment().add(90, 'day').toDate().toISOString().substring(0, 10);
    }

    private initForm() {
        if (!this.formGroup) {
            this.formGroup = new FormGroup({});
        }
        this.formGroup.addControl('demandDateControl', new FormControl());
        this.formGroup.addControl('timeControl', new FormControl());
        this.formGroup.addControl('demandTypesArray', new FormArray([]));
        this.initDemandTypeFormArray();
        if (this.action === 'view') {
            this.disableControls();
            return;
        }
        this.demandTypesArray.setValidators(totalWagonsValidator())

    }

    private disableControls() {
        this.demandDateControl.disable();
        this.timeControl.disable();
    }

    private initDemandTypeFormArray() {
        this.data?.demands.forEach(() => {
            this.demandTypesArray.push(new FormGroup({}));
        });
    }

    formatTime(value: string): string {
        // Check if the input is already in HH:MM format
        const hhmmRegex = /^\d{2}:\d{2}$/;
        if (hhmmRegex.test(value)) {
            return value; // Return as is if already in HH:MM format
        }

        // Check if the input is in HHMM format
        const hhmmCompactRegex = /^\d{4}$/;
        if (hhmmCompactRegex.test(value)) {
            const hours = value.substring(0, 2);
            const minutes = value.substring(2, 4);
            return `${hours}:${minutes}`;
        }

        throw new Error('Invalid time format. Expected HHMM or HH:MM.');
    }

    get timeControl(): FormControl {
        return this.formGroup.get('timeControl') as FormControl;
    }

    get demandDateControl(): FormControl {
        return this.formGroup.get('demandDateControl') as FormControl;
    }

    get demandTypesArray(): FormArray {
        return this.formGroup.get('demandTypesArray') as FormArray;
    }

    get maxDate(): Date {
        return this.toDate(this.maxDemandDate);
    }

    get minDate(): Date {
        return new Date(this.minDemandDate);
    }

    private isWorkingDate(commercialLocation: CommercialLocation, date: Date) {
        const request: MasterdataDateForCommercialLocationRequestView = {
            date,
            commercialLocation
        }
        this.masterDataService.isWorkingDay(request).subscribe(
            response => {
                this.isWorkingDay$.next(response);

            }
        )
    }
}
