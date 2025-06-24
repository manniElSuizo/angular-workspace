import {Component, Input, OnChanges, OnInit, QueryList, ViewChildren} from '@angular/core';
import {
    ControlContainer,
    FormArray,
    FormControl,
    FormGroup,
    NgForm,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {DemandView} from '../../../../template/models/template-demand-view';
import {NgForOf} from '@angular/common';
import {DemandTimeComponent} from "../demand-time/demand-time.component";
import {OrderDemandDateTimeView} from "../../../models/order-demand-date-time-view";

@Component({
    selector: 'app-demand',
    standalone: true,
    templateUrl: './demand.component.html',
    imports: [
        ReactiveFormsModule,
        TranslateModule,
        NgForOf,
        DemandTimeComponent
    ],
    styleUrls: ['./demand.component.scss'],
    viewProviders: [{provide: ControlContainer, useExisting: NgForm}],
})
export class DemandComponent implements OnChanges, OnInit {
    @Input() data: DemandView;
    @Input() formGroup: FormGroup;
    @Input() action: string = 'view';
    @Input() showWagonAmountNotValidMessage: number = -1;
    @ViewChildren(DemandTimeComponent) demandTimeComponents: QueryList<DemandTimeComponent>;

    constructor() {}

    ngOnInit() {
        this.init();
        this.initDemandTimeFormGroup();
        this.fillForm();
    }

    ngOnChanges() {

    }

    private init() {

        if (!this.formGroup) {
            this.formGroup = new FormGroup({});
        }

        this.formGroup.addControl('commercialLocation', new FormControl('', [Validators.required]));
        this.formGroup.addControl('freightWagonLocation', new FormControl(''));
        this.formGroup.addControl('demandDateTimesArray', new FormArray([]));
        this.commercialLocation.disable();
        this.freightWagonLocation.disable();

    }

    public fillForm(demand: DemandView = null) {
        console.log('DemandComponent formGroup', this.formGroup, this.data);
        if (!demand && !this.data) return;
        if (demand) {
            this.data = demand;
            this.initDemandTimeFormGroup()
        }

        const {demandLocation} = this.data;
        const {commercialLocation, freightWagonLocation} = demandLocation;

        const commercialLocationInput = commercialLocation.number ?
            commercialLocation.name
                ? `${commercialLocation.number} (${commercialLocation.name})`
                : commercialLocation.number
            : null;
        const freightWagonLocationInput = freightWagonLocation?.number ?
            freightWagonLocation.name
                ? `${freightWagonLocation.number} (${freightWagonLocation.name})`
                : freightWagonLocation.number
            : null;

        this.commercialLocation.setValue(commercialLocationInput);
        this.freightWagonLocation.setValue(freightWagonLocationInput);
    }

    public fillData(data: DemandView = null): DemandView {
        if (!data && !this.data) return null;
        const demand = !data ? this.data : data;
        const times: Array<OrderDemandDateTimeView> = [];

        this.demandTimeComponents.forEach((component, index) => {
                const item = component.fillData();
                console.log('lauf', index, '. ', item);

                times.push(item);
            }
        );
        demand.demandDateTimes = times;
        this.data = demand;
        return demand;
    }

    public addDemandDate() {
        console.log('addDemandDate');
        this.cloneDemandDate(0);

    }

    public removeDemandDate(index: number): void {
        this.demandDateTimesArray.removeAt(index);
        this.data.demandDateTimes.splice(index, 1);
    }

    get commercialLocation(): FormControl {
        return this.formGroup.get('commercialLocation') as FormControl;
    }

    get freightWagonLocation(): FormControl {
        return this.formGroup.get('freightWagonLocation') as FormControl;
    }

    get demandDateTimesArray(): FormArray {
        return this.formGroup.get('demandDateTimesArray') as FormArray;
    }

    protected getDemandDateTimeFormGroup(idx: number): FormGroup {
        return this.demandDateTimesArray.controls[idx] as FormGroup;
    }

    private initDemandTimeFormGroup() {
        if (!this.data) {
            if (!this.demandDateTimesArray) return;
            this.demandDateTimesArray.clear();
            return;
        }

        if (!this.demandDateTimesArray) this.formGroup.addControl('demandDateTimesArray', new FormArray([]));
        this.data.demandDateTimes.forEach(_date => {
            const demandDateFormGroup = new FormGroup({
                demandTypes: new FormArray([])
            });
            this.demandDateTimesArray.push(demandDateFormGroup);
        });
    }

    private cloneDemandDate(index: number) {
        const componentToClone = this.demandTimeComponents.get(index);
        if (!componentToClone) return;

        const clonedData = JSON.parse(JSON.stringify(this.data.demandDateTimes[index]));
        this.fillData();
        
        const clonedDemandDate = new FormGroup({
            demandTypes: this.cloneDemandTypes(componentToClone.demandTypesArray)
        });

        this.demandDateTimesArray.push(clonedDemandDate);
        this.data.demandDateTimes.push(clonedData);
        this.demandTimeComponents.last.fillForm(clonedData);
    }

    private cloneDemandTypes(demandTypes: FormArray): FormArray {
        const clonedDemandTypes = new FormArray([]);
        demandTypes.controls.forEach(control => {
            const demandType = control as FormGroup;
            const clonedDemandType = new FormGroup({});
            Object.keys(demandType.controls).forEach(key => {
                const control = demandType.get(key);
                if (control) {
                    clonedDemandType.addControl(key, new FormControl(control.value, control.validator));
                }
            });
            clonedDemandTypes.push(clonedDemandType);
        });
        return clonedDemandTypes;
    }
}