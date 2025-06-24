import { ChangeDetectorRef, Component, OnDestroy, OnInit, Inject, inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { DialogPosition, MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { ApiDangerousGoodResponse, ApiGoodResponse, DangerousGoodClass, DangerousGoodModel, GoodModel, WagonCodes, WagonType } from '@src/app/trainorder/models/Cargo.model';
import { Cargo, CargoDetail } from '@src/app/trainorder/models/ApiNewOrder.model';
import { CustomerSgvNamePipe } from '@src/app/shared/pipes/customer-sgv-name.pipe';
import { SharedModule } from '@src/app/shared/shared.module';
import { TrainorderPipesModule } from '@src/app/trainorder/pipes/trainorder-pipes.module';
import { Border, BorderResponse, CommercialService, CommercialServiceResponse, Supplier, TomGroupsResponse, WorkingDirection, WorkingDirectionsResponse } from '@src/app/trainorder/models/ApiModels';
import { OrderTemplate, OrderTemplateCarrier, OrderTemplateRequest, OrderTemplateResponse, OrderTemplateRoute } from '@src/app/trainorder/models/OrderTemplateModels';
import { ConstValues } from '@src/app/shared/enums/const-values.enum';
import { Customer, CustomerResponse, MarketSegment, Site, SiteResponse } from '@src/app/trainorder/models/ApiCustomers.model';
import { CommercialLocation, InfrastructureLocation, ProductionLocation, ProductionLocationResponse } from '@src/app/trainorder/models/location.models';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { BorderCodeNamePipe } from '@src/app/trainorder/pipes/border-code-name.pipe';
import { validUntilBeforeValidFrom } from '@src/app/shared/validators/custom-validators';
import { StationTypes } from '@src/app/shared/enums/stations.enum';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ErrorProcessingService } from '@src/app/shared/components/api-error/error-processing.spec';
import { ConfirmationComponent } from '@src/app/shared/components/confirmations/confirmation.component';
import { ElSAutocompleteModule } from '@src/app/shared/components/form-dialog/el-s-autocomplete/el-s-autocomplete.module';
import { CommercialLocationSummaryPipe } from '@src/app/shared/pipes/commercial-location-summary.pipe';
import { CommercialLocationSummary } from '@src/app/order-management/models/general-order';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';

enum ViewState {
    NET_WEIGHT_AND_WAGGON_AMOUNT = 'NET_WEIGHT_AND_WAGGON_AMOUNT',
    GROSS_WEIGHT_AND_TRAIN_LENGTH = 'GROSS_WEIGHT_AND_TRAIN_LENGTH'
}

interface ResultRoute {
    idx: number,
    startStation: string,
    sendingStationKeyAlpha: string,
    sendingStationKeySequence: string,
    endStation: string,
    receivingStationKeyAlpha: string,
    receivingStationKeySequence: string,
    carrierCode: string,
    carrierName: string
}

@Component({
    selector: 'app-new-order-template',
    templateUrl: './new-order-template.component.html',
    styleUrls: ['./new-order-template.component.scss'],
    standalone: true,
    imports: [
        SharedModule,
        TrainorderPipesModule,
        ElSAutocompleteModule
    ]
})

export class NewOrderTemplateComponent implements OnInit, OnDestroy {
    private subscription: Subscription = new Subscription();
    private ordererSgvInputChange: Subject<string> = new Subject<string>();
    private senderSgvInputChange: Subject<string> = new Subject<string>();
    private receiverSgvInputChange: Subject<string> = new Subject<string>();
    private loaderSgvInputChange: Subject<string> = new Subject<string>();
    private unloaderSgvInputChange: Subject<string> = new Subject<string>();
    private startStationInputChange: Subject<string> = new Subject<string>();
    private endStationInputChange: Subject<string> = new Subject<string>();
    private borderStationInputChange: Subject<string> = new Subject<string>();
    private selectedBorder: Border | undefined;
    private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);

    protected commercialLocationSummaryPipe: CommercialLocationSummaryPipe = inject(CommercialLocationSummaryPipe);
    protected commercialLocationSummariesSendingStations: CommercialLocationSummary[] = [];
    protected commercialLocationSummariesReceivingStations: CommercialLocationSummary[] = [];

    readonly editTemplateId: string;
    protected orderTemplate: OrderTemplate;
    protected editMode = false;
    private subject = new Subject<any>();
    private resultRoutes: ResultRoute[];
    protected loadingInProgress = false;

    private cargoInputChange: Subject<string> = new Subject<string>(); // | Used to track the input in the field
    private dangerousCargoInputChange: Subject<string> = new Subject<string>(); // | in order to have a delay between the requests
    private wagonTypeInputChange: Subject<string> = new Subject<string>();

    error: string;
    ViewState = ViewState;
    noWagonTypeDatafound = false;
    currentTab = 0;
    tabs = ['shippingTab', 'receivingTab', 'miscTab', 'transporterRouteTab', 'trainDataTab'];
    maxDate = ConstValues.MAX_DATE;
    ordererSgvAutoComplete: Customer[] = [];
    senderSgvAutoComplete: Customer[] = [];
    receiverSgvAutoComplete: Customer[] = [];
    loaderSgvAutoComplete: Customer[] = [];
    unloaderSgvAutoComplete: Customer[] = [];
    ordererPartnerIdList: Site[];
    senderPartnerIdList: Site[];
    receiverPartnerIdList: Site[];
    loaderPartnerIdList: Site[];
    unloaderPartnerIdList: Site[];
    receivingStationsAutocomplete: CommercialLocation[] = [];
    startStationsAutocomplete: CommercialLocation[] = [];
    endStationsAutocomplete: CommercialLocation[] = [];
    wagonStoringPositionSenderAutocomplete: ProductionLocation[] = [];
    wagonStoringPositionReceiverAutocomplete: ProductionLocation[] = [];
    borderStationAutoComplete: Border[] = [];
    marketSegmentAutoComplete: MarketSegment[] = [];
    viewState = ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH;
    suppliers: Supplier[];
    marketSegments: MarketSegment[];
    workingDirections: WorkingDirection[];
    tomGroups: string[];
    commercialServices: CommercialService[];
    nhmCodeAutocomplete: GoodModel[] = [];
    dangerousGoodsClasses: DangerousGoodClass[] = [];
    wagonTypeAutocomplete: WagonType[] = [];
    availableWagonModels: WagonType[] = [];
    dangerousGoodsAutocomplete: DangerousGoodModel[] = [];
    newOrderTemplateForm: FormGroup;

    constructor(
        @Inject(MAT_DIALOG_DATA) public param: { templateId: string },
        private cd: ChangeDetectorRef,
        private modalWindows: ModalWindows,
        private trainorderService: TrainorderService,
        private translation: TranslateService,
        private customerSgvNamePipe: CustomerSgvNamePipe,
        private borderCodeNamePipe: BorderCodeNamePipe,
        public permissionService: PermissionService,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<NewOrderTemplateComponent>,
        private errorProcessing: ErrorProcessingService,
    ) {
        if (param) {
            this.editTemplateId = param.templateId;
            this.editMode = true;
        }
        this.createFormGroup();
        this.synchronizeShippmentRoute();
        this.synchronizeReceivingRoute();
    }

    private createFormGroup(): void {
        this.newOrderTemplateForm = new FormGroup({
            newTemplateSendingStationKeyAlpha: new FormControl(''),
            newTemplateSendingStationKeySequence: new FormControl(''),
            newTemplateReceivingStationKeyAlpha: new FormControl(''),
            newTemplateReceivingStationKeySequence: new FormControl(''),
            newTemplateStartStationKeyAlpha: new FormControl(''),
            newTemplateStartStationKeySequence: new FormControl(''),
            newTemplateEndStationKeyAlpha: new FormControl(''),
            newTemplateEndStationKeySequence: new FormControl(''),
            wagonStoringPositionSenderKeyAlpha: new FormControl(''),
            wagonStoringPositionSenderKeySequence: new FormControl(''),
            wagonStoringPositionReceiverKeyAlpha: new FormControl(''),
            wagonStoringPositionReceiverKeySequence: new FormControl(''),
            receivingStationKeyAlpha: new FormControl(''),
            receivingStationKeySequence: new FormControl(''),
            uicBorderCode: new FormControl(''),

            shippingGroup: new FormGroup({
                ordererSgvId: new FormControl(null, Validators.required),
                ordererPartnerId: new FormControl(null, Validators.required),
                customerLanguage: new FormControl('de', Validators.required),
                senderSgvId: new FormControl(null, Validators.required),
                senderPartnerId: new FormControl(null, Validators.required),
                newTemplateSendingStation: new FormControl(null, Validators.required),
                wagonStoringPositionSender: new FormControl(null, Validators.required),
                loaderSgvId: new FormControl(),
                loaderPartnerId: new FormControl(),
                firstCarrierUicCompanyCode: new FormControl(null, Validators.required),
                workDirectionSend: new FormControl(),
            }),
            receivingGroup: new FormGroup({
                receiverSgvId: new FormControl(null, Validators.required),
                receiverPartnerId: new FormControl(null, Validators.required),
                newTemplateReceivingStation: new FormControl(null, Validators.required),
                wagonStoringPositionReceiver: new FormControl(null, Validators.required),
                unloaderSgvId: new FormControl(),
                unloaderPartnerId: new FormControl(),
                lastCarrierUicCompanyCode: new FormControl(null, Validators.required),
                workDirectionReceive: new FormControl(),
            }),
            miscGroup: new FormGroup({
                mainCarrierUicCompanyCode: new FormControl(null, Validators.required),
                mainCarrierName: new FormControl(),
                marketSegmentCode: new FormControl(null, Validators.required),
                tomGroup: new FormControl(null, Validators.required),
                operationalId: new FormControl(null, Validators.required),
                commercialService: new FormControl(),
                borderStation: new FormControl(),
                validFrom: new FormControl(null, Validators.required),
                validUntil: new FormControl(null, Validators.required),
                templateName: new FormControl()
            }),
            transportRouteGroup: new FormGroup({
                firstStartStation: new FormControl(),
                firstEndStation: new FormControl(),
                firstCarrierUicCompanyCode: new FormControl(),
                lastStartStation: new FormControl(),
                lastEndStation: new FormControl(),
                lastCarrierUicCompanyCode: new FormControl(),
                additionalRoutes: this.fb.array([])
            }),
            trainParamSelection: new FormControl(this.viewState),
            trainDataGroup: new FormGroup({
                // grossWeight: new FormControl('', [Validators.required]),
                // trainLength: new FormControl('', [Validators.required]),
                grossWeight: new FormControl(),
                trainLength: new FormControl(),
                vmax: new FormControl(),
                // nhmCode: new FormControl('', [Validators.required]),
                nhmCode: new FormControl(),
                dangerousGoodClass: new FormControl(),
                bzaNr: new FormControl(),
                p2: new FormControl(),
                c2: new FormControl(),
                p3: new FormControl(),
                c3: new FormControl(),
                trainDataGroupArray_1: this.fb.array([]),
                trainDataGroupArray_2: this.fb.array([])
            })

        },
        { validators: validUntilBeforeValidFrom() }
    );
    }

    protected loadReceivingStations($event: any): void {
        this.railOrderInternalService.getCommercialLocations($event).subscribe({
        next: (clList: CommercialLocationSummary[]) => {
            // Entferne doppelte Einträge basierend auf der locationCode-Eigenschaft
            const uniqueList = clList.filter((item, index, self) =>
            index === self.findIndex((t) => t.locationCode === item.locationCode)
            );
            this.commercialLocationSummariesReceivingStations = uniqueList;
        }
        });
    }

    protected loadSendingStations($event: any): void {
        this.railOrderInternalService.getCommercialLocations($event).subscribe({
        next: (clList: CommercialLocationSummary[]) => {
            // Entferne doppelte Einträge basierend auf der locationCode-Eigenschaft
            const uniqueList = clList.filter((item, index, self) =>
            index === self.findIndex((t) => t.locationCode === item.locationCode)
            );
            this.commercialLocationSummariesSendingStations = uniqueList;
        }
        });
    }

    protected onSelectReceivingStation(comLoc: CommercialLocationSummary) {
        const foundStation = this.commercialLocationSummariesReceivingStations.find((station) => station.name === comLoc.name);
        if (foundStation) {
            this.newOrderTemplateForm.controls['newTemplateReceivingStationKeySequence'].setValue(foundStation.objectKeySequence);
            this.newOrderTemplateForm.controls['newTemplateReceivingStationKeyAlpha'].setValue(foundStation.objectKeyAlpha);
            this.trainorderService.getProductionLocations(
                foundStation.objectKeyAlpha,
                foundStation.objectKeySequence,
                'PRDV'
            ).subscribe((result: ProductionLocationResponse) => {
                this.wagonStoringPositionReceiverAutocomplete = result;
            }, (error: any) => {
                this.errorHandling(error);
            });
        }
    }

    protected onSelectSendingStation(comLoc: CommercialLocationSummary) {
        const foundStation = this.commercialLocationSummariesSendingStations.find((station) => station.name === comLoc.name);
        if (foundStation) {
            this.newOrderTemplateForm.controls['newTemplateSendingStationKeySequence'].setValue(foundStation.objectKeySequence);
            this.newOrderTemplateForm.controls['newTemplateSendingStationKeyAlpha'].setValue(foundStation.objectKeyAlpha);
            this.trainorderService.getProductionLocations(
                foundStation.objectKeyAlpha,
                foundStation.objectKeySequence,
                'PRDV'
            ).subscribe((result: ProductionLocationResponse) => {
                this.wagonStoringPositionSenderAutocomplete = result;
            }, (error: any) => {
                this.errorHandling(error);
            });
        }
    }

    clearAdditionalRouteInput(fieldName: string, idx: number): void {
        let counter = 0;
        for (let control of this.getAdditionalRoutes().controls) {
            if (counter === idx) {
                const c = control.get(fieldName);
                if (c) {
                    c.setValue('');
                    return;
                }
            }
            counter++;
        }
    }

    getAdditionalRoutes(): FormArray {
        return this.transportRouteGroup.get("additionalRoutes") as FormArray;
    }

    synchronizeShippmentRoute(): void {
        const firstStartStation = this.newOrderTemplateForm.get('transportRouteGroup')?.get('firstStartStation');
        if (!firstStartStation) {
            console.error('Failed to find input field: transportRouteGroup::firstStartStation');
        }
        const newTemplateSendingStation = this.newOrderTemplateForm.get('shippingGroup')?.get('newTemplateSendingStation');
        if (!newTemplateSendingStation) {
            console.error('Failed to find input field: shippingGroup::newTemplateSendingStation');
        }
        if (firstStartStation && newTemplateSendingStation) {
            newTemplateSendingStation.valueChanges.subscribe(value => {
                firstStartStation.setValue(value);
            });
        }

        const firstCarrier = this.newOrderTemplateForm.get('transportRouteGroup')?.get('firstCarrierUicCompanyCode');
        if (!firstCarrier) {
            console.error('Failed to find input field: transportRouteGroup::firstCarrierUicCompanyCode');
        }
        const firstCarrierUicCompanyCode = this.newOrderTemplateForm.get('shippingGroup')?.get('firstCarrierUicCompanyCode');
        if (!firstCarrierUicCompanyCode) {
            console.error('Failed to find input field: shippingGroup::firstCarrierUicCompanyCode');
        }
        if (firstCarrier && firstCarrierUicCompanyCode) {
            firstCarrierUicCompanyCode.valueChanges.subscribe(value => {
                firstCarrier.setValue(value);
            });
        }
    }

    synchronizeReceivingRoute(): void {
        const lastEndStation = this.newOrderTemplateForm.get('transportRouteGroup')?.get('lastEndStation');
        if (!lastEndStation) {
            console.error('Failed to find input field: transportRouteGroup::lastEndStation');
        }
        const newTemplateReceivingStation = this.newOrderTemplateForm.get('receivingGroup')?.get('newTemplateReceivingStation');
        if (!newTemplateReceivingStation) {
            console.error('Failed to find input field: receivingGroup::newTemplateReceivingStation');
        }
        if (lastEndStation && newTemplateReceivingStation) {
            newTemplateReceivingStation.valueChanges.subscribe(value => {
                lastEndStation.setValue(value);
            });
        }
        const lastCarrier = this.newOrderTemplateForm.get('transportRouteGroup')?.get('lastCarrierUicCompanyCode');
        if (!lastCarrier) {
            console.error('Failed to find input field: transportRouteGroup::lastCarrierUicCompanyCode');
        }
        const lastCarrierUicCompanyCode = this.newOrderTemplateForm.get('receivingGroup')?.get('lastCarrierUicCompanyCode');
        if (!lastCarrierUicCompanyCode) {
            console.error('Failed to find input field: receivingGroup::lastCarrierUicCompanyCode');
        }
        if (lastCarrier && lastCarrierUicCompanyCode) {
            lastCarrierUicCompanyCode.valueChanges.subscribe(value => {
                lastCarrier.setValue(value);
            });
        }
    }

    initAvailableWagonTypes(): void {
        const w1: WagonType = { code: 'Dienstwagen' };
        this.availableWagonModels.push(w1);
        const w2: WagonType = { code: 'Eaaos' };
        this.availableWagonModels.push(w2);
        const w3: WagonType = { code: 'Eacs' };
        this.availableWagonModels.push(w3);
        const w4: WagonType = { code: 'Ealnos' };
        this.availableWagonModels.push(w4);
        const w5: WagonType = { code: 'Ealos' };
        this.availableWagonModels.push(w5);
        const w6: WagonType = { code: 'Ealos-t' };
        this.availableWagonModels.push(w6);
        const w7: WagonType = { code: 'Ealos-x' };
        this.availableWagonModels.push(w7);
        const w8: WagonType = { code: 'Eamo' };
        this.availableWagonModels.push(w8);
        const w9: WagonType = { code: 'Eamos' };
        this.availableWagonModels.push(w9);
        const w10: WagonType = { code: 'Eaos' };
        this.availableWagonModels.push(w10);
        const w11: WagonType = { code: 'Eao' };
        this.availableWagonModels.push(w11);
    }

    ngOnInit(): void {
        this.initAvailableWagonTypes();
        this.trainorderService.getAllWagonTypes().subscribe({
            next: (result: WagonCodes) => {
                if (result && result.length > 0) {
                    this.availableWagonModels = [];
                    for (let s of result) {
                        const wagonModel: WagonType = {
                            code: s
                        }
                        this.availableWagonModels.push(wagonModel);
                    }
                }
            },
            error: (err) => {
                console.error(err);
            }
        });
        this.newOrderTemplateForm.valueChanges.subscribe(_ => {
            document.querySelectorAll<HTMLElement>('.tabs-item').forEach(el => {
                this.setTabItemsValid(el);
            });
        });

        this.subscription.add(this.dangerousCargoInputChange.pipe(debounceTime(500)).subscribe((input) => {
            this.getDangerousCargoInfoAutocomplete(input);
        }));

        this.trainorderService.getDangerousGoodsClasses().subscribe(result => this.dangerousGoodsClasses = result);

        this.changeTab(0);
        this.changeTabTitle('1. ' + this.translation.instant('Order-templates-component.New-order-template.Shipping-header'));

        this.subscription.add(
            this.ordererSgvInputChange.pipe(debounceTime(500)).subscribe((input) => {
                this.getSgvAutocompleteSuggestions(input, 'orderer');
            })
        );

        this.subscription.add(
            this.senderSgvInputChange.pipe(debounceTime(500)).subscribe((input) => {
                this.getSgvAutocompleteSuggestions(input, 'sender');
            })
        );

        this.subscription.add(
            this.receiverSgvInputChange.pipe(debounceTime(500)).subscribe((input) => {
                this.getSgvAutocompleteSuggestions(input, 'receiver');
            })
        );

        this.subscription.add(
            this.loaderSgvInputChange.pipe(debounceTime(500)).subscribe((input) => {
                this.getSgvAutocompleteSuggestions(input, 'loader');
            })
        );

        this.subscription.add(
            this.unloaderSgvInputChange.pipe(debounceTime(500)).subscribe((input) => {
                this.getSgvAutocompleteSuggestions(input, 'unloader');
            })
        );

        this.subscription.add(
            this.startStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
                this.getStationAutocompleteSuggestions(input, StationTypes.START);
            })
        );

        this.subscription.add(
            this.endStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
                this.getStationAutocompleteSuggestions(input, StationTypes.END);
            })
        );

        this.subscription.add(
            this.borderStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
                this.getBorderAutocompleteSuggestions(input);
            })
        );

        this.trainorderService.getSuppliers().subscribe(result => this.suppliers = result);
        this.trainorderService.getMarketSegments().subscribe(result => this.marketSegments = result);

        this.fetchWorkingDirections();
        this.fetchCommercialServices();
        this.fetchTomGroups();
        this.loadOrderTemplate();

        this.resultRoutes = [];
        this.resultRoutes.push(this.emptyResultRoute(0));
        this.resultRoutes.push(this.emptyResultRoute(1));

        this.subscription.add(this.cargoInputChange.pipe(debounceTime(500)).subscribe((input) => {
            this.getCargoInfoAutocomplete(input);
            this.getDangerousCargoInfoAutocomplete(input);
        }));

        this.newOrderTemplateForm.get('trainParamSelection')?.valueChanges.subscribe((viewState: ViewState) => {
            this.viewState = viewState;
        });

        this.addCargoData_2();
        this.orderTemplate = {
            cargo: [],
            orderer: {
                name: '',
                partnerId: '',
                sgvId: ''
            },
            customerLanguage: '',
            sender: {
                name: '',
                partnerId: '',
                sgvId: ''
            },
            sendingStation: {
                name: '',
                objectKeyAlpha: '',
                objectKeySequence: 0,
            },
            wagonStoringPositionSender: {
                name: '',
                objectKeyAlpha: '',
                objectKeySequence: 0,
            },
            firstCarrier: {
                name: '',
                uicCompanyCode: ''
            },
            receiver: {
                name: '',
                partnerId: '',
                sgvId: ''
            },
            receivingStation: {
                name: '',
                objectKeyAlpha: '',
                objectKeySequence: 0
            },
            wagonStoringPositionReceiver: {
                name: '',
                objectKeyAlpha: '',
                objectKeySequence: 0
            },
            lastCarrier: {
                name: '',
                uicCompanyCode: ''
            },
            mainCarrier: {
                name: '',
                uicCompanyCode: ''
            },
            marketSegmentCode: '',
            marketSegmentName: '',
            trainType: ''

        }
        this.addValidatorsForGrossWeight();

        this.cd.detectChanges();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private fetchTomGroups(): void {
        this.trainorderService.getTomGroups().subscribe({
            next: ( (result: TomGroupsResponse) => {
                this.tomGroups = result
            }),
            error: (error => {
                console.error('Failed to fetch data: ', error);
            })
        });
    }

    private fetchCommercialServices(): void {
        this.trainorderService.getCommercialServices().subscribe({
            next: ( (result: CommercialServiceResponse) => {
                this.commercialServices = result ? result : []
            }),
            error: (error => {
                console.error('Failed to fetch data: ', error);
            })
        });
    }

    private fetchWorkingDirections(): void {
        this.trainorderService.getWorkingDirections().subscribe({
            next: ( (result: WorkingDirectionsResponse) => {
                this.workingDirections = result ? result : []
            }),
            error: (error => {
              console.error('Failed to fetch data: ', error);
            })
        });
    }

    isFormValid(): boolean {
        return this.shippingGroup.valid &&
               this.receivingGroup.valid &&
               this.miscGroup.valid &&
               this.transportRouteGroup.valid &&
               this.checkTrainParameterFields();
    }

    /**
     *  Gets cargo suggestions list for autocomplete
     * @param input template element
     */

    getCargoInfoAutocomplete(input: any): void {
        if (input.length >= 3 && !this.nhmCodeAutocomplete.find((elem) => elem.nhmCode === input)) {
            this.trainorderService.getCargoInfo(input).then((result: ApiGoodResponse) => {
                // Take only 30 answers that fit (array may be 1000+ in length), otherwise it takes a lot of resources to build these elements
                this.nhmCodeAutocomplete = result.slice(0, 30).sort((a, b) => (a.nhmCode > b.nhmCode ? 1 : -1));
            });
        }
    }

    /**
     * Gets dangerous cargo suggestions list for autocomplete
     * @param input template element
     */

    getDangerousCargoInfoAutocomplete(input: any): void {
        if (input.length >= 3 && !this.dangerousGoodsAutocomplete.find((elem) => elem.unCode === input))
            // TODO: add description in the input as well
            this.trainorderService.getDangerousCargoInfo(input).then((result: ApiDangerousGoodResponse) => {
                // Take only 30 answers that fit (array may be 1000+ in length), otherwise it takes a lot of resources to build these elements
                this.dangerousGoodsAutocomplete = result.slice(0, 30).sort((a, b) => (a.unCode > b.unCode ? 1 : -1));
            });
    }

    checkTrainParameterFields(): boolean {
        if (this.viewState === ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH) {
            return this.checkGrossWeightAndTrainLengthFields();
        } else {
            return this.checkNettoWeightAndWagonAmountFields();
        }
    }

    checkGrossWeightAndTrainLengthFields(): boolean {
        let trainFields: boolean = false;
        // check train fields
        const grossWeightFormField = this.trainDataGroup.get('grossWeight');
        if (!grossWeightFormField) {
            console.error('Failed to find control: grossWeight');
        }
        const trainLengthFormField = this.trainDataGroup.get('trainLength');
        if (!trainLengthFormField) {
            console.error('Failed to find control: trainLength');
        }
        const nhmCodeFormField = this.trainDataGroup.get('nhmCode');
        if (!nhmCodeFormField) {
            console.error('Failed to find control: nhmCode');
        }
        if (grossWeightFormField && trainLengthFormField && nhmCodeFormField) {
            trainFields = grossWeightFormField.valid && trainLengthFormField.valid && nhmCodeFormField.valid;
            if (!trainFields) {
                return trainFields;
            }
        }
        // check cargo fields
        if (this.trainDataGroupArray_1.length > 0) {
            let index = 0;
            for (let control of this.trainDataGroupArray_1.controls) {
                const cargoNhmCodeControl = this.trainDataGroupArray_1.controls[index].get('cargoNhmCode');
                if (!cargoNhmCodeControl) {
                    console.error('Failed to find control: cargoNhmCode');
                }
                const cargoWagonAmountControl = this.trainDataGroupArray_1.controls[index].get('cargoWagonAmount');
                if (!cargoWagonAmountControl) {
                    console.error('Failed to find control: cargoWagonAmount');
                }
                if (cargoNhmCodeControl && cargoWagonAmountControl) {
                    if (!cargoNhmCodeControl.valid || !cargoWagonAmountControl.valid) {
                        return false;
                    }
                }
                const cargoWagonTypeControl = this.trainDataGroupArray_1.controls[index].get('cargoWagonType');
                if (!cargoWagonTypeControl) {
                    console.error('Failed to find control: cargoWagonType');
                } else {
                    if (cargoWagonTypeControl.value && cargoWagonTypeControl.value.length > 0) {
                        let found = false;
                        for (let a of this.availableWagonModels) {
                                if (a.code === cargoWagonTypeControl.value) {
                                    found = true;
                                }
                        }
                        if (!found) {
                            return false;
                        }
                    }
                }
                index++;
            }
        }
        return true;
    }

    checkNettoWeightAndWagonAmountFields(): boolean {
        let index = 0;
        for (let control of this.trainDataGroupArray_2.controls) {
            const cargoNhmCodeControl =  this.trainDataGroupArray_2.controls[index].get('cargoNhmCode');
            if (!cargoNhmCodeControl) {
                console.error('Failed to find control: cargoNhmCode');
            }
            const cargoNetWeightControl =  this.trainDataGroupArray_2.controls[index].get('cargoNetWeight');
            if (!cargoNetWeightControl) {
                console.error('Failed to find control: cargoNetWeight');
            }
            const cargoWagonAmountControl =  this.trainDataGroupArray_2.controls[index].get('cargoWagonAmount');
            if (!cargoWagonAmountControl) {
                console.error('Failed to find control: cargoWagonAmount');
            }

            if (cargoNhmCodeControl && cargoWagonAmountControl && cargoNetWeightControl) {
                if (!cargoNhmCodeControl.valid || !cargoWagonAmountControl.valid || !cargoNetWeightControl.valid) {
                    return false;
                }
            }
            const cargoWagonTypeControl = this.trainDataGroupArray_2.controls[index].get('cargoWagonType');
            if (!cargoWagonTypeControl) {
                console.error('Failed to find control: cargoWagonType');
            } else if (cargoWagonTypeControl.value && cargoWagonTypeControl.value.length > 0) {
                let found = false;
                for (let a of this.availableWagonModels) {
                    if (a.code === cargoWagonTypeControl.value) {
                        found = true;
                    }
                }
                if (!found) {
                return false;
                }
            }
            index++;
        }
        return true;
    }

    cargoWagonTypeIsTouched(idx: number): boolean {
        let control = undefined;
        if (this.viewState === ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH) {
            control = this.trainDataGroupArray_1.controls[idx]?.get('cargoWagonType');
        } else {
            control = this.trainDataGroupArray_2.controls[idx]?.get('cargoWagonType');
        }
        if (!control) {
            console.error('Failed to find field: cargoWagonType');
            return false;
        }
        return control.touched;
    }

    cargoWagonTypeIsInvalidBrutto(idx: number): boolean {
        // if (this.cargoWagonTypeIsEmpty(idx)) {
        //     return true;
        // }
        if (this.cargoWagonTypeHasNoData(idx)) {
            return true;
        }
        return false;
    }

    cargoWagonTypeIsInvalidNetto(idx: number): boolean {
        let control = this.trainDataGroupArray_2.controls[idx]?.get('cargoWagonType');
        if (!control) {
            console.error('Failed to find field: cargoWagonType');
            return false;
        } else if (control.value.length > 0) {
            let found = false;
            for (let a of this.wagonTypeAutocomplete) {
                if (a.code === control.value) {
                    found = true;
                }
            }
            if (!found) {
                return true;
            }
        }
        return false;
    }

    cargoWagonTypeHasNoData(idx: number): boolean {
        if (this.cargoWagonTypeIsEmpty(idx)) {
            return false;
        }
        let control = undefined;
        if (this.viewState === ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH) {
            control = this.trainDataGroupArray_1.controls[idx]?.get('cargoWagonType');
        } else {
            control = this.trainDataGroupArray_2.controls[idx]?.get('cargoWagonType');
        }
        if (!control) {
            console.error('Failed to find field: cargoWagonType');
        } else {
            if (control.touched && control.value.length < 3 && control.value.length > 0) {
                return true;
            }
            return control.hasError('nodata');
        }
        return false;
    }

    cargoWagonTypeIsEmpty(idx: number): boolean {
        let control = undefined;
        if (this.viewState === ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH) {
            control = this.trainDataGroupArray_1.controls[idx]?.get('cargoWagonType');
        } else {
            control = this.trainDataGroupArray_2.controls[idx]?.get('cargoWagonType');
        }
        if (!control) {
            console.error('Failed to find field: cargoWagonType');
        } else {
            if (!control.value || control.value.length === 0) {
                if (control.touched) {
                    // return true;
                    return false; // <-- TOK-1008, keine Validierung in Vorlagen
                }
            }
        }
        return false;
    }

    emptyResultRoute(idx: number): ResultRoute {
        return {
            idx: idx,
            startStation: '',
            sendingStationKeyAlpha: '',
            sendingStationKeySequence: '',
            endStation: '',
            receivingStationKeyAlpha: '',
            receivingStationKeySequence: '',
            carrierCode: '',
            carrierName: ''
        };
    }

    loadOrderTemplate() {
        if (this.editMode) {
            this.trainorderService.getOrderTemplate(this.editTemplateId).subscribe(resp => {
                this.orderTemplate = resp.orderTemplate;
                this.fillForm();
            }, (error: any) => {
                this.errorHandling(error);
            });
        }
    }

    private fillForm() {
        // ********* SHIPPING GROUP
        // Orderer SGV and PartnerId
        this.shippingGroup.get("ordererSgvId")?.setValue(this.customerSgvNamePipe.transform({
            name: this.orderTemplate.orderer.name,
            sgvNumber: this.orderTemplate.orderer.sgvId
        }));
        this.selectSgvId(null, this.orderTemplate.orderer.sgvId, "ordererSgvId");
        // Sender SGV and PartnerId
        this.shippingGroup.get("senderSgvId")?.setValue(this.customerSgvNamePipe.transform({
            name: this.orderTemplate.sender.name,
            sgvNumber: this.orderTemplate.sender.sgvId
        }));
        this.selectSgvId(null, this.orderTemplate.sender.sgvId, "senderSgvId");
        // Loader SGV and PartnerId
        if (this.orderTemplate.loader?.name) {
            this.shippingGroup.get("loaderSgvId")?.setValue(this.customerSgvNamePipe.transform({
                name: this.orderTemplate.loader.name,
                sgvNumber: this.orderTemplate.loader.sgvId
            }));
            this.selectSgvId(null, this.orderTemplate.loader.sgvId, "loaderSgvId");
        }

        // customer Language
        this.shippingGroup.get("customerLanguage")?.setValue(this.orderTemplate.customerLanguage);

        // Sending Station
        this.shippingGroup.get("newTemplateSendingStation")?.setValue(this.orderTemplate.sendingStation.name);
        this.newOrderTemplateForm.controls.newTemplateSendingStationKeyAlpha.setValue(this.orderTemplate.sendingStation.objectKeyAlpha);
        this.newOrderTemplateForm.controls.newTemplateSendingStationKeySequence.setValue(this.orderTemplate.sendingStation.objectKeySequence);

        // GWP Sender
        this.trainorderService.getProductionLocations(
            this.orderTemplate.sendingStation.objectKeyAlpha,
            this.orderTemplate.sendingStation.objectKeySequence,
            'PRDV'
        ).subscribe((result: ProductionLocationResponse) => {
            this.wagonStoringPositionSenderAutocomplete = result;
            this.shippingGroup.get("wagonStoringPositionSender")?.setValue(this.orderTemplate.wagonStoringPositionSender?.name);
            this.newOrderTemplateForm.controls.wagonStoringPositionSenderKeyAlpha.setValue(this.orderTemplate.wagonStoringPositionSender?.objectKeyAlpha);
            this.newOrderTemplateForm.controls.wagonStoringPositionSenderKeySequence.setValue(this.orderTemplate.wagonStoringPositionSender?.objectKeySequence);
        }, (error: any) => {
            this.errorHandling(error);
        });

        // First Carrier
        this.shippingGroup.get("firstCarrierUicCompanyCode")?.setValue(this.orderTemplate.firstCarrier.uicCompanyCode);
        // Work direction send
        this.shippingGroup.get("workDirectionSend")?.setValue(this.orderTemplate.workDirectionSend);

        // ********* RECEIVING GROUP
        // Receiver SGV and PartnerId
        this.receivingGroup.get("receiverSgvId")?.setValue(this.customerSgvNamePipe.transform({
            name: this.orderTemplate.receiver.name,
            sgvNumber: this.orderTemplate.receiver.sgvId
        }));
        this.selectSgvId(null, this.orderTemplate.receiver.sgvId, "receiverSgvId");

        // Receiving Station
        this.receivingGroup.get("newTemplateReceivingStation")?.setValue(this.orderTemplate.receivingStation.name);
        this.newOrderTemplateForm.controls.newTemplateReceivingStationKeyAlpha.setValue(this.orderTemplate.receivingStation.objectKeyAlpha);
        this.newOrderTemplateForm.controls.newTemplateReceivingStationKeySequence.setValue(this.orderTemplate.receivingStation.objectKeySequence);

        // GWP Receiver
        this.trainorderService.getProductionLocations(
            this.orderTemplate.receivingStation.objectKeyAlpha,
            this.orderTemplate.receivingStation.objectKeySequence,
            'PRDV'
        ).subscribe((result: ProductionLocationResponse) => {
            this.wagonStoringPositionReceiverAutocomplete = result;
            this.receivingGroup.get("wagonStoringPositionReceiver")?.setValue(this.orderTemplate.wagonStoringPositionReceiver?.name);
            this.newOrderTemplateForm.controls.wagonStoringPositionReceiverKeyAlpha.setValue(this.orderTemplate.wagonStoringPositionReceiver?.objectKeyAlpha);
            this.newOrderTemplateForm.controls.wagonStoringPositionReceiverKeySequence.setValue(this.orderTemplate.wagonStoringPositionReceiver?.objectKeySequence);
        }, (error: any) => {
            this.errorHandling(error);
        });

        // Unloader SGV and PartnerId
        if (this.orderTemplate.unloader && !!this.orderTemplate.unloader?.name && !!this.orderTemplate.unloader.sgvId) {
            this.receivingGroup.get("unloaderSgvId")?.setValue(this.customerSgvNamePipe.transform({
                name: this.orderTemplate.unloader.name,
                sgvNumber: this.orderTemplate.unloader.sgvId
            }));
            this.selectSgvId(null, this.orderTemplate.unloader.sgvId, "unloaderSgvId");
        }

        // Last Carrier
        this.receivingGroup.get("lastCarrierUicCompanyCode")?.setValue(this.orderTemplate.lastCarrier.uicCompanyCode);
        // Work direction receive
        this.receivingGroup.get("workDirectionReceive")?.setValue(this.orderTemplate.workDirectionReceive);


        // Main Carrier
        this.miscGroup.get("mainCarrierUicCompanyCode")?.setValue(this.orderTemplate.mainCarrier.uicCompanyCode);

        // Market-Segment
        this.miscGroup.get("marketSegmentCode")?.setValue(this.orderTemplate.marketSegmentCode);


        this.miscGroup.get("tomGroup")?.setValue(this.orderTemplate.tomGroup);
        this.miscGroup.get("operationalId")?.setValue(this.orderTemplate.operationalId);
        this.miscGroup.get("templateName")?.setValue(this.orderTemplate.name);
        if (this.orderTemplate.commercialService) this.miscGroup.get("commercialService")?.setValue(this.orderTemplate.commercialService);
        this.miscGroup.get("validFrom")?.setValue(this.orderTemplate.validFrom);
        this.miscGroup.get("validUntil")?.setValue(this.orderTemplate.validUntil);
        this.focusFieldById("valid-from");
        this.focusFieldById("valid-until");

        // ********* TRANSPORT GROUP
        if (this.orderTemplate.route) {
            if (this.orderTemplate.route.length >= 2) {
                if (this.orderTemplate.route[0].receivingStation.name) {
                    this.transportRouteGroup.get('firstEndStation')?.setValue(this.orderTemplate.route[0].receivingStation.name);
                    this.resultRoutes[0].startStation = this.orderTemplate.route[0].sendingStation.name;
                    this.resultRoutes[0].sendingStationKeyAlpha = this.orderTemplate.route[0].sendingStation.objectKeyAlpha;
                    this.resultRoutes[0].sendingStationKeySequence = String(this.orderTemplate.route[0].sendingStation.objectKeySequence);
                    this.resultRoutes[0].endStation = this.orderTemplate.route[0].receivingStation.name;
                    this.resultRoutes[0].receivingStationKeyAlpha = this.orderTemplate.route[0].receivingStation.objectKeyAlpha;
                    this.resultRoutes[0].receivingStationKeySequence = String(this.orderTemplate.route[0].receivingStation.objectKeySequence);
                    this.resultRoutes[0].carrierCode = this.orderTemplate.route[0].carrier.uicCompanyCode;
                    this.resultRoutes[0].carrierName = this.orderTemplate.route[0].carrier.name;
                }
                if (this.orderTemplate.route[this.orderTemplate.route.length-1].sendingStation.name) {
                    this.transportRouteGroup.get('lastStartStation')?.setValue(this.orderTemplate.route[this.orderTemplate.route.length-1].sendingStation.name);
                    this.resultRoutes[1].startStation = this.orderTemplate.route[this.orderTemplate.route.length-1].sendingStation.name;
                    this.resultRoutes[1].sendingStationKeyAlpha = this.orderTemplate.route[this.orderTemplate.route.length-1].sendingStation.objectKeyAlpha;
                    this.resultRoutes[1].sendingStationKeySequence = String(this.orderTemplate.route[this.orderTemplate.route.length-1].sendingStation.objectKeySequence);
                    this.resultRoutes[1].endStation = this.orderTemplate.route[this.orderTemplate.route.length-1].receivingStation.name;
                    this.resultRoutes[1].receivingStationKeyAlpha = this.orderTemplate.route[this.orderTemplate.route.length-1].receivingStation.objectKeyAlpha;
                    this.resultRoutes[1].receivingStationKeySequence = String(this.orderTemplate.route[this.orderTemplate.route.length-1].receivingStation.objectKeySequence);
                    this.resultRoutes[1].carrierCode = this.orderTemplate.route[this.orderTemplate.route.length-1].carrier.uicCompanyCode;
                    this.resultRoutes[1].carrierName = this.orderTemplate.route[this.orderTemplate.route.length-1].carrier.name;
                }
                if (this.orderTemplate.route.length > 2) {
                    let orderTemplateRouteIdx = 0;
                    for (let orderTemplateRoute of this.orderTemplate.route) {
                        if ( (orderTemplateRouteIdx > 0) && (orderTemplateRouteIdx < this.orderTemplate.route.length -1)) {
                            this.getAdditionalRoutes().push(this.newAdditionalRoute(orderTemplateRoute.sendingStation.name, orderTemplateRoute.receivingStation.name, orderTemplateRoute.carrier.uicCompanyCode));
                            const resultRoute: ResultRoute = {
                                idx: this.resultRoutes.length,
                                startStation: orderTemplateRoute.sendingStation.name,
                                sendingStationKeyAlpha: orderTemplateRoute.sendingStation.objectKeyAlpha,
                                sendingStationKeySequence: String(orderTemplateRoute.sendingStation.objectKeySequence),
                                endStation: orderTemplateRoute.receivingStation.name,
                                receivingStationKeyAlpha: orderTemplateRoute.receivingStation.objectKeyAlpha,
                                receivingStationKeySequence: String(orderTemplateRoute.receivingStation.objectKeySequence),
                                carrierCode: orderTemplateRoute.carrier.uicCompanyCode,
                                carrierName: orderTemplateRoute.carrier.name
                            }
                            this.addResultRoute(resultRoute);
                        }
                        orderTemplateRouteIdx++;
                    }
                }
            }
        }

        // Border Station
        if (this.orderTemplate.borderStation && this.orderTemplate.borderStation.length > 0) {
            this.trainorderService.getBorders(this.orderTemplate.borderStation[0]).subscribe((result: BorderResponse) => {
                // only one should be returned
                // this.borderStationAutoComplete = result.borders;
                if (result.length > 0) {
                    this.selectedBorder = result[0];
                    this.miscGroup.get("borderStation")?.setValue(this.borderCodeNamePipe.transform(result[0]));
                }
            }, (error: any) => {
                this.errorHandling(error);
            });
        }

        // Zugparameter
        const cargo: Cargo[] = this.orderTemplate.cargo;
        this.setSetGrossWeightAndTrainLengthValues(cargo);
    }

    setNettoWeightAndWagonAmount(cargo: Cargo[]): void {
        this.viewState = ViewState.NET_WEIGHT_AND_WAGGON_AMOUNT;
        this.newOrderTemplateForm.get('trainParamSelection')?.setValue(this.viewState);
        this.trainDataGroupArray_2.controls[0].get('cargoBzaNumber')?.setValue(cargo[0].nhmCode);
        this.trainDataGroupArray_2.controls[0].get('cargoNetWeight')?.setValue(cargo[0].netWeight);
        this.trainDataGroupArray_2.controls[0].get('cargoNhmCode')?.setValue(cargo[0].numberOfWagons);
        this.trainDataGroupArray_2.controls[0].get('cargoUnCode')?.setValue(cargo[0].wagonType);
        this.trainDataGroupArray_2.controls[0].get('cargoWagonAmount')?.setValue(cargo[0].numberOfWagons);
        this.trainDataGroupArray_2.controls[0].get('cargoWagonType')?.setValue(cargo[0].unCode);
        this.trainDataGroupArray_2.controls[0].get('dangerousGoodClass')?.setValue(cargo[0].dangerousGoodClass);

        for (let i = 1; i < cargo.length; i++) {
            this.addCargoData_2(cargo[i].nhmCode, String(cargo[i].netWeight), String(cargo[i].numberOfWagons), String(cargo[i].wagonType), String(cargo[0].bzaNumber), cargo[0].unCode, cargo[0].dangerousGoodClass);
        }
    }

    setSetGrossWeightAndTrainLengthValues(cargo: Cargo[]): void {
        this.viewState = ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH;
        this.newOrderTemplateForm.get('trainParamSelection')?.setValue(this.viewState);

        const grossWeight = this.trainDataGroup.get('grossWeight');
        if (!grossWeight) {
            console.error('Failed to find field: grossWeight');
        } else {
            if (cargo && cargo[0] && cargo[0].weight) {
                grossWeight.setValue(cargo[0].weight);
            } else {
                grossWeight.setValue(0);
            }
        }

        const trainLength = this.trainDataGroup.get('trainLength');
        if (!trainLength) {
            console.error('Failed to find field: trainLength');
        } else {
            trainLength.setValue(cargo[0].length);
        }

        const vmax = this.trainDataGroup.get('vmax');
        if (!vmax) {
            console.error('Failed to find field: vmax');
        } else {
            vmax.setValue(cargo[0].maximumSpeed);
        }

        const nhmCode = this.trainDataGroup.get('nhmCode');
        if (!nhmCode) {
            console.error('Failed to find field: nhmCode');
        } else {
            nhmCode.setValue(cargo[0].nhmCode);
        }

        const dangerousGoodClass = this.trainDataGroup.get('dangerousGoodClass');
        if (!dangerousGoodClass) {
            console.error('Failed to find field: dangerousGoodClass');
        } else {
            dangerousGoodClass.setValue(cargo[0].dangerousGoodClass);
        }

        const bzaNr = this.trainDataGroup.get('bzaNr');
        if (!bzaNr) {
            console.error('Failed to find field: bzaNr');
        } else {
            bzaNr.setValue(cargo[0].bzaNumber);
        }

        const p2 = this.trainDataGroup.get('p2');
        if (!p2) {
            console.error('Failed to find field: p2');
        } else {
            p2.setValue(cargo[0].intermodalProfileP2);
        }

        const c2 = this.trainDataGroup.get('c2');
        if (!c2) {
            console.error('Failed to find field: c2');
        } else {
            c2.setValue(cargo[0].intermodalProfileC2);
        }

        const p3 = this.trainDataGroup.get('p3');
        if (!p3) {
            console.error('Failed to find field: p3');
        } else {
            p3.setValue(cargo[0].intermodalProfileP3);
        }

        const c3 = this.trainDataGroup.get('c3');
        if (!c3) {
            console.error('Failed to find field: c3');
        } else {
            c3.setValue(cargo[0].intermodalProfileC3);
        }

        if (cargo[0] && cargo[0].items && cargo[0].items.length > 0) {
            for (let i = 0; i < cargo[0].items.length; i++) {
                const detail: CargoDetail = cargo[0].items[i];
                if (detail) {
                    this.addCargoData_1(detail.nhmCode, String(detail.numberOfWagons), detail.wagonType, detail.unCode);
                }
            }
        }
    }

    newAdditionalRoute(startStation?: string, endStation?: string, carrierUicCompanyCode?: string): FormGroup {
        const formGroup = new FormGroup({
            startStation: new FormControl(startStation, [Validators.required]),
            endStation: new FormControl(endStation, [Validators.required]),
            carrierUicCompanyCode: new FormControl(carrierUicCompanyCode, [Validators.required])
        });
        return formGroup;
    }

    addTransportGroupData(): void {
        this.getAdditionalRoutes().push(this.newAdditionalRoute());
        this.addResultRoute();
    }

    private focusFieldById(fieldId: string) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('focused');
        }
    }

    private addResultRoute(resultRoute?: ResultRoute): void {
        if (resultRoute) {
            this.resultRoutes.push(resultRoute);
        } else {
            this.resultRoutes.push(this.emptyResultRoute(this.resultRoutes.length));
        }
    }

    deleteTransportGroupData(i: number): void {
        this.deleteResultRoute(i+2);
        this.getAdditionalRoutes().removeAt(i);
    }

    private deleteResultRoute(idx: number): void {
        const temp: ResultRoute[] = [];
        for (let rr of this.resultRoutes) {
            if (rr.idx !== idx) {
                temp.push(rr);
            }
        }
        this.resultRoutes = temp;
    }

    public openConfirmationModal(): void {
        const data: DialogPosition = { top: '30vh' };
        let config: MatDialogConfig = { position: data, width: '400px', height: '250px' };
        this.openDialog(ConfirmationComponent, config);
        this.subject.subscribe(decision => {
          if (decision == true) {
            this.dialogRef.close();
          }
        });
      }

    public openDialog<T>(comp: new (...args: any[]) => T, config: any): void {
        let dialogRef: MatDialogRef<T>;
        dialogRef = this.dialog.open(comp, config);
        dialogRef.afterClosed().subscribe(decision => {
            this.subject.next(decision);
        });
    }

    getCarrierName(code: string): string {
        const supplier = this.suppliers.find(supplier => { return supplier.uicCompanyCode === code; })
        if (supplier) {
            return supplier.name;
        }
        return '';
    }

    private createOrderTemplateRoute(route: ResultRoute): OrderTemplateRoute {
        const sendingStation: CommercialLocation = {
            name: route.startStation,
            objectKeyAlpha: route.sendingStationKeyAlpha,
            objectKeySequence: Number(route.sendingStationKeySequence)
        };
        const receivingStation: CommercialLocation = {
            name: route.endStation,
            objectKeyAlpha: route.receivingStationKeyAlpha,
            objectKeySequence: Number(route.receivingStationKeySequence)
        };
        const carrier: OrderTemplateCarrier = {
            name: route.carrierName,
            uicCompanyCode: route.carrierCode
        };
        const orderTemplateRoute: OrderTemplateRoute = {
            sendingStation: sendingStation,
            receivingStation: receivingStation,
            carrier: carrier
        }
        return orderTemplateRoute;
    }

    createOrderTemplateRoutes(resultRoutes: ResultRoute[]): OrderTemplateRoute[] {
        const orderTemplateRoutes: OrderTemplateRoute[] = [];
        let lastRouteSegment = undefined;
        let idx = 0;
        for (let route of resultRoutes) {
            if (idx === 1) {
                lastRouteSegment = this.createOrderTemplateRoute(route);
            } else {
                orderTemplateRoutes.push(this.createOrderTemplateRoute(route));
            }
            idx++;
        }
        if (lastRouteSegment) {
            orderTemplateRoutes.push(lastRouteSegment);
        }
        return orderTemplateRoutes;
    }

    createCargoArrayByTrainLength(): Cargo[] {
        const cargoArray: Cargo[] = [];
        const vmax = this.trainDataGroup.get('vmax')?.value;
        const nhmCode = this.trainDataGroup.get('nhmCode')?.value;
        const grossWeight = this.trainDataGroup.get('grossWeight')?.value;
        const trainLength = this.trainDataGroup.get('trainLength')?.value;
        const dangerousGoodClass = this.trainDataGroup.get('dangerousGoodClass')?.value;
        const bzaNr = this.trainDataGroup.get('bzaNr')?.value;
        const p2 = this.trainDataGroup.get('p2')?.value;
        const c2 = this.trainDataGroup.get('c2')?.value;
        const p3 = this.trainDataGroup.get('p3')?.value;
        const c3 = this.trainDataGroup.get('c3')?.value;

        const cargo: Cargo = {
            weight: grossWeight,
            length: trainLength,
            maximumSpeed: vmax,
            nhmCode: nhmCode,
            nhmCodeText: '',
            dangerousGoodClass: dangerousGoodClass,
            bzaNumber: bzaNr,
            numberOfWagons: 0,
            netWeight: 0,
            intermodalProfileP2: p2,
            intermodalProfileP3: p3,
            intermodalProfileC2: c2,
            intermodalProfileC3: c3,
            items: [],
        }

        if (this.trainDataGroupArray_1 && this.trainDataGroupArray_1.length > 0) {
            for (let formGroup of this.trainDataGroupArray_1.controls) {
                const cargoNhmCode = formGroup.get('cargoNhmCode')?.value;
                const cargoWagonAmount = formGroup.get('cargoWagonAmount')?.value;
                const cargoWagonType = formGroup.get('cargoWagonType')?.value;
                const cargoUnCode = formGroup.get('cargoUnCode')?.value;
                const detail: CargoDetail = {
                    nhmCode: cargoNhmCode,
                    nhmCodeText: '',
                    unCode: cargoUnCode,
                    wagonType: cargoWagonType,
                    numberOfWagons: cargoWagonAmount
                }
                cargo.items.push(detail);
            }
        }
        cargoArray.push(cargo);
        return cargoArray;
    }

    createCargoArrayByWagonAmount(): Cargo[] {
        const cargoArray: Cargo[] = [];

        if (this.trainDataGroupArray_2 && this.trainDataGroupArray_2.length > 0) {
            for (let formGroup of this.trainDataGroupArray_2.controls) {
                const cargo: Cargo = {
                    nhmCode: '',
                    nhmCodeText: '',
                    numberOfWagons: 0,
                    netWeight: 0,
                    maximumSpeed: 0,
                    intermodalProfileP2: 0,
                    intermodalProfileP3: 0,
                    intermodalProfileC2: 0,
                    intermodalProfileC3: 0,
                    items: []
                }
                const cargoNhmCode = formGroup.get('cargoNhmCode')?.value;
                const cargoNetWeight = formGroup.get('cargoNetWeight')?.value;
                const cargoWagonAmount = formGroup.get('cargoWagonAmount')?.value;
                const cargoWagonType = formGroup.get('cargoWagonType')?.value;
                const cargoBzaNumber = formGroup.get('cargoBzaNumber')?.value;
                const cargoUnCode = formGroup.get('cargoUnCode')?.value;
                const dangerousGoodClass = formGroup.get('dangerousGoodClass')?.value;

                cargo.nhmCode = cargoNhmCode;
                cargo.unCode = cargoUnCode;
                cargo.wagonType = cargoWagonType;
                cargo.numberOfWagons = cargoWagonAmount;
                cargo.netWeight = cargoNetWeight;
                cargo.bzaNumber = cargoBzaNumber;
                cargo.dangerousGoodClass = dangerousGoodClass;

                cargoArray.push(cargo);
            }

        }
        return cargoArray;
    }

    sendNewOrderTemplateRequest(): void {
        this.loadingInProgress = true;
        // Zugparameter
        let cargoArray: Cargo[] = [];
        if (this.viewState === ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH) {
            cargoArray = this.createCargoArrayByTrainLength();
        } else {
            cargoArray = this.createCargoArrayByWagonAmount();
        }

        // Sending station
        this.resultRoutes[0].startStation = this.shippingGroup.controls.newTemplateSendingStation.value;
        this.resultRoutes[0].sendingStationKeyAlpha = this.newOrderTemplateForm.controls.newTemplateSendingStationKeyAlpha.value;
        this.resultRoutes[0].sendingStationKeySequence = this.newOrderTemplateForm.controls.newTemplateSendingStationKeySequence.value;
        this.resultRoutes[0].carrierCode = this.transportRouteGroup.get('firstCarrierUicCompanyCode')?.value;
        this.resultRoutes[0].carrierName = this.getCarrierName(this.resultRoutes[0].carrierCode);
        // Receiving station
        this.resultRoutes[1].endStation = this.receivingGroup.controls.newTemplateReceivingStation.value;
        this.resultRoutes[1].receivingStationKeyAlpha = this.newOrderTemplateForm.controls.newTemplateReceivingStationKeyAlpha.value;
        this.resultRoutes[1].receivingStationKeySequence = this.newOrderTemplateForm.controls.newTemplateReceivingStationKeySequence.value;
        this.resultRoutes[1].carrierCode = this.transportRouteGroup.get('lastCarrierUicCompanyCode')?.value;
        this.resultRoutes[1].carrierName = this.getCarrierName(this.resultRoutes[1].carrierCode);
        const orderTemplateRoutes: OrderTemplateRoute[] = this.createOrderTemplateRoutes(this.resultRoutes);
        const ordererSgvAndName = this.customerSgvNamePipe.transform(this.shippingGroup.controls.ordererSgvId.value) as Customer;
        const senderSgvAndName = this.customerSgvNamePipe.transform(this.shippingGroup.controls.senderSgvId.value) as Customer;
        const loaderSgvAndName = this.customerSgvNamePipe.transform(this.shippingGroup.controls.loaderSgvId.value) as Customer;
        const receiverSgvAndName = this.customerSgvNamePipe.transform(this.receivingGroup.controls.receiverSgvId.value) as Customer;
        const unloaderSgvAndName = this.customerSgvNamePipe.transform(this.receivingGroup.controls.unloaderSgvId.value) as Customer;

        let newOrderTemplateRequest: OrderTemplateRequest = {
            orderTemplate: {
                templateId: this.editTemplateId,
                name: this.miscGroup.controls.templateName.value,
                cargo: cargoArray,
                orderer: {
                    sgvId: ordererSgvAndName.sgvNumber,
                    name: ordererSgvAndName.name,
                    partnerId: this.shippingGroup.controls.ordererPartnerId.value,
                },
                customerLanguage: this.shippingGroup.controls.customerLanguage.value,
                sender: {
                    sgvId: senderSgvAndName.sgvNumber,
                    name: senderSgvAndName.name,
                    partnerId: this.shippingGroup.controls.senderPartnerId.value,
                },
                sendingStation: {
                    objectKeyAlpha: this.newOrderTemplateForm.controls.newTemplateSendingStationKeyAlpha.value,
                    objectKeySequence: this.newOrderTemplateForm.controls.newTemplateSendingStationKeySequence.value,
                    name: this.shippingGroup.controls.newTemplateSendingStation.value
                },
                wagonStoringPositionSender: {
                    objectKeyAlpha: this.newOrderTemplateForm.controls.wagonStoringPositionSenderKeyAlpha.value,
                    objectKeySequence: this.newOrderTemplateForm.controls.wagonStoringPositionSenderKeySequence.value,
                    name: this.shippingGroup.controls.wagonStoringPositionSender.value
                },
                firstCarrier: {
                    name: this.resultRoutes[0].carrierName,
                    uicCompanyCode: this.resultRoutes[0].carrierCode
                },
                workDirectionSend: this.shippingGroup.controls.workDirectionSend?.value,
                //trainType is allways Special-Train in order-template: Mail Nick Bräuer 27.10.2022 13:19
                //trainType: this.miscGroup.controls.trainType.value,
                trainType: 'SPECIAL_TRAIN',
                receiver: {
                    sgvId: receiverSgvAndName.sgvNumber,
                    name: receiverSgvAndName.name,
                    partnerId: this.receivingGroup.controls.receiverPartnerId.value,
                },
                receivingStation: {
                    objectKeyAlpha: this.newOrderTemplateForm.controls.newTemplateReceivingStationKeyAlpha.value,
                    objectKeySequence: this.newOrderTemplateForm.controls.newTemplateReceivingStationKeySequence.value,
                    name: this.receivingGroup.controls.newTemplateReceivingStation.value
                },
                wagonStoringPositionReceiver: {
                    objectKeyAlpha: this.newOrderTemplateForm.controls.wagonStoringPositionReceiverKeyAlpha.value,
                    objectKeySequence: this.newOrderTemplateForm.controls.wagonStoringPositionReceiverKeySequence.value,
                    name: this.receivingGroup.controls.wagonStoringPositionReceiver.value
                },
                lastCarrier: {
                    name: this.resultRoutes[1].carrierName,
                    uicCompanyCode: this.resultRoutes[1].carrierCode
                },
                workDirectionReceive: this.receivingGroup.controls.workDirectionReceive?.value,
                route: orderTemplateRoutes,
                tomGroup: this.miscGroup.controls.tomGroup.value,
                operationalId: this.miscGroup.controls.operationalId.value,
                validFrom: this.miscGroup.controls.validFrom.value,
                validUntil: this.miscGroup.controls.validUntil.value,
                commercialService: this.miscGroup.controls.commercialService?.value,
                borderStation: this.selectedBorder ? [this.selectedBorder.uicBorderCode] : [],
                mainCarrier: {
                    name: '',
                    uicCompanyCode: this.miscGroup.controls.mainCarrierUicCompanyCode.value,
                },
                marketSegmentName: '',
                marketSegmentCode: this.miscGroup.controls.marketSegmentCode.value
            }
        }

        if (loaderSgvAndName.sgvNumber) {
            newOrderTemplateRequest.orderTemplate.loader = {
                sgvId: loaderSgvAndName.sgvNumber,
                name: loaderSgvAndName.name,
                partnerId: this.shippingGroup.controls.loaderPartnerId.value,
            };
        }

        if (unloaderSgvAndName.sgvNumber) {
            newOrderTemplateRequest.orderTemplate.unloader = {
                sgvId: unloaderSgvAndName.sgvNumber,
                name: unloaderSgvAndName.name,
                partnerId: this.receivingGroup.controls.unloaderPartnerId.value,
            };
        }

        this.saveOrderTemplate(newOrderTemplateRequest);
    }

    private saveOrderTemplate(newOrderTemplateRequest: OrderTemplateRequest) {
        if(this.editMode) {
            this.trainorderService.putOrderTemplate(newOrderTemplateRequest.orderTemplate, this.editTemplateId).subscribe(
                (result => {
                    this.resetCloseAndConfirm(result.orderTemplate.templateId);
                }),
                (error: any) => {
                    this.errorHandling(error);
                }
            );
        } else {
            this.trainorderService.sendNewOrderTemplateRequest(newOrderTemplateRequest).subscribe((response: OrderTemplateResponse) => {
                this.resetCloseAndConfirm(response.orderTemplate.templateId);
            }, (error: any) => {
                this.errorHandling(error);
            });
        }
    }

    resetCloseAndConfirm(templateId: string | undefined): void {
        this.resetForm();
        this.dialogRef.close();
        let confirmation = this.translation.instant('Order-templates-component.Save-confirmation');
        if(templateId) confirmation = confirmation = this.translation.instant('Order-templates-component.Save-confirmation-id', {templateId: templateId});
        this.loadingInProgress = false;
        this.modalWindows.openConfirmationDialog(confirmation, 3);
    }

    resetForm(): void {
        this.newOrderTemplateForm.reset();
        (this.newOrderTemplateForm.controls.shippingGroup as FormGroup).controls.customerLanguage.setValue('Deutsch');
    }

    private errorHandling(response: HttpErrorResponse) {
        console.error(response);
        let message = this.errorProcessing.extractMessage(response);
        console.error(message);
        this.loadingInProgress = false;
        this.modalWindows.openErrorDialog({ apiProblem: response.error });
    }

    nextTab() {
        if (this.currentTab < this.tabs.length - 1) {
            this.currentTab++;
        }

        this.changeTab(this.currentTab);
    }

    prevTab() {
        if (this.currentTab >= 1) {
            this.currentTab--;
        }

        this.changeTab(this.currentTab);
    }
    changeTab(tabNumber: number) {
        const tabName = this.tabs[tabNumber];
        this.currentTab = tabNumber;
        document.querySelectorAll<HTMLElement>('.input-block-complete').forEach(el => {
            if (el.id == tabName) el.style.display = 'grid';
            else el.style.display = 'none';
        });


        let tabTitle = '';
        let counter = 1;
        document.querySelectorAll<HTMLElement>('.tabs-item').forEach(el => {
            if (el.id == tabName + 'Head') {
                el.classList.add('tabs-item-selected');
                tabTitle = counter + '. ' + el.getElementsByTagName('a')[0].innerText;
            } else {
                el.classList.remove('tabs-item-selected');
            }

            counter++;
        });
        this.changeTabTitle(tabTitle);
    }

    private setTabItemsValid(el: HTMLElement) {
        el.classList.remove('tabs-item-valid');
        switch (el.id) {
            case 'shippingTabHead':
                if (this.shippingGroup.valid)
                    el.classList.add('tabs-item-valid');
                break;
            case 'receivingTabHead':
                if (this.receivingGroup.valid)
                    el.classList.add('tabs-item-valid');
                break;
            case 'miscTabHead':
                if (this.miscGroup.valid)
                    el.classList.add('tabs-item-valid');
                break;
            case 'transporterRouteTabHead':
                if (this.transportRouteGroup.valid)
                    el.classList.add('tabs-item-valid');
                break;
            case 'trainDataTabHead':
                if (this.checkTrainParameterFields())
                    el.classList.add('tabs-item-valid');
                break;
        }
    }

    private changeTabTitle(text: string) {
        document.querySelectorAll<HTMLElement>('.tab-title').forEach(el => el.innerText = text);
    }

    getOrdererSgvIdsList(event: any) {
        this.ordererSgvInputChange.next(event.target.value);
    }

    getSenderSgvIdsList(event: any) {
        this.senderSgvInputChange.next(event.target.value);
    }

    getReceiverSgvIdsList(event: any) {
        this.receiverSgvInputChange.next(event.target.value);
    }

    getLoaderSgvIdsList(event: any) {
        this.loaderSgvInputChange.next(event.target.value);
    }

    getUnloaderSgvIdsList(event: any) {
        this.unloaderSgvInputChange.next(event.target.value);
    }

    getBorderStationList(event: any) {
        this.borderStationInputChange.next(event.target.value);
    }

    getBorderAutocompleteSuggestions(input: string) {
        let foundBorder: Border = this.borderStationAutoComplete.find(item => {
            const searchString = '(' + item.uicBorderCode + ')';
            return input.indexOf(searchString) > -1;
        } );
        if (foundBorder) {
            this.selectedBorder = foundBorder;
            return;
        }

        if (input.length > 2) {
            this.trainorderService.getBorders(input).subscribe((result: BorderResponse) => {
                this.borderStationAutoComplete = result;
            }, (error: any) => {
                this.errorHandling(error);
            });
        }
    }

    getSgvAutocompleteSuggestions(input: string, sgvType: string): void {
        let foundCustomer: any = null;
        switch (sgvType) {
            case 'orderer':
                foundCustomer = this.ordererSgvAutoComplete.find(el => input.indexOf(el.name) > 0);
                break;
            case 'sender':
                foundCustomer = this.senderSgvAutoComplete.find(el => input.indexOf(el.name) > 0);
                break;
            case 'receiver':
                foundCustomer = this.receiverSgvAutoComplete.find(el => input.indexOf(el.name) > 0);
                break;
            case 'loader':
                foundCustomer = this.loaderSgvAutoComplete.find(el => input.indexOf(el.name) > 0);
                break;
            case 'unloader':
                foundCustomer = this.unloaderSgvAutoComplete.find(el => input.indexOf(el.name) > 0);
        }

        if (foundCustomer != null) {
            return;
        }

        if (input.length > 2) {
            this.trainorderService.getCustomers(input).subscribe((result: CustomerResponse) => {
                if (sgvType === 'orderer') {
                    this.ordererSgvAutoComplete = result;
                } else if (sgvType === 'sender') {
                    this.senderSgvAutoComplete = result;
                } else if (sgvType === 'receiver') {
                    this.receiverSgvAutoComplete = result;
                } else if (sgvType === 'loader') {
                    this.loaderSgvAutoComplete = result;
                } else if (sgvType === 'unloader') {
                    this.unloaderSgvAutoComplete = result;
                }
            }, (error: any) => {
                this.errorHandling(error);
            });
        }
    }

    selectMainCarrier(event: any) {
        this.miscGroup.get("mainCarrierUicCompanyCode")?.setValue(event.target.value);
    }

    selectSgvId(event: any | null, sgv: string | null = null, inFieldName: string | null = null) {
        let selectedValue: string | null = null;
        let fieldName: string | null = null;
        if (!sgv) {
            if (event === null || !event.target.value || event.target.value == '' || event.target.value == null) {
                return;
            }

            const sgvAndName = this.customerSgvNamePipe.transform(event.target.value) as Customer;

            if (!sgvAndName.name) {
                return;
            }

            selectedValue = sgvAndName.sgvNumber;
            fieldName = event.target.name;
        } else {
            if (!sgv || !inFieldName) return;
            selectedValue = sgv;
            fieldName = inFieldName;
        }

        if (!selectedValue || !fieldName) return;

        this.trainorderService.getSites4Sgv(selectedValue).subscribe((result: SiteResponse) => {
            switch (fieldName) {
                case 'ordererSgvId': {
                    this.ordererPartnerIdList = result;
                    if (this.orderTemplate) { this.shippingGroup.get("ordererPartnerId")?.setValue(this.orderTemplate.orderer.partnerId); }
                    break;
                }
                case 'senderSgvId': {
                    this.senderPartnerIdList = result;
                    if (this.orderTemplate) this.shippingGroup.get("senderPartnerId")?.setValue(this.orderTemplate.sender.partnerId);
                    break;
                }
                case 'loaderSgvId': {
                    this.loaderPartnerIdList = result;
                    if (this.orderTemplate) this.shippingGroup.get("loaderPartnerId")?.setValue(this.orderTemplate.loader?.partnerId);
                    break;
                }
                case 'receiverSgvId': {
                    this.receiverPartnerIdList = result;
                    if (this.orderTemplate) this.receivingGroup.get("receiverPartnerId")?.setValue(this.orderTemplate.receiver?.partnerId);
                    break;
                }
                case 'unloaderSgvId': {
                    this.unloaderPartnerIdList = result;
                    if (this.orderTemplate) this.receivingGroup.get("unloaderPartnerId")?.setValue(this.orderTemplate.unloader?.partnerId);
                }
            }
        }, (error: any) => {
            this.errorHandling(error);
        });
    }

    clearInput(key: string) {
        this.newOrderTemplateForm.controls.shippingGroup.get(key)?.setValue(null);
        this.newOrderTemplateForm.controls.receivingGroup.get(key)?.setValue(null);
        this.newOrderTemplateForm.controls.miscGroup.get(key)?.setValue(null);
        this.newOrderTemplateForm.controls.transportRouteGroup.get(key)?.setValue(null);

        switch (key) {
            case 'newTemplateSendingStation':
                this.newOrderTemplateForm.controls['newTemplateSendingStationKeySequence'].setValue('');
                this.newOrderTemplateForm.controls['newTemplateSendingStationKeyAlpha'].setValue('');
                this.newOrderTemplateForm.controls['wagonStoringPositionSenderKeySequence'].setValue('');
                this.newOrderTemplateForm.controls['wagonStoringPositionSenderKeyAlpha'].setValue('');
                this.shippingGroup.controls.wagonStoringPositionSender.setValue(null);
                this.commercialLocationSummariesSendingStations = [];
                this.wagonStoringPositionSenderAutocomplete = [];
                break;
            case 'wagonStoringPositionSender':
                this.newOrderTemplateForm.controls['wagonStoringPositionSenderKeySequence'].setValue('');
                this.newOrderTemplateForm.controls['wagonStoringPositionSenderKeyAlpha'].setValue('');
                break;
            case 'wagonStoringPositionReceiver':
                this.newOrderTemplateForm.controls['wagonStoringPositionReceiverKeySequence'].setValue('');
                this.newOrderTemplateForm.controls['wagonStoringPositionReceiverKeyAlpha'].setValue('');
                break;
            case 'newTemplateReceivingStation':
                this.newOrderTemplateForm.controls['newTemplateReceivingStationKeySequence'].setValue('');
                this.newOrderTemplateForm.controls['newTemplateReceivingStationKeyAlpha'].setValue('');
                this.newOrderTemplateForm.controls['wagonStoringPositionReceiverKeySequence'].setValue('');
                this.newOrderTemplateForm.controls['wagonStoringPositionReceiverKeyAlpha'].setValue('');
                this.receivingGroup.controls.wagonStoringPositionReceiver.setValue(null);
                this.receivingStationsAutocomplete = [];
                this.wagonStoringPositionReceiverAutocomplete = [];
                break;
            case 'ordererSgvId':
                this.newOrderTemplateForm.controls.shippingGroup.get('ordererPartnerId')?.setValue(null);
                this.ordererPartnerIdList = [];
                break;
            case 'senderSgvId':
                this.newOrderTemplateForm.controls.shippingGroup.get('senderSgvId')?.setValue(null);
                this.senderPartnerIdList = [];
                break;
            case 'loaderSgvId':
                this.newOrderTemplateForm.controls.shippingGroup.get('loaderSgvId')?.setValue(null);
                this.loaderPartnerIdList = [];
                break;
            case 'receiverSgvId':
                this.newOrderTemplateForm.controls.receivingGroup.get('receiverSgvId')?.setValue(null);
                this.receiverPartnerIdList = [];
                break;
            case 'unloaderSgvId':
                this.newOrderTemplateForm.controls.receivingGroup.get('unloaderSgvId')?.setValue(null);
                this.unloaderPartnerIdList = [];
                break;
            case 'newTemplateStartStation':
                this.newOrderTemplateForm.controls['newTemplateStartStationKeySequence'].setValue('');
                this.newOrderTemplateForm.controls['newTemplateStartStationKeyAlpha'].setValue('');
            break;
            case 'newTemplateEndStation':
                this.newOrderTemplateForm.controls['newTemplateEndStationKeySequence'].setValue('');
                this.newOrderTemplateForm.controls['newTemplateEndStationKeyAlpha'].setValue('');
            break;
            case 'lastStartStation':
                this.transportRouteGroup.get('lastStartStation')?.setValue(null);
            break;
            case 'firstEndStation':
                this.transportRouteGroup.get('lastStartStation')?.setValue(null);
            break;
            case 'borderStation':
                this.selectedBorder = undefined;
                break;
        }
    }

    setCarrier(event: any, idx: number): void {
        const carrierCode = this.getAdditionalRoutes().controls[idx].get('carrierUicCompanyCode')?.value;
        const carrierName = this.getCarrierName(carrierCode);
        this.resultRoutes[idx+2].carrierCode = carrierCode;
        this.resultRoutes[idx+2].carrierName = carrierName;
    }

    setObjectKeyRouteValues(event: any, idx?: number): void {
        switch(event.target.id) {
            case 'firstEndStation': {
                const foundStation = this.receivingStationsAutocomplete.find((station) => station.name === event.target.value);
                if (foundStation) {
                    this.resultRoutes[0].endStation = foundStation.name;
                    this.resultRoutes[0].receivingStationKeyAlpha = foundStation.objectKeyAlpha;
                    this.resultRoutes[0].receivingStationKeySequence = String(foundStation.objectKeySequence);
                } else {
                    console.log('Failed to find autocomplete station: firstEndStation');
                }
            } break;
            case 'lastStartStation': {
                const foundStation = this.commercialLocationSummariesSendingStations.find((station) => station.name === event.target.value);
                if (foundStation) {
                    this.resultRoutes[1].startStation = foundStation.name;
                    this.resultRoutes[1].sendingStationKeyAlpha = foundStation.objectKeyAlpha;
                    this.resultRoutes[1].sendingStationKeySequence = String(foundStation.objectKeySequence);
                } else {
                    console.log('Failed to find autocomplete station: lastStartStation');
                }
            } break;
            case 'startStation': {
                const foundStation = this.commercialLocationSummariesSendingStations.find((station) => station.name === event.target.value);
                if (foundStation && idx) {
                    this.resultRoutes[idx].startStation = foundStation.name;
                    this.resultRoutes[idx].sendingStationKeyAlpha = foundStation.objectKeyAlpha;
                    this.resultRoutes[idx].sendingStationKeySequence = String(foundStation.objectKeySequence);
                } else {
                    console.log('Failed to find autocomplete station: firstEndStation');
                }
            } break;
            case 'endStation': {
                const foundStation = this.receivingStationsAutocomplete.find((station) => station.name === event.target.value);
                if (foundStation && idx) {
                    this.resultRoutes[idx].endStation = foundStation.name;
                    this.resultRoutes[idx].receivingStationKeyAlpha = foundStation.objectKeyAlpha;
                    this.resultRoutes[idx].receivingStationKeySequence = String(foundStation.objectKeySequence);
                } else {
                    console.log('Failed to find autocomplete station: firstEndStation');
                }
            } break;
            default: {
                console.error('Unknown station type: ' + event.target.id);
            }
        }
    }

    setObjectKeyFormValues(event: any): void {
        let foundStation;
        switch (event.target.name) {
            case 'wagonStoringPositionSender':
                foundStation = this.wagonStoringPositionSenderAutocomplete.find((station) => station.name === event.target.value);

                if (foundStation) {
                    this.newOrderTemplateForm.controls['wagonStoringPositionSenderKeySequence'].setValue(foundStation.objectKeySequence);
                    this.newOrderTemplateForm.controls['wagonStoringPositionSenderKeyAlpha'].setValue(foundStation.objectKeyAlpha);
                }
                break;
            case 'receiving-station':
                foundStation = this.receivingStationsAutocomplete.find((station) => station.name === event.target.value);
                if (foundStation) {
                    this.newOrderTemplateForm.controls['newTemplateReceivingStationKeySequence'].setValue(foundStation.objectKeySequence);
                    this.newOrderTemplateForm.controls['newTemplateReceivingStationKeyAlpha'].setValue(foundStation.objectKeyAlpha);
                    this.trainorderService.getProductionLocations(
                        foundStation.objectKeyAlpha,
                        foundStation.objectKeySequence,
                        'PRDV'
                    ).subscribe((result: ProductionLocationResponse) => {
                        this.wagonStoringPositionReceiverAutocomplete = result;
                    }, (error: any) => {
                        this.errorHandling(error);
                    });
                }
                break;
            case 'wagonStoringPositionReceiver':
                foundStation = this.wagonStoringPositionReceiverAutocomplete.find((station) => station.name === event.target.value);

                if (foundStation) {
                    this.newOrderTemplateForm.controls['wagonStoringPositionReceiverKeySequence'].setValue(foundStation.objectKeySequence);
                    this.newOrderTemplateForm.controls['wagonStoringPositionReceiverKeyAlpha'].setValue(foundStation.objectKeyAlpha);
                }
                break;
            case 'borderStation':
                const foundBorder = this.borderStationAutoComplete.find((border) => border.name === event.target.value);
                if (foundBorder) {
                    this.newOrderTemplateForm.controls['uicBorderCode'].setValue(foundBorder.uicBorderCode);
                }
                break;
            case 'marketSegmentCode':
                const foundMarketSegment = this.marketSegmentAutoComplete.find((marketSegmentCode) => marketSegmentCode.name === event.target.value);
                if (foundMarketSegment) {
                    return;
                }
                break;
            default:
                break;
        }
    }

    autocompleteStationInputChanged(event: any): void {
        switch (event.target.name) {

            case StationTypes.START:
                this.startStationInputChange.next(event.target.value);
                break;
            case StationTypes.END:
                this.endStationInputChange.next(event.target.value);
                break;
            default:
                break;
        }
    }

    private getStationAutocompleteSuggestions(input: any, stationType: string): void {
        const commercialLocationTypes: string[] = [StationTypes.SENDING, StationTypes.RECEIVING, StationTypes.START, StationTypes.END];
        let autocompleteArray: InfrastructureLocation[] = [];

        this.trainorderService.getCommercialLocations(input, autocompleteArray).subscribe((result: any) => {
            if (stationType === StationTypes.RECEIVING) {
                this.receivingStationsAutocomplete =  this.trainorderService.createUniqueKeysCommercialOrProductionLocations(result);
            } else if (stationType === StationTypes.START) {
                this.startStationsAutocomplete =  this.trainorderService.createUniqueKeysCommercialOrProductionLocations(result);
            } else if (stationType === StationTypes.END) {
                this.endStationsAutocomplete =  this.trainorderService.createUniqueKeysCommercialOrProductionLocations(result);
            }
        }, (error: any) => {
            this.errorHandling(error);
        });
    }

    /**
     * Used for input date fields to add focus class
     * @param event
     */
    onFocus(event: any) {
        event.target.classList.add('focused');
    }

    /**
     * Used for input date fields to remove focus class
     * @param event
     */
    onBlur(event: any) {
        if (!event.target.value) {
            event.target.classList.remove('focused');
        }
    }

    get trainDataGroupArray_1() {
        return this.trainDataGroup.get("trainDataGroupArray_1") as FormArray;
    }

    get trainDataGroupArray_2() {
        return this.trainDataGroup.get("trainDataGroupArray_2") as FormArray;
    }

    trainDataGroupArray_1_FieldIsInvalid(fieldName: string, idx: number): boolean {
        const control = this.trainDataGroupArray_1.controls[idx]?.get(fieldName);
        if (control && control.touched) {
            return !control.valid;
        }
        return false;
    }

    deleteCargoData_1(i: number): void {
        this.getAdditionalCargo_1().removeAt(i);
    }

    trainDataGroupFieldIsInvalid(fieldName: string): boolean {
        const control = this.trainDataGroup.get(fieldName);
        if (control && control.touched) {
            return !control.valid;
        }
        return false;
    }

    /**
     * Used in *ngFor for performance reason. Updates in template only new items in the array, instead of the whole array
     * @param index of array item
     * @param item of array
     * @returns
     */
    trackByFn(index: any, item: any): any {
        return index;
    }

    getAdditionalCargo_1(): FormArray {
        return this.trainDataGroupArray_1;
    }

    addCargoData_1(nhmCode?: string, wagonAmount?: string, wagonType?: string, unCode?: string): void {
        if (this.trainDataGroupArray_1.length < 10) {
            this.getAdditionalCargo_1().push(this.newAdditionalCargo_1(nhmCode, wagonAmount, wagonType, unCode));
        }
    }

    getAdditionalCargo_2(): FormArray {
        return this.trainDataGroupArray_2;
    }

    newAdditionalCargo_1(nhmCode?: string, wagonAmount?: string, wagonType?: string, unCode?: string): FormGroup {
        if (!nhmCode) nhmCode = '';
        if (!wagonAmount) wagonAmount = '';
        if (!wagonType) wagonType = '';
        if (!unCode) unCode = '';
        const formGroup = new FormGroup({
            cargoNhmCode: new FormControl(nhmCode),
            cargoWagonAmount: new FormControl(wagonAmount),
            cargoWagonType: new FormControl(wagonType),
            cargoUnCode: new FormControl(unCode)
        });
        const cargoWagonType = formGroup.get('cargoWagonType');
        if (!cargoWagonType) {
            console.error('Failed to find Field: cargoWagonType');
        } else {
            cargoWagonType.valueChanges.pipe(debounceTime(500)).subscribe((input: string | null) => {
                if (input) {
                    this.getWagonTypeAutocomplete(input, cargoWagonType);
                } else {
                    console.error('Input must not be null.');
                }
            });
        }
        return formGroup;
    }

    onSelectGrossWeight(): void {
        this.removeValidatorsForNetWeight();
        this.addValidatorsForGrossWeight();
    }

    addValidatorsForGrossWeight(): void {
        // this.trainDataGroup.get('grossWeight')?.addValidators([Validators.required]);
        // this.trainDataGroup.get('trainLength')?.addValidators([Validators.required]);
        // this.trainDataGroup.get('nhmCode')?.addValidators([Validators.required]);
    }

    removeValidatorsForNetWeight(): void {
        this.trainDataGroupArray_2.get('cargoNhmCode')?.removeValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoNetWeight')?.removeValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoWagonAmount')?.removeValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoWagonType')?.removeValidators([Validators.required]);
    }

    onSelectNetWeight(): void {
        this.removeValidatorsForGrossWeight();
        this.addValidatorsForNetWeight();
    }

    addValidatorsForNetWeight(): void {
        // this.trainDataGroupArray_2.get('cargoNhmCode')?.addValidators([Validators.required]);
        // this.trainDataGroupArray_2.get('cargoNetWeight')?.addValidators([Validators.required]);
        // this.trainDataGroupArray_2.get('cargoWagonAmount')?.addValidators([Validators.required]);
        // this.trainDataGroupArray_2.get('cargoWagonType')?.addValidators([Validators.required]);
    }

    removeValidatorsForGrossWeight(): void {
        this.trainDataGroup.get('grossWeight')?.removeValidators([Validators.required]);
        this.trainDataGroup.get('trainLength')?.removeValidators([Validators.required]);
        this.trainDataGroup.get('nhmCode')?.removeValidators([Validators.required]);
    }

    getWagonTypeAutocomplete(input: any, cargoWagonType: AbstractControl): void {
        cargoWagonType.setErrors({});
        if (input && input.length >= 3 && !this.wagonTypeAutocomplete.find((elem) => elem.name === input || elem.code === input)) {
            this.trainorderService.getWagonInfo(input).then((result: WagonCodes) => {
                if (result && result && result.length > 0) {
                    this.wagonTypeAutocomplete = [];
                    for (let s of result) {
                        const wagonModel: WagonType = {
                            code: s
                        }
                        this.wagonTypeAutocomplete.push(wagonModel);
                    }
                    this.wagonTypeAutocomplete = this.wagonTypeAutocomplete.slice(0, 30).sort((a, b) => ((a.name ? a.name : '') > (b.name ? b.name : '') ? 1 : -1));
                } else {
                    cargoWagonType.setErrors({nodata: true});
                }
            }, (reason: any) => {
                console.error(reason)
            }
            );

        }
    }

    newAdditionalCargo_2(nhmCode?: string, netWeight?: string, wagonAmount?: string, wagonType?: string, bzaNumber?: string, unCode?: string, dangerousGoodClass?: string): FormGroup {
        if (!nhmCode) nhmCode = '';
        if (!netWeight) netWeight = '';
        if (!wagonAmount) wagonAmount = '';
        if (!wagonType) wagonType = '';
        if (!bzaNumber) bzaNumber = '';
        if (!unCode) unCode = '';
        if (!dangerousGoodClass) dangerousGoodClass = '';
        const formGroup = new FormGroup({
            cargoNhmCode: new FormControl(nhmCode),
            cargoNetWeight: new FormControl(netWeight),
            cargoWagonAmount: new FormControl(wagonAmount),
            cargoWagonType: new FormControl(wagonType),
            cargoBzaNumber: new FormControl(bzaNumber),
            cargoUnCode: new FormControl(unCode),
            dangerousGoodClass: new FormControl(dangerousGoodClass)
        });
        const cargoWagonType = formGroup.get('cargoWagonType');
        if (!cargoWagonType) {
            console.error('Failed to find Field: cargoWagonType');
        } else {
            cargoWagonType.valueChanges.pipe(debounceTime(500)).subscribe((input: string | null) => {
                if (input) {
                    this.getWagonTypeAutocomplete(input, cargoWagonType);
                } else {
                    console.error('Input must not be null.');
                }
            });
        }
        return formGroup;
    }

    addCargoData_2(nhmCode?: string, netWeight?: string, wagonAmount?: string, wagonType?: string, bzaNumber?: string, unCode?: string, dangerousGoodClass?: string): void {
        if (this.trainDataGroupArray_2.length < 10) {
            this.getAdditionalCargo_2().push(this.newAdditionalCargo_2(nhmCode, netWeight, wagonAmount, wagonType, bzaNumber, unCode, dangerousGoodClass));
        }
    }

    deleteCargoData_2(i: number): void {
        this.getAdditionalCargo_2().removeAt(i);
    }

    trainDataGroupArray_2_FieldIsInvalid(fieldName: string, idx: number): boolean {
        const control = this.trainDataGroupArray_2.controls[idx]?.get(fieldName);
        if (control && control.touched) {
            return !control.valid;
        }
        return false;
    }

    trainDataGroupArray_2_FieldLimitReached(fieldName: string, idx: number): boolean {
        const control = this.trainDataGroupArray_2.controls[idx]?.get(fieldName);
        if (control?.value) {
            if (control?.value.length == 1000 && control.touched) {
                return true;
            }
        }
        return false;
    }

    autocompleteInputChanged(event: any, field: string): void {
        switch (field) {
            case 'cargo':
                this.cargoInputChange.next(event.target.value);
                break;
            case 'wagon-type':
                this.wagonTypeInputChange.next(event.target.value);
                break;
            case 'dangerous-cargo':
                this.dangerousCargoInputChange.next(event.target.value);
                break;
            default:
                break;
        }
    }

    get shippingGroup() {
        return this.newOrderTemplateForm.get("shippingGroup") as FormGroup;
    }

    get receivingGroup() {
        return this.newOrderTemplateForm.get("receivingGroup") as FormGroup;
    }

    get miscGroup() {
        return this.newOrderTemplateForm.get("miscGroup") as FormGroup;
    }

    get transportRouteGroup() {
        return this.newOrderTemplateForm.get("transportRouteGroup") as FormGroup;
    }

    get trainDataGroup() {
        return this.newOrderTemplateForm.get('trainDataGroup') as FormGroup;
    }
}
