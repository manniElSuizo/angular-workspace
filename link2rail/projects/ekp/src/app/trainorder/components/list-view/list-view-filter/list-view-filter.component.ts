import { AfterViewChecked, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { ApiTrainsListRequest, ApiTrainsListResponse, TrainChainSummary, TrainSummary } from '@src/app/trainorder/models/ApiTrainsList.models';
import { CommercialLocation, InfrastructureLocation, InfrastructureLocationResponse, StationType } from '@src/app/trainorder/models/location.models';
import { StationTypes } from '@src/app/shared/enums/stations.enum';
import { ConstValues } from '@src/app/shared/enums/const-values.enum';
import { formatDate } from '@angular/common';
import { AppService } from '@src/app/app.service';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import moment from 'moment';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';
import { ListViewFilterSessionStorageObjekt, TrainChain } from '../models/list-view.models';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { InfrastructureLocationSummaryPipe } from '@src/app/shared/pipes/infrastructure-location-summary.pipe';

const LIST_VIEW_FILTER_OBJEKT = 'list-view-filter-session-storage-objekt';
const PLANNED_DEPARTURE = 'plannedDeparture';
const PLANNED_DEPARTURE_TO = 'plannedDepartureTo';
const PLANNED_DEPARTURE_FROM = 'plannedDepartureFrom';
const TRAIN_NUMBER = 'trainNumber';
const SENDING_STATION = 'sendingStation';
const SENDING_STATION_KEY_ALPHA = 'sendingStationKeyAlpha';
const SENDING_STATION_KEY_SEQUENCE = 'sendingStationKeySequence';
const RECEIVING_STATION = 'receivingStation';
const RECEIVING_STATION_KEY_ALPHA = 'receivingStationKeyAlpha';
const RECEIVING_STATION_KEY_SEQUENCE = 'receivingStationKeySequence';
const FOCUSED = 'focused';
const TRAIN_CHAIN = 'trainChain';
const TRAIN_CHAIN_NAME = 'trainChainName';
const TRAIN_CHAIN_ID = 'trainChainId';
const TRAIN_CHAIN_NAME_SELECTOR = 'trainChainNameSelector';
const DEFAULT_ROUNDTRIP_ENTRY = 'Umlauf auswählen';
const FETCH_ALL_ROUNDTRIP_ENTRIES = 'Alle Umläufe anzeigen';

export const DEFAULT_LIMIT = 25;

export interface TrainChainSummarySelection extends TrainChainSummary {
    selected: boolean,
    display: string
}
@Component({
    selector: 'app-list-view-filter',
    templateUrl: './list-view-filter.component.html',
    styleUrls: ['./list-view-filter.component.scss'],
})
export class ListViewFilterComponent implements OnInit, OnDestroy, AfterViewChecked {
    public showLoadMoreButton$: Subject<boolean> = new Subject();
    public loadingInProgress$: Subject<boolean> = new Subject();
    public trainsList: TrainSummary[] = [];
    public totalTrains: number = 0;
    public sortConditions: SortConditionsModel = { asc: true, field: PLANNED_DEPARTURE};
    public limit: number = DEFAULT_LIMIT;
    public containsRoundtrips: boolean = false;
    public offset: number = 0;
    public scrollPosition: number = null;

    protected sessionStorageObjekt:ListViewFilterSessionStorageObjekt = {} as ListViewFilterSessionStorageObjekt;
    protected trainChainObjekt:TrainChain = {};
    protected maxDate = ConstValues.MAX_DATE;
    protected trainnumbers: string[] = [];
    protected numberOfTrains: number;
    protected filterForm: FormGroup;
    protected sendingStationsAutocomplete: InfrastructureLocation[] = [];
    protected receivingStationsAutocomplete: InfrastructureLocation[] = [];
    protected roundtrips: TrainChainSummarySelection[] = [];
    protected downloadInProgress = false;
    protected InfrastructureLocationSummaryPipe: InfrastructureLocationSummaryPipe = inject(InfrastructureLocationSummaryPipe);
    readonly MAX_FILTER_COUNT = 10000;

    private initialDate: Date;
    private customerProfile: CustomerProfile | null | undefined = null;
    private subscription: Subscription = new Subscription();
    private sendingStationInputChange: Subject<string> = new Subject<string>();
    private receivingStationInputChange: Subject<string> = new Subject<string>();
    private trainsListSubscription: Subscription = null;
    private allTrainChainsSelected: boolean = false;

    constructor(
        private appService: AppService,
        private storage: LocalStorageService,
        private fileExportService: FileExportService,
        private trainOrderService: TrainorderService,
        private cd: ChangeDetectorRef
    ) {
        this.createInitialDate();
        this.setDefaultSortConditions();
        this.createFilterForm();
    }

    ngAfterViewChecked(): void {
        this.cd.detectChanges();
    }

    ngOnDestroy(): void {
        this.trainsListSubscription.unsubscribe();
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.fetchFilterValuesFromSessionStorage();
        this.fetchTrains(this.updateFilter());
        this.getRoundTripNames(this.customerProfile?.sgvId, this.customerProfile?.partnerId);
        this.registerForInputChanges();
    }

    private registerForInputChanges(): void {
        this.registerForTrainNumberInputChanges();
        this.registerForCustomerSelectionChanges();
    }

    private registerForTrainChainNameInputChanges(): void {
        this.subscription.add(this.trainChainNameSelector.valueChanges.subscribe((input: string) => {
            if (input === FETCH_ALL_ROUNDTRIP_ENTRIES) {
                this.allTrainChainsSelected = true;
            } else {
                this.allTrainChainsSelected = false;
            }
            if (input === '-1') {
                this.removeValueFromSessionStorageObjekt(TRAIN_CHAIN);
                this.resetList();
                const filter = this.updateFilter();
                filter.trainChainId = '';
                this.fetchTrains(filter);
            } else if (input.length > 0) {
                this.setTrainChainInSessionStorageObjekt(TRAIN_CHAIN_NAME,input);
                this.resetList();
                const filter = this.updateFilter();
                const selectedRoundtrip = this.roundtrips.find(roundtrip => { return input === roundtrip.name; })
                if (selectedRoundtrip) {
                    filter.trainChainId = selectedRoundtrip.trainChainId;
                    this.setTrainChainInSessionStorageObjekt(TRAIN_CHAIN_ID, filter.trainChainId);
                }
                this.fetchTrains(filter);
            }
        }));
    }

    protected loadReceivingStations($event: any): void {
        if ($event?.length === 0) {
            this.receivingStationsAutocomplete = [];
            this.removeValueFromSessionStorageObjekt(RECEIVING_STATION);
            this.receivingStationKeyAlpha.setValue('');
            this.receivingStationKeySequence.setValue('');
            this.receivingStationsAutocomplete = [];
            this.resetList();
            this.fetchTrains(this.updateFilter());
        } else {
            if ($event?.length >= 3) {
                this.trainOrderService.getTrainsInfrastructureLocations($event, StationType.DESTINATION, this.receivingStationsAutocomplete).subscribe((result: InfrastructureLocationResponse) => {
                    this.receivingStationsAutocomplete = this.trainOrderService.createUniqueKeysInfrastructureLocations(result);
                });
            }
        }
    }

    protected loadSendingStations($event: any): void {
        if ($event?.length === 0) {
            this.sendingStationsAutocomplete = [];
            this.removeValueFromSessionStorageObjekt(SENDING_STATION);
            this.sendingStationKeyAlpha.setValue('');
            this.sendingStationKeySequence.setValue('');
            this.sendingStationsAutocomplete = [];
            this.resetList();
            this.fetchTrains(this.updateFilter());
        } else {
            if ($event?.length >= 3) {
                this.trainOrderService.getTrainsInfrastructureLocations($event, StationType.DEPARTURE, this.sendingStationsAutocomplete).subscribe((result: InfrastructureLocationResponse) => {
                    this.sendingStationsAutocomplete = this.trainOrderService.createUniqueKeysInfrastructureLocations(result);
                });
            }
        }
    }

    protected onSelectReceivingStation(comLoc: any) {
        if (!comLoc || comLoc?.name?.length === 0) {
            this.receivingStationsAutocomplete = [];
            this.removeValueFromSessionStorageObjekt(RECEIVING_STATION);
            this.receivingStationKeyAlpha.setValue('');
            this.receivingStationKeySequence.setValue('');
            this.receivingStationsAutocomplete = [];
            this.resetList();
            this.fetchTrains(this.updateFilter());
        } else {
            const item = this.receivingStationsAutocomplete.find(station => { return station.name === comLoc.name; } );
            if (item) {
                this.setLocationInSessionStorageObjekt(RECEIVING_STATION, item);
                this.receivingStationKeyAlpha.setValue(item.objectKeyAlpha);
                this.receivingStationKeySequence.setValue(item.objectKeySequence);
                this.receivingStationsAutocomplete = [];
                this.resetList();
                this.fetchTrains(this.updateFilter());
            }
        }
    }

    protected onSelectSendingStation(comLoc: any) {
        if (!comLoc || comLoc?.name?.length === 0) {
            this.sendingStationsAutocomplete = [];
            this.removeValueFromSessionStorageObjekt(SENDING_STATION);
            this.sendingStationKeyAlpha.setValue('');
            this.sendingStationKeySequence.setValue('');
            this.sendingStationsAutocomplete = [];
            this.resetList();
            this.fetchTrains(this.updateFilter());
        } else {
            const item = this.sendingStationsAutocomplete.find(station => { return station.name === comLoc.name; } );
            if (item) {
                this.setLocationInSessionStorageObjekt(SENDING_STATION, item);
                this.sendingStationKeyAlpha.setValue(item.objectKeyAlpha);
                this.sendingStationKeySequence.setValue(item.objectKeySequence);
                this.sendingStationsAutocomplete = [];
                this.resetList();
                this.fetchTrains(this.updateFilter());
            }
        }
    }

    private createInitialDate(): void {
        this.initialDate = this.getYesterdaysDate();
    }

    private registerForTrainNumberInputChanges(): void {
        this.subscription.add(this.trainNumber.valueChanges.subscribe(input => {
            this.setValueInSessionStorageObjekt(TRAIN_NUMBER);
            this.resetList();
            const filter = this.updateFilter();
            filter.trainNumber = this.trainNumber.value;
            this.resetList();
            this.fetchTrains(filter);
        }));
    }

    private setDefaultSortConditions(): void {
        this.sortConditions = {
            asc: true,
            field: PLANNED_DEPARTURE
        }
    }

    private registerForCustomerSelectionChanges(): void {
        this.subscription.add(
            this.appService.customerSelection.subscribe({
                next: ( (customerProfile) => {
                    this.removeValueFromSessionStorageObjekt(TRAIN_CHAIN);
                    this.filterForm.get(TRAIN_CHAIN_NAME_SELECTOR).setValue(null);
                    if (customerProfile) {
                        if (customerProfile.partnerId.length === 0 && (!customerProfile.sgvId || (customerProfile.sgvId && customerProfile.sgvId.length === 0))) {
                            this.customerProfile = null;
                            this.roundtrips = [];
                            this.disableTrainChainNameSelector();
                        } else {
                            this.enableTrainChainNameSelector();
                            this.customerProfile = customerProfile;
                            this.getRoundTripNames(this.customerProfile?.sgvId, this.customerProfile?.partnerId);
                        }
                        this.resetList();
                        this.fetchTrains(this.updateFilter());
                    }
                })
            })
        );
    }

    private createFilterForm(): void {
        this.filterForm = new FormGroup({
            trainNumber: new FormControl(''),
            plannedDepartureFrom: new FormControl(''),
            plannedDepartureTo: new FormControl(''),
            sendingStation: new FormControl(''),
            receivingStation: new FormControl(''),
            sendingStationKeyAlpha: new FormControl(''),
            receivingStationKeyAlpha: new FormControl(''),
            sendingStationKeySequence: new FormControl(''),
            receivingStationKeySequence: new FormControl(''),
            trainChainNameSelector: new FormControl('')
        },
        [this.validateDates()]);
    }

    private validateDates(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.get(PLANNED_DEPARTURE_FROM)?.value || !control.get(PLANNED_DEPARTURE_TO)?.value)
                return null;
            return control.get(PLANNED_DEPARTURE_FROM)?.value <= control.get(PLANNED_DEPARTURE_TO)?.value ? null : { dateToBeforeDateFrom: true };
        }
    }

    private setLoadMoreButtonState(): void {
        if (this.trainsList && this.totalTrains > 0 && this.totalTrains > this.trainsList.length) {
            this.showLoadMoreButton$.next(true);
        } else {
            this.showLoadMoreButton$.next(false);
        }
    }

    public updateSortConditions(fieldName: string): void {
        let sortConditions: SortConditionsModel;
        if (fieldName === this.sortConditions.field) {
            sortConditions = {
                asc: !this.sortConditions.asc,
                field: this.sortConditions.field
            }
        } else {
            sortConditions = {
                asc: true,
                field: fieldName
            }
        }
        this.sortConditions = sortConditions;
        this.resetList();
        const filter = this.updateFilter();
        this.fetchTrains(filter);
    }

    public updateTrainsList(): void {
        const filter = this.updateFilter();
        this.fetchTrains(filter);
    }

    public loadMore(): void {
        this.limit = DEFAULT_LIMIT;
        this.offset = this.trainsList.length;
        this.scrollPosition = null;
        this.updateTrainsList();
    }

    private updateFilter(): ApiTrainsListRequest {
        const profiles: CustomerProfile[] = [];
        if (this.customerProfile) {
            profiles.push(this.customerProfile);
        }

        const plannedDepartureFrom = this.appService.dateStringToUtcDateTimeString(this.plannedDepartureFrom.value);
        const plannedDepartureTo = this.appService.dateStringToUtcDateTimeString(this.plannedDepartureTo.value);
        const selectedRoundtrip = this.roundtrips.find(roundtrip => { return this.trainChainNameSelector.value === roundtrip.name; })
        let trainChainId = this.trainChainNameSelector.value;
        if (selectedRoundtrip) { trainChainId = selectedRoundtrip.trainChainId; }
        const filter: ApiTrainsListRequest = {
            customerProfiles: profiles,
            offset: this.offset,
            limit: this.limit,
            trainNumber: this.trainNumber.value,
            trainChainId: trainChainId,
            plannedDepartureFrom: plannedDepartureFrom,
            plannedDepartureTo: plannedDepartureTo,
            allTrainChains: this.allTrainChainsSelected,
            sendingStationObjectKeyAlpha: this.filterForm.value.sendingStationKeyAlpha,
            sendingStationObjectKeySequence: this.filterForm.value.sendingStationKeySequence,
            receivingStationObjectKeyAlpha: this.filterForm.value.receivingStationKeyAlpha,
            receivingStationObjectKeySequence: this.filterForm.value.receivingStationKeySequence,
            sort: this.createSortConditionStatement()
        }
        return filter;
    }

    private createSortConditionStatement(): string {
        if (this.sortConditions.asc === true) {
            return '+' + this.sortConditions.field;
        } else {
            return '-' + this.sortConditions.field;
        }
    }

    private disableTrainChainNameSelector(): void {
        this.trainChainNameSelector.disable();
    }

    private enableTrainChainNameSelector(): void {
        this.trainChainNameSelector.enable();
    }

    private getRoundTripNames(sgvId: string, partnerId: string): void {
        if (!sgvId || !partnerId) {
            this.disableTrainChainNameSelector();
            return;
        }
        this.subscription.add(this.trainOrderService.getRoundTripNames(sgvId, partnerId).subscribe({
            next: ((result: TrainChainSummary[]) => {
                console.log(result);
                if (result.length > 0) {
                    this.roundtrips = [];
                    const defaultEntry: TrainChainSummarySelection = {
                        selected: true,
                        display: DEFAULT_ROUNDTRIP_ENTRY,
                        name: DEFAULT_ROUNDTRIP_ENTRY,
                        trainChainId: '',
                        trainNumbers: []
                    }
                    this.roundtrips.push(defaultEntry);

                    for (let item of result) {
                        const trainChainSummarySelection: TrainChainSummarySelection = {
                            selected: false,
                            name: item.name,
                            display: item.name + this.concatTrainNumbers(item.trainNumbers),
                            trainChainId: item.trainChainId,
                            trainNumbers: item.trainNumbers
                        }
                        this.roundtrips.push(trainChainSummarySelection);
                    }

                    if (result.length > 1) {
                        const fetchAllEntries: TrainChainSummarySelection = {
                            selected: false,
                            display: FETCH_ALL_ROUNDTRIP_ENTRIES,
                            name: FETCH_ALL_ROUNDTRIP_ENTRIES,
                            trainChainId: '',
                            trainNumbers: []
                        }
                        this.roundtrips.push(fetchAllEntries);
                    }

                    this.fetchTrainChainNameFromSessionStorage();
                    this.registerForTrainChainNameInputChanges();
                    this.enableTrainChainNameSelector();
                } else {
                    this.disableTrainChainNameSelector();
                }
            }),
            error: (error => {
                console.error('Failed to load data: ', error);
            })
        }));
    }

    private concatTrainNumbers(trainnumbers: string[]): string {
        let result: string = ' | ';
        let counter = 1;
        if (trainnumbers) {
            for (let item of trainnumbers) {
                result += item;
                if (trainnumbers.length > counter) {
                    result += ', ';
                }
                counter++;
            }
        }
        return result;
    }

    private fetchTrains(filter: ApiTrainsListRequest): void {
        if (filter.trainChainId === DEFAULT_ROUNDTRIP_ENTRY) {
            filter.trainChainId = '';
        }
        if (this.trainsListSubscription){
            this.trainsListSubscription.unsubscribe();
        }
        this.loadingInProgress$.next(true);
        this.trainsListSubscription = this.trainOrderService.sendTrainsListRequest(filter).subscribe({
            next: ((result: ApiTrainsListResponse) => {
                this.trainsList = this.trainsList.concat(result.items);
                this.containsRoundtrips = this.containsRoundtrip();
                this.totalTrains = result.total;
                this.offset = result.offset;
                this.numberOfTrains = this.trainsList?.length;
                this.setLoadMoreButtonState();
                this.goToScrollPosition();
            }),
            error: (error => {
                console.error('Failed to load data: ', error);
            })
        });
        this.trainsListSubscription.add(() => {
            this.loadingInProgress$.next(false);
        });
    }

    private goToScrollPosition() {
        if(this.scrollPosition) window.scrollTo(0, -this.scrollPosition);
    }

    private containsRoundtrip(): boolean {
        if (this.roundtrips && this.roundtrips.length > 0) {
            return true;
        }
        return false;
    }

    private getYesterdaysDate(): Date {
        return moment(new Date()).subtract(1, 'day').toDate();
    }

    protected selectPlannedDepartureFrom(event: any): void {
        const plannedDepartureFromInputField = this.filterForm.get(PLANNED_DEPARTURE_FROM);
        if (plannedDepartureFromInputField) {
            if (plannedDepartureFromInputField.value) {
                this.setValueInSessionStorageObjekt(PLANNED_DEPARTURE_FROM);
            } else {
                this.setValueInSessionStorageObjekt(PLANNED_DEPARTURE_FROM,"empty");
            }
        } else {
            console.error('Failed to find input: plannedDepartureFrom');
        }
        this.resetList();
        this.fetchTrains(this.updateFilter());
    }

    protected selectPlannedDepartureTo(event: any): void {
        const plannedDepartureToInputField = this.filterForm.get(PLANNED_DEPARTURE_TO);
        if (plannedDepartureToInputField) {
            if (plannedDepartureToInputField.value) {
                this.setValueInSessionStorageObjekt(PLANNED_DEPARTURE_TO);
            } else {
                this.removeValueFromSessionStorageObjekt(PLANNED_DEPARTURE_TO);
            }
        } else {
            console.error('Failed to find input: plannedDepartureTo');
        }
        this.resetList();
        this.fetchTrains(this.updateFilter());
    }

    private fetchTrainChainNameFromSessionStorage(): void {
        let s_trainChainName = this.getValueFromSessionStorageObjekt(TRAIN_CHAIN)?.trainChainName;
        if (s_trainChainName) {
            const trainChainNameInput = this.filterForm.get(TRAIN_CHAIN_NAME_SELECTOR);
            if (trainChainNameInput) {
                trainChainNameInput.setValue(s_trainChainName);
            } else {
                console.error('Failed to find input field: trainChainName');
            }
        } else {
            s_trainChainName = DEFAULT_ROUNDTRIP_ENTRY;
            const trainChainNameInput = this.filterForm.get(TRAIN_CHAIN_NAME_SELECTOR);
            trainChainNameInput.setValue(s_trainChainName);
        }
    }

    private fetchTrainnumberFromSessionStorage(): void {
        const s_trainNumber = this.getValueFromSessionStorageObjekt(TRAIN_NUMBER);
        if (s_trainNumber) {
            const trainNumberInput = this.filterForm.get(TRAIN_NUMBER);
            if (trainNumberInput) {
                trainNumberInput.setValue(s_trainNumber);
            } else {
                console.error('Failed to find input field: trainNumber');
            }
        }
    }

    private fetchPlannedDepartureFromFromSessionStorage(): void {
        const plannedDepartureFromInputField = this.filterForm.get(PLANNED_DEPARTURE_FROM);
        if (plannedDepartureFromInputField) {
            const plannedDepartureFromValue = this.getValueFromSessionStorageObjekt(PLANNED_DEPARTURE_FROM)
            if (plannedDepartureFromValue){
                if (plannedDepartureFromValue == "empty") {
                    plannedDepartureFromInputField.setValue(null);
                } else {
                    plannedDepartureFromInputField.setValue(formatDate(plannedDepartureFromValue, 'yyyy-MM-dd', 'de'));
                }
            } else {
                plannedDepartureFromInputField.setValue(formatDate(this.initialDate, 'yyyy-MM-dd', 'de'));
                this.setValueInSessionStorageObjekt(PLANNED_DEPARTURE_FROM);
            }
            plannedDepartureFromInputField.addValidators([Validators.required]);
        } else {
            console.error('Failed to find input: plannedDepartureFrom');
        }
    }

    private fetchPlannedDepartureToFromSessionStorage(): void {
        const plannedDepartureToInputField = this.filterForm.get(PLANNED_DEPARTURE_TO);
        if (plannedDepartureToInputField) {
            const plannedDepartureToValue = this.getValueFromSessionStorageObjekt(PLANNED_DEPARTURE_TO);
            if (plannedDepartureToValue) {
                plannedDepartureToInputField.setValue(formatDate(plannedDepartureToValue, 'yyyy-MM-dd', 'de'));
                plannedDepartureToInputField.addValidators([Validators.required]);
            }
        } else {
            console.error('Failed to find input: plannedDepartureFrom');
        }
    }

    private fetchSendingStationKeyAlphaFromSessionStorage(): void {
        const s_sendingStationKeyAlpha = this.getValueFromSessionStorageObjekt(SENDING_STATION)?.objectKeyAlpha;
        if (s_sendingStationKeyAlpha) {
            const sendingStationKeyAlphaInput = this.filterForm.get(SENDING_STATION_KEY_ALPHA);
            if (sendingStationKeyAlphaInput) {
                sendingStationKeyAlphaInput.setValue(s_sendingStationKeyAlpha);
            } else {
                console.error('Failed to find input field: sendingStationKeyAlpha');
            }
        }
    }

    private fetchSendingStationKeySequenceFromSessionStorage(): void {
        const s_sendingStationKeySequence = this.getValueFromSessionStorageObjekt(SENDING_STATION)?.objectKeySequence;
        if (s_sendingStationKeySequence) {
            const sendingStationKeySequenceInput = this.filterForm.get(SENDING_STATION_KEY_SEQUENCE);
            if (sendingStationKeySequenceInput) {
                sendingStationKeySequenceInput.setValue(s_sendingStationKeySequence);
            } else {
                console.error('Failed to find input field: sendingStationKeySequence');
            }
        }
    }

    private fetchReceivingStationKeyAlphaFromSessionStorage(): void {
        const s_receivingStationKeyAlpha = this.getValueFromSessionStorageObjekt(RECEIVING_STATION)?.objectKeyAlpha;
        if (s_receivingStationKeyAlpha) {
            const receivingStationKeyAlphaInput = this.filterForm.get(RECEIVING_STATION_KEY_ALPHA);
            if (receivingStationKeyAlphaInput) {
                receivingStationKeyAlphaInput.setValue(s_receivingStationKeyAlpha);
            } else {
                console.error('Failed to find input field: receivingStationKeyAlpha');
            }
        }
    }

    private fetchReceivingStationKeySequenceFromSessionStorage(): void {
        const s_receivingStationKeySequence = this.getValueFromSessionStorageObjekt(RECEIVING_STATION)?.objectKeySequence;
        if (s_receivingStationKeySequence) {
            const receivingStationKeySequenceInput = this.filterForm.get(RECEIVING_STATION_KEY_SEQUENCE);
            if (receivingStationKeySequenceInput) {
                receivingStationKeySequenceInput.setValue(s_receivingStationKeySequence);
            } else {
                console.error('Failed to find input field: receivingStationKeySequence');
            }
        }
    }

    private fetchFilterValuesFromSessionStorage(): void {
      this.fetchCustomerProfileFromSessionStorage();
      this.fetchTrainnumberFromSessionStorage();
      this.fetchPlannedDepartureFromFromSessionStorage();
      this.fetchPlannedDepartureToFromSessionStorage();
      this.fetchSendingStationKeyAlphaFromSessionStorage();
      this.fetchSendingStationKeySequenceFromSessionStorage();
      this.fetchReceivingStationKeyAlphaFromSessionStorage();
      this.fetchReceivingStationKeySequenceFromSessionStorage();
      this.fetchSendingStationNameFromSessionStorage();
      this.fetchReceivingStationNameFromSessionStorage();
    }

    private fetchCustomerProfileFromSessionStorage(): void {
        const activeProfiles = this.storage.getActiveProfiles();
        if (activeProfiles && activeProfiles[0]) {
          this.customerProfile = activeProfiles[0];
        } else {
          this.customerProfile = null;
        }
    }

    private fetchReceivingStationNameFromSessionStorage(): void {
        const receivingStationName = this.getValueFromSessionStorageObjekt(RECEIVING_STATION)?.name;
        if (receivingStationName) {
            this.receivingStation.setValue(receivingStationName);
        }
    }

    private fetchSendingStationNameFromSessionStorage(): void {
        const sendingStationName = this.getValueFromSessionStorageObjekt(SENDING_STATION)?.name;
        if (sendingStationName) {
            this.sendingStation.setValue(sendingStationName);
        }
    }

    /**
     * Emits the next input value from the field
     * @param event
     */
    protected autocompleteInputChanged(event: any): void {
        switch (event.target.name) {
            case 'sending-station':
                this.sendingStationInputChange.next(event.target.value);
                break;
            case 'receiving-station':
                this.receivingStationInputChange.next(event.target.value);
                break;
            default:
                break;
        }
    }

    /**
     * Emits the request to load stations autocomplete suggestions if input length is greater than 2
     * @param input event from the input
     * @param stationType type of the station, sending or receiving
     */
    protected getAutocompleteSuggestions(input: any, stationType: string): void {
        let autocompleteArray: InfrastructureLocation[] = [];
        let apiStationType = StationType.DEPARTURE;
        if (stationType === StationTypes.SENDING) {
            autocompleteArray = this.sendingStationsAutocomplete;
        } else if (stationType === StationTypes.RECEIVING) {
            apiStationType = StationType.DESTINATION;
            autocompleteArray = this.receivingStationsAutocomplete;
        }
        this.subscription.add(this.trainOrderService.getTrainsInfrastructureLocations(input, apiStationType, autocompleteArray).subscribe((result: InfrastructureLocationResponse) => {
            if (stationType === StationTypes.SENDING) {
                this.sendingStationsAutocomplete =  this.trainOrderService.createUniqueKeysInfrastructureLocations(result);
            } else if (stationType === StationTypes.RECEIVING) {
                this.receivingStationsAutocomplete = this.trainOrderService.createUniqueKeysInfrastructureLocations(result);
            }
        }));
    }

    public resetList(limit: number = DEFAULT_LIMIT): void {
        this.trainsList = [];
        this.offset = 0;
        this.limit = limit;
    }

    /**
     * Resets all filter values to default
     */
    protected resetFilterConditions(): void {
        this.filterForm.setValue({
            trainNumber: '',
            plannedDepartureFrom: '',
            plannedDepartureTo: '',
            sendingStation: '',
            receivingStation: '',
            sendingStationKeyAlpha: '',
            receivingStationKeyAlpha: '',
            sendingStationKeySequence: '',
            receivingStationKeySequence: '',
            trainChainNameSelector: ''
        });
        this.removeValueFromSessionStorageObjekt(SENDING_STATION);
        this.removeValueFromSessionStorageObjekt(RECEIVING_STATION);
        this.removeValueFromSessionStorageObjekt (TRAIN_NUMBER);
        this.setValueInSessionStorageObjekt(PLANNED_DEPARTURE_FROM,"empty");
        this.removeValueFromSessionStorageObjekt (PLANNED_DEPARTURE_TO);
        this.removeValueFromSessionStorageObjekt (TRAIN_CHAIN);

        this.sendingStationsAutocomplete = [];
        this.receivingStationsAutocomplete = [];

        const trainChainNameInput = this.filterForm.get(TRAIN_CHAIN_NAME_SELECTOR);
        trainChainNameInput.setValue(DEFAULT_ROUNDTRIP_ENTRY);

        this.resetList();
        this.fetchTrains(this.updateFilter());
    }

    protected clearSearchInput(key: string) {
        switch (key) {
            case SENDING_STATION:
                this.filterForm.controls[SENDING_STATION].setValue('');
                this.filterForm.controls[SENDING_STATION_KEY_SEQUENCE].setValue('');
                this.filterForm.controls[SENDING_STATION_KEY_ALPHA].setValue('');
                this.removeValueFromSessionStorageObjekt(SENDING_STATION);
                this.sendingStationsAutocomplete = [];
                break;
            case RECEIVING_STATION:
                this.filterForm.controls[RECEIVING_STATION].setValue('');
                this.filterForm.controls[RECEIVING_STATION_KEY_SEQUENCE].setValue('');
                this.filterForm.controls[RECEIVING_STATION_KEY_ALPHA].setValue('');
                this.removeValueFromSessionStorageObjekt(RECEIVING_STATION);
                this.receivingStationsAutocomplete = [];
                break;
            case TRAIN_NUMBER:
                this.filterForm.controls[TRAIN_NUMBER].setValue('');
                this.removeValueFromSessionStorageObjekt (TRAIN_NUMBER);
                break;
        }
        this.resetList();
        this.fetchTrains(this.updateFilter());
    }

    /**
     * Used for input date fields to add focus class
     * @param event
     */
    protected onFocus(event: any) {
        event.target.classList.add(FOCUSED);
    }

    /**
     * Used for input date fields to remove focus class
     * @param event
     */
    protected onBlur(event: any) {
        if (!event.target.value) {
            event.target.classList.remove(FOCUSED);
        }
    }

    /**
     * Saves complete list of train without filtering on local machine intro csv file
     */
    protected saveCompleteListToCSV(): void {
        this.downloadInProgress = true;
        let trainNumber = undefined;
        if(this.getValueFromSessionStorageObjekt(TRAIN_NUMBER)) {
            trainNumber = this.getValueFromSessionStorageObjekt(TRAIN_NUMBER);
        } else {
            trainNumber = undefined;
        }

        console.log(trainNumber);

        const profiles: CustomerProfile[] = [];
        if (this.customerProfile) {
            profiles.push(this.customerProfile);
        }

        console.log(profiles);

        const paramsBody: ApiTrainsListRequest = {
            trainNumber: trainNumber!,
            trainChainId: this.getValueFromSessionStorageObjekt(TRAIN_CHAIN)?.trainChainId,
            plannedDepartureFrom: this.appService.dateStringToUtcDateTimeString(this.filterForm.get(PLANNED_DEPARTURE_FROM)?.value),
            plannedDepartureTo: this.appService.dateStringToUtcDateTimeString(this.getValueFromSessionStorageObjekt(PLANNED_DEPARTURE_TO)),
            sendingStationObjectKeyAlpha: this.getValueFromSessionStorageObjekt(SENDING_STATION)?.objectKeyAlpha,
            sendingStationObjectKeySequence: this.getValueFromSessionStorageObjekt(SENDING_STATION)?.objectKeySequence,
            receivingStationObjectKeyAlpha: this.getValueFromSessionStorageObjekt(RECEIVING_STATION)?.objectKeyAlpha,
            receivingStationObjectKeySequence: this.getValueFromSessionStorageObjekt(RECEIVING_STATION)?.objectKeySequence,
            allTrainChains: false,
            customerProfiles: profiles,
            offset: 0,
            limit: this.totalTrains,
            sort: '+plannedDeparture'
        };
        console.log(paramsBody);
        if (paramsBody.trainChainId === FETCH_ALL_ROUNDTRIP_ENTRIES || paramsBody.trainChainId === DEFAULT_ROUNDTRIP_ENTRY) {
            paramsBody.trainChainId = '';
        }
        this.trainOrderService
            .sendTrainsListRequest(paramsBody)
            .subscribe({
                next: (result: ApiTrainsListResponse) => {
                    this.fileExportService.exportTrainsToCsv(result.items);
                    this.downloadInProgress = false;
                },
                error: (error) => {
                    this.downloadInProgress = false;
                    throw error;
                }
            });
    }

    get sendingStation() {
        return this.filterForm.get(SENDING_STATION) as FormControl;
    }

    get sendingStationKeyAlpha() {
        return this.filterForm.get(SENDING_STATION_KEY_ALPHA) as FormControl;
    }

    get sendingStationKeySequence() {
        return this.filterForm.get(SENDING_STATION_KEY_SEQUENCE) as FormControl;
    }

    get receivingStationKeyAlpha() {
        return this.filterForm.get(RECEIVING_STATION_KEY_ALPHA) as FormControl;
    }

    get receivingStationKeySequence() {
        return this.filterForm.get(RECEIVING_STATION_KEY_SEQUENCE) as FormControl;
    }

    get receivingStation() {
        return this.filterForm.get(RECEIVING_STATION) as FormControl;
    }

    get plannedDepartureFrom() {
        return this.filterForm.get(PLANNED_DEPARTURE_FROM) as FormControl;
    }

    get plannedDepartureTo() {
        return this.filterForm.get(PLANNED_DEPARTURE_TO) as FormControl;
    }

    get trainNumber() {
        return this.filterForm.get(TRAIN_NUMBER) as FormControl;
    }

    get trainChainNameSelector() {
        return this.filterForm.get(TRAIN_CHAIN_NAME_SELECTOR) as FormControl;
    }

    protected activeFilterAmount():number{
        var count = 0;
        for(var prop in this.sessionStorageObjekt) {
            if(this.sessionStorageObjekt.hasOwnProperty(prop)){
                if((prop == "plannedDepartureFrom" && this.sessionStorageObjekt.plannedDepartureFrom.toString() == "empty")
                    || (prop == "trainChain" && (this.sessionStorageObjekt.trainChain.trainChainName == "Umlauf auswählen"||this.sessionStorageObjekt.trainChain.trainChainName == "Alle Umläufe anzeigen")) ){
                        count = count - 1;
                    }
                    count = count + 1;
                }
        }
        return count
    }

    protected setValueInSessionStorageObjekt(filtername: string, value?:string) {
        const filterField = this.filterForm.get(filtername);
        const sessionStorageObjektString = sessionStorage.getItem(LIST_VIEW_FILTER_OBJEKT)
        if (sessionStorageObjektString)this.sessionStorageObjekt = JSON.parse(sessionStorageObjektString);
        if(!value){
            this.sessionStorageObjekt[filtername] = filterField.value;
        }else{
            this.sessionStorageObjekt[filtername] = value;
        }
        sessionStorage.setItem(LIST_VIEW_FILTER_OBJEKT,JSON.stringify(this.sessionStorageObjekt));
    }

    protected setLocationInSessionStorageObjekt(filtername: string, location: InfrastructureLocation) {
        const sessionStorageObjektString = sessionStorage.getItem(LIST_VIEW_FILTER_OBJEKT)
        if (sessionStorageObjektString)this.sessionStorageObjekt = JSON.parse(sessionStorageObjektString);
        this.sessionStorageObjekt[filtername] = location;
        sessionStorage.setItem(LIST_VIEW_FILTER_OBJEKT,JSON.stringify(this.sessionStorageObjekt));
    }

    protected setTrainChainInSessionStorageObjekt(filtername: string, value: string) {
        const sessionStorageObjektString = sessionStorage.getItem(LIST_VIEW_FILTER_OBJEKT)
        if (sessionStorageObjektString) this.sessionStorageObjekt = JSON.parse(sessionStorageObjektString);
        this.trainChainObjekt[filtername] = value;
        this.sessionStorageObjekt.trainChain = this.trainChainObjekt;
        sessionStorage.setItem(LIST_VIEW_FILTER_OBJEKT,JSON.stringify(this.sessionStorageObjekt));
    }

    protected getValueFromSessionStorageObjekt(filtername: string) {
        const sessionStorageObjektString = sessionStorage.getItem(LIST_VIEW_FILTER_OBJEKT)
        if (sessionStorageObjektString)this.sessionStorageObjekt = JSON.parse(sessionStorageObjektString);
        return this.sessionStorageObjekt[filtername];
    }

    protected removeValueFromSessionStorageObjekt (filtername: string){
        const sessionStorageObjektString = sessionStorage.getItem(LIST_VIEW_FILTER_OBJEKT)
        if (sessionStorageObjektString)this.sessionStorageObjekt = JSON.parse(sessionStorageObjektString);
        delete this.sessionStorageObjekt[filtername];
        sessionStorage.setItem(LIST_VIEW_FILTER_OBJEKT,JSON.stringify(this.sessionStorageObjekt));
    }
}
