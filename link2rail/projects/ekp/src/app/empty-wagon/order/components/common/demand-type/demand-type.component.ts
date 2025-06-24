import {AfterViewInit, ChangeDetectorRef, Component, inject, Input, OnChanges} from '@angular/core';
import {ControlContainer, FormControl, FormGroup, NgForm, ReactiveFormsModule, Validators} from '@angular/forms';
import {DemandWagonTypeView} from "../../../../common/models/demand-wagon-type-view";
import {TransitRailwayUndertakingView} from "../../../../common/models/transit-railway-undertaking-view";
import {NHMView} from "../../../../common/models/nhm-view";
import {CommercialLocationView} from "../../../../common/models/commercial-location-view";
import {OrderDemandTypeView} from "../../../models/order-demand-type-view";
import {CommercialLocationSummaryPipe} from "../../../../../shared/pipes/commercial-location-summary.pipe";
import {BehaviorSubject, Observable} from "rxjs";
import {CodeNamePair, CommercialLocationSummary, Country} from "../../../../../order-management/models/general-order";
import {RailOrderInternalService} from "../../../../../order-management/service/rail-order-internal.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {TrainorderService} from "../../../../../trainorder/services/trainorder.service";
import {
    SelectedAutoCompleteItem
} from "../../../../../shared/components/form-dialog/autocomplete/autocomplete.component";
import {ApiGoodResponse} from "../../../../../trainorder/models/Cargo.model";
import {debounceTime} from "rxjs/operators";
import {SharedPipesModule} from "../../../../../shared/pipes/shared-pipes.module";
import {
    ElSAutocompleteModule
} from "../../../../../shared/components/form-dialog/el-s-autocomplete/el-s-autocomplete.module";
import {AutocompleteModule} from "../../../../../shared/components/form-dialog/autocomplete/autocomplete.module";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";

@Component({
    selector: 'app-demand-type',
    templateUrl: './demand-type.component.html',
    styleUrls: ['./demand-type.component.scss'],
    imports: [
        ReactiveFormsModule,
        TranslateModule,
        SharedPipesModule,
        ElSAutocompleteModule,
        AutocompleteModule,
        NgForOf,
        AsyncPipe,
        NgIf
    ],
    standalone: true,
    viewProviders: [{provide: ControlContainer, useExisting: NgForm}],
})
export class DemandTypeComponent implements AfterViewInit, OnChanges {
    @Input() data: OrderDemandTypeView;
    @Input() action: string;
    @Input() formGroup: FormGroup;

    protected commercialLocationSummaryPipe: CommercialLocationSummaryPipe = inject(CommercialLocationSummaryPipe);
    protected countries$: Observable<Country[]>;
    protected commercialLocationSummariesPickupStations: CommercialLocationSummary[] = [];
    protected transitRailwayAutocompleteResultList: CodeNamePair[] = [];
    protected nhmCodeAutocompleteResultList: CodeNamePair[] = [];
    protected isMaxNumberOfWagonExceeded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    protected maxNumberOfWagon: number;

    private selectedNhmCode: CodeNamePair;
    private selectedTransitRailway: CodeNamePair;
    private selectedLoadRunLocation: CodeNamePair;
    private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
    private selectedCountryCode: number = undefined;

    constructor(
        private translate: TranslateService,
        private trainOrderService: TrainorderService,
        private cd: ChangeDetectorRef
    ) {
        this.loadLists();
    }

    ngAfterViewInit() {
        this.cd.detectChanges();
    }

    ngOnChanges() {
        this.initForm();
        this.initData();
        this.fillForm();
        this.checkMaxNumberOfWagonExceeded();
        this.cd.detectChanges();
    }

    protected checkMaxNumberOfWagonExceeded() {
        const wagons = this.wagonAmountControl.value;
        this.isMaxNumberOfWagonExceeded$.next(
            !!wagons && wagons > this.maxNumberOfWagon
        );
        console.log('this.isMaxNumberOfWagonExceeded$', this.isMaxNumberOfWagonExceeded$, wagons, this.maxNumberOfWagon);
    }

    private loadLists(): void {
        this.countries$ = this.railOrderInternalService.getCountries();
    }

    protected onChangeCountryCode($event: any) {
        this.selectedCountryCode = $event.target.value ? $event.target.value : null;
        const control = this.loadRunLocationControl;
        control.setValue(null);
        if (this.selectedCountryCode) {
            control.enable();
            return;
        }
        control.disable();
    }

    private initForm(): void {
        if (!this.formGroup) {
            this.formGroup = new FormGroup({});
        }
        this.formGroup.addControl('demandWagonTypeControl', new FormControl());
        this.formGroup.addControl('wagonAmountControl', new FormControl(null));
        this.formGroup.addControl('commentToCustomerServiceControl', new FormControl(null, [Validators.maxLength(200)]));
        this.formGroup.addControl('customerReferenceControl', new FormControl(null, [Validators.maxLength(50)]));
        this.formGroup.addControl('countryCodeControl', new FormControl());
        this.formGroup.addControl('loadRunLocationControl', new FormControl());
        this.formGroup.addControl('transitRailwayControl', new FormControl());
        this.formGroup.addControl('nhmCodeControl', new FormControl());
        this.configureFormControls();
    }

    private initData() {
        if (!this.data) return;
        const {loadRunLocation, transitRailwayUndertaking, nhm, maxNumberOfWagons} = this.data;
        this.maxNumberOfWagon = (maxNumberOfWagons) ? maxNumberOfWagons : 99;
        if (!!loadRunLocation)
            this.selectedLoadRunLocation = {
                code: loadRunLocation.number,
                name: loadRunLocation.name
            };
        if (!!transitRailwayUndertaking)
            this.selectedTransitRailway = {
                code: transitRailwayUndertaking.companyCode,
                name: transitRailwayUndertaking.companyName
            };
        if (!!nhm)
            this.selectedNhmCode = {
                code: nhm.code,
                name: nhm.description
            }
    }

    public fillForm(data: OrderDemandTypeView = null): void {
        if (!data && !this.data) return;
        if (!this.data) this.data = data;
        const {
            loadRunLocation,
            demandWagonType,
            numberOfWagonsOrdered,
            maxNumberOfWagons,
            commentToCustomerService,
            customerReference,
            transitRailwayUndertaking,
            nhm
        } = this.data;

        this.setDemandWagonTypeControl(demandWagonType);
        this.setWagonAmountControl(numberOfWagonsOrdered);
        this.setCommentToCustomerServiceControl(commentToCustomerService);
        this.setCustomerReferenceControl(customerReference);
        this.setCountryCodeControl(loadRunLocation);
        this.setLoadRunLocationControl(loadRunLocation);
        this.setTransitRailwayControl(transitRailwayUndertaking);
        this.setNhmCodeControl(nhm);
    }

    private setDemandWagonTypeControl(type: DemandWagonTypeView): void {
        if (!type) return;
        const value = this.generateDemandWagonTypeControlValue(type);
        this.formGroup.get('demandWagonTypeControl').setValue(value);
    }

    public generateDemandWagonTypeControlValue(type: DemandWagonTypeView) {
        return type.code ? `${type.code}-${type.number} (${type.name})` : `${type.number} (${type.name})`;
    }

    private setWagonAmountControl(numberOfWagonsOrdered: number,): void {
        const control = this.formGroup.get('wagonAmountControl');
        control.setValue(numberOfWagonsOrdered);
    }

    private setCommentToCustomerServiceControl(comment: string): void {
        if (!comment) return;
        const control = this.formGroup.get('commentToCustomerServiceControl');
        control.setValue(comment);
        control.setValidators(Validators.maxLength(200));
    }

    private setCustomerReferenceControl(reference: string): void {
        if (!reference) return;
        const control = this.formGroup.get('customerReferenceControl');
        control.setValue(reference);
    }

    private setCountryCodeControl(location: CommercialLocationView): void {
        this.formGroup.get('countryCodeControl').setValue(location?.countryCodeUic);
    }

    private setLoadRunLocationControl(location: CommercialLocationView): void {
        const control = this.formGroup.get('loadRunLocationControl');
        if (location?.countryCodeUic) {
            control.setValue(location.name ? `${location.number} (${location.name})` : location.number);
        } else {
            control.disable();
        }
    }

    private setTransitRailwayControl(undertaking: TransitRailwayUndertakingView): void {
        if (!undertaking) return;
        const value = undertaking.companyName ? `${undertaking.companyName} (${undertaking.companyCode})` : `${undertaking.companyCode}`;
        this.formGroup.get('transitRailwayControl').setValue(value);
    }

    private setNhmCodeControl(nhm: NHMView): void {
        if (!nhm) return;
        const value = nhm.description ? `${nhm.description} (${nhm.code})` : `${nhm.code}`;
        this.formGroup.get('nhmCodeControl').setValue(value);
    }

    private configureFormControls(): void {
        this.formGroup.get('demandWagonTypeControl').disable();

        if (this.action === 'view') {
            this.formGroup.disable();
        }
    }

    protected translatedPlaceholderNhmCode(): string {
        return this.translate.instant('Empty-wagon.demand-component.placeholder.nhm-code');
    }

    protected translatedTitleNhmCode(): string {
        if (this.selectedNhmCode) {
            return '(' + this.selectedNhmCode.code + ') ' + this.selectedNhmCode.name;
        }
        return this.translate.instant('Empty-wagon.demand-component.placeholder.nhm-code');
    }

    protected translatedLabelNhmCode(): string {
        return this.translate.instant('Empty-wagon.demand-component.placeholder.nhm-code');
    }

    protected translatedPlaceholderTransitRailway(): string {
        return this.translate.instant('Empty-wagon.demand-component.placeholder.transit-railway');
    }

    protected translatedTitleTransitRailway(): string {
        if (this.selectedTransitRailway) {
            return '(' + this.selectedTransitRailway.code + ') ' + this.selectedTransitRailway.name;
        }
        return this.translate.instant('Empty-wagon.demand-component.placeholder.transit-railway')
    }

    protected translatedLabelTransitRailway(): string {
        return this.translate.instant('Empty-wagon.demand-component.placeholder.transit-railway')
    }

    protected requestNhmCodeListItems(input: string): void {
        this.trainOrderService.getCargoInfo(input, 6).then((result: ApiGoodResponse) => {
            const tempList: CodeNamePair[] = [];
            for (let item of result) {
                const entry: CodeNamePair = {
                    code: item.nhmCode,
                    name: item.description
                };
                tempList.push(entry);
            }
            this.nhmCodeAutocompleteResultList = tempList;
        });
    }

    protected requestTransitRailWayListItems(input: string): void {
        this.railOrderInternalService.getRailwayCompanies().subscribe((result: CodeNamePair[]) => {
            this.transitRailwayAutocompleteResultList = result.filter(company => company.code.includes(input.toUpperCase()));
        });
    }

    protected onSelectNhmCodeListItem(selectedItem: SelectedAutoCompleteItem): void {
        const item = this.nhmCodeAutocompleteResultList.find(item => { return item.code.toUpperCase() === selectedItem.code.toUpperCase(); });
        if (item) {
            this.selectedNhmCode = item;
            this.nhmCodeControl
                .setValue(item.name + ' (' + selectedItem.code + ')', {emitEvent: false});
        } else {
            this.selectedNhmCode = undefined;
        }
        this.cd.detectChanges();
    }

    protected onSelectTransitRailWayListItem(selectedItem: SelectedAutoCompleteItem): void {
        const item = this.transitRailwayAutocompleteResultList.find(item => { return item.code.toUpperCase() === selectedItem.code.toUpperCase(); });
        if (item) {
            this.selectedTransitRailway = item;
            this.transitRailwayControl
                .setValue(item.name + ' (' + selectedItem.code + ')', {emitEvent: false});
        }
        this.cd.detectChanges();
    }

    protected onSelectLoadRunLocation($event: any): void {
        this.selectedLoadRunLocation = {
            code: $event.locationCode,
            name: $event.name,
        } as CodeNamePair;
    }

    protected loadRunLocationStations($event: any): void {
        console.log($event);
        this.railOrderInternalService.getCommercialLocations($event, this.selectedCountryCode)
            .pipe(debounceTime(500))
            .subscribe({
                next: (result: CommercialLocationSummary[]) => {
                    this.commercialLocationSummariesPickupStations = result;
                }
            });
    }

    get demandWagonTypeControl(): FormControl {
        return this.formGroup.get('demandWagonTypeControl') as FormControl;
    }

    get loadRunLocationControl(): FormControl {
        return this.formGroup.get('loadRunLocationControl') as FormControl;
    }

    get wagonAmountControl(): FormControl {
        return this.formGroup.get('wagonAmountControl') as FormControl;
    }

    get commentToCustomerServiceControl(): FormControl {
        return this.formGroup.get('commentToCustomerServiceControl') as FormControl;
    }

    get customerReferenceControl(): FormControl {
        return this.formGroup.get('customerReferenceControl') as FormControl;
    }

    get countryCodeControl(): FormControl {
        return this.formGroup.get('countryCodeControl') as FormControl;
    }

    get transitRailwayControl(): FormControl {
        return this.formGroup.get('transitRailwayControl') as FormControl;
    }

    get nhmCodeControl(): FormControl {
        return this.formGroup.get('nhmCodeControl') as FormControl;
    }

    fillData(data: OrderDemandTypeView = null): OrderDemandTypeView | null {
        if (!data && !this.data) return null;
        const demandType = !data ? this.data : data;
        demandType.numberOfWagonsOrdered = this.wagonAmountControl.value;
        demandType.commentToCustomerService = this.commentToCustomerServiceControl.value;
        demandType.customerReference = this.customerReferenceControl.value;
        demandType.nhm = this.fillDataNhm();
        demandType.transitRailwayUndertaking = this.fillDataTransitRailwayUndertaking();
        demandType.loadRunLocation = this.fillDataLoadRunLocation();
        this.data = demandType;
        return demandType;
    }

    private fillDataNhm(): NHMView | null {
        if (!this.nhmCodeControl.value) return null;

        return {
            code: this.selectedNhmCode.code,
            description: this.selectedNhmCode.name
        } as NHMView;
    }

    private fillDataTransitRailwayUndertaking(): TransitRailwayUndertakingView | null {
        if (!this.transitRailwayControl.value) return null;
        console.log('this.transitRailwayControl', this.transitRailwayControl);
        return {
            companyCode: this.selectedTransitRailway.code,
            companyName: this.selectedTransitRailway.name
        } as TransitRailwayUndertakingView;
    }

    private fillDataLoadRunLocation(): CommercialLocationView | null {
        if (!this.countryCodeControl.value || !this.loadRunLocationControl.value) return null;
        console.log('this.loadRunLocationControl', this.loadRunLocationControl);
        return {
            countryCodeUic: this.countryCodeControl.value,
            number: this.selectedLoadRunLocation.code,
            name: this.selectedLoadRunLocation.name,
        } as CommercialLocationView;
    }

}