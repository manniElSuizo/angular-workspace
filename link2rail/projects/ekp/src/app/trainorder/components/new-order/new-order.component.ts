import { AfterViewInit, ChangeDetectorRef, Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { ApiDangerousGoodResponse, ApiGoodResponse, DangerousGoodModel, GoodModel, WagonType, DangerousGoodClass, WagonCodes } from '@src/app/trainorder/models/Cargo.model';
import { maxDateValidator, minDateValidator, } from '@src/app/shared/validators/custom-validators';
import { ConstValues } from '@src/app/shared/enums/const-values.enum';
import { TranslateService } from '@ngx-translate/core';
import { OrderTemplate, OrderTemplateSummary, OrderTemplateSummaryRequest } from '@src/app/trainorder/models/OrderTemplateModels';
import { debounceTime } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Cargo, CargoDetail, OrderRequest, Transport } from '@src/app/trainorder/models/ApiNewOrder.model';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedModule } from '@src/app/shared/shared.module';
import { TrainorderPipesModule } from '../../pipes/trainorder-pipes.module';
import { TrainorderService } from '../../services/trainorder.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ConfirmationComponent } from '@src/app/shared/components/confirmations/confirmation.component';

enum ViewState {
    NET_WEIGHT_AND_WAGGON_AMOUNT = 'NET_WEIGHT_AND_WAGGON_AMOUNT',
    GROSS_WEIGHT_AND_TRAIN_LENGTH = 'GROSS_WEIGHT_AND_TRAIN_LENGTH'
}

interface ResultCargo {
    idx: number,
    cargoNhmCode: string,
    cargoUnCode: string,
    cargoWaggonAmount: number,
    cargoWagonType: string
}

@Component({
    selector: 'app-new-order',
    templateUrl: './new-order.component.html',
    styleUrls: ['./new-order.component.scss'],
    standalone: true,
    imports: [
      SharedModule,
      FormsModule,
      TrainorderPipesModule,
      ReactiveFormsModule,
    ]
})

export class NewOrderComponent implements OnInit, OnDestroy, AfterViewInit {
    private cargoInputChange: Subject<string> = new Subject<string>(); // | Used to track the input in the field
    private dangerousCargoInputChange: Subject<string> = new Subject<string>(); // | in order to have a delay between the requests
    private subscription: Subscription = new Subscription();
    error: any = null;
    ordersTemplateList: OrderTemplateSummary[]
    orderTemplate: OrderTemplate;
    loadingInProgress: boolean = false;
    trainDataCount = [1];
    currentTab = 0;
    tabs = ['orderDataTab', 'trainDataTab', 'shippingTimeTab'];
    today = new Date().toISOString().split('T')[0];
    maxDate = ConstValues.MAX_DATE;
    maxDateTime = ConstValues.MAX_DATE_TIME;
    nhmCodeAutocomplete: GoodModel[] = [];
    wagonTypeAutocomplete: WagonType[] = [];
    dangerousGoodsAutocomplete: DangerousGoodModel[] = [];
    dangerousGoodsClasses: DangerousGoodClass[] = [];
    viewState = ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH;
    resultCargo: ResultCargo[];

    maxFieldLength = {
        customerReference: 10,
        orderReason: 100,
        sender: 25,
        receiver: 25,
    };

    newOrderForm: FormGroup;
    ViewState = ViewState;

    constructor(
        @Inject(MAT_DIALOG_DATA) public param: { templateId: string } | null | undefined,
        @Inject(LOCALE_ID) public locale: string,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef,
        private translation: TranslateService,
        private modalWindows: ModalWindows,
        private trainorderService: TrainorderService,
        private dialog: MatDialog,
        private storageService: LocalStorageService,
        private newOrderComponentDialogRef: MatDialogRef<ConfirmationComponent>
    ) {
        this.createNewOrderForm();
    }

    public openConfirmationDialog(): void {
        let confirmationComponentdialogRef: MatDialogRef<ConfirmationComponent>;
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
            top: '30vh'
        }
        confirmationComponentdialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
        confirmationComponentdialogRef.afterClosed().pipe().subscribe({
            next: (decision) => {
                if (decision === true) {
                    this.newOrderComponentDialogRef.close(true);
                }
            }
        });
    }

    private createNewOrderForm(): void {
        this.newOrderForm = this.fb.group({
            trainParamSelection: new FormControl(this.viewState),
            orderDataGroup: this.fb.group({
                templateNr: new FormControl(null, Validators.required),
            }),

            shippingTimeGroup: this.fb.group({
                earliestHandover: new FormControl('', [maxDateValidator(this.maxDate), this.earliestHandoverAfterLatestHandover(), this.earliestHandoverBeforeFirstShipmentDate()]),
                latestHandover: new FormControl('', [maxDateValidator(this.maxDate), this.latestHandoverBeforeEarliestHandover()]),
                earliestDelivery: new FormControl('', [maxDateValidator(this.maxDate), this.earliestDeliveryBeforeEarliestHandover(), this.earliestDeliveryAfterLatestDelivery()]),
                latestDelivery: new FormControl('', [maxDateValidator(this.maxDate), this.latestDeliveryBeforeEarliestDelivery()]),

                shipmentDataGroupArray: this.fb.array([
                    this.fb.group({
                        customerReference: new FormControl(''),
                        shipmentDate: new FormControl('', [Validators.required, maxDateValidator(this.maxDate), minDateValidator(this.today)]),
                        orderReasonAndMisc: new FormControl(''),
                    })]),
            }),

            orderReasonAndMisc: new FormControl(''),

            trainDataGroup: new FormGroup({
                grossWeight: new FormControl('', [Validators.required]),
                trainLength: new FormControl('', [Validators.required]),
                vmax: new FormControl(),
                nhmCode: new FormControl('', [Validators.required]),
                dangerousGoodClass: new FormControl(),
                bzaNr: new FormControl(),
                p2: new FormControl(),
                c2: new FormControl(),
                p3: new FormControl(),
                c3: new FormControl(),
                trainDataGroupArray_1: this.fb.array([]),
                trainDataGroupArray_2: this.fb.array([])
            })
        });
    }

    get cargoWagonType_1(): FormControl {
        return this.trainDataGroupArray_1.get('cargoWagonType') as FormControl;
    }
    get orderDataGroup() {
        return this.newOrderForm.get("orderDataGroup") as FormGroup;
    }

    get templateNr() {
        return this.orderDataGroup.get("templateNr") as FormControl;
    }

    get trainDataGroup() {
        return this.newOrderForm.get("trainDataGroup") as FormGroup;
    }

    get trainDataGroupArray_1() {
        return this.trainDataGroup.get("trainDataGroupArray_1") as FormArray;
    }

    get trainDataGroupArray_2() {
        return this.trainDataGroup.get("trainDataGroupArray_2") as FormArray;
    }

    get shipmentDataGroupArray() {
        return this.shippingTimeGroup.get("shipmentDataGroupArray") as FormArray;
    }

    get shippingTimeGroup() {
        return this.newOrderForm.get("shippingTimeGroup") as FormGroup;
    }

    get orderReason() {
        return this.newOrderForm.get("orderReasonAndMisc") as FormControl;
    }

    get customerReference() {
        return this.newOrderForm.get('shippingTimeGroup')?.get('customerReference');
    }

    ngOnInit(): void {
        const orderTemplateSummaryRequest: OrderTemplateSummaryRequest = {
            templateId: '',
            senderName: '',
            receiverName: '',
            limit: 10000,
            offset: 0,
            sort: "",
            customerProfiles: this.storageService.getActiveProfiles()
        };
        this.trainorderService.sendOrdertemplatesListRequest(orderTemplateSummaryRequest).subscribe(result =>
            this.ordersTemplateList = result.items.filter(e => e.templateId.startsWith("F"))
        );
        this.trainorderService.getDangerousGoodsClasses().subscribe(result => this.dangerousGoodsClasses = result);

        this.changeTab(0);
        this.changeTabTitle('1. ' + this.translation.instant('New-order-page.Order-data-header'));
        this.resultCargo = [];
        this.cd.detectChanges();

        this.subscription.add(this.cargoInputChange.pipe(debounceTime(500)).subscribe((input) => {
            this.getCargoInfoAutocomplete(input);
        }));

        this.subscription.add(this.dangerousCargoInputChange.pipe(debounceTime(500)).subscribe((input) => {
            this.getDangerousCargoInfoAutocomplete(input);
        }));

        this.newOrderForm.get('trainParamSelection')?.valueChanges.subscribe((viewState: ViewState | null) => {
            if (viewState) {
                this.viewState = viewState;
            } else {
                console.error('ViewState must not be null.');
            }
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
    }

    ngAfterViewInit() {
        if (this.param && this.param.templateId != null) {
            this.templateNr.setValue(this.param.templateId);
            this.loadTemplate();
            this.cd.detectChanges();
        }
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    protected onSelectGrossWeight(): void {
        this.removeValidatorsForNetWeight();
        this.addValidatorsForGrossWeight();
    }

    protected onSelectNetWeight(): void {
        this.removeValidatorsForGrossWeight();
        this.addValidatorsForNetWeight();
    }

    private addValidatorsForGrossWeight(): void {
        this.trainDataGroup.get('grossWeight')?.addValidators([Validators.required]);
        this.trainDataGroup.get('trainLength')?.addValidators([Validators.required]);
        this.trainDataGroup.get('nhmCode')?.addValidators([Validators.required]);
    }

    private removeValidatorsForGrossWeight(): void {
        this.trainDataGroup.get('grossWeight')?.removeValidators([Validators.required]);
        this.trainDataGroup.get('trainLength')?.removeValidators([Validators.required]);
        this.trainDataGroup.get('nhmCode')?.removeValidators([Validators.required]);
    }

    private addValidatorsForNetWeight(): void {
        this.trainDataGroupArray_2.get('cargoNhmCode')?.addValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoNetWeight')?.addValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoWagonAmount')?.addValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoWagonType')?.addValidators([Validators.required]);
    }

    private removeValidatorsForNetWeight(): void {
        this.trainDataGroupArray_2.get('cargoNhmCode')?.removeValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoNetWeight')?.removeValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoWagonAmount')?.removeValidators([Validators.required]);
        this.trainDataGroupArray_2.get('cargoWagonType')?.removeValidators([Validators.required]);
    }

    private cargoWagonTypeIsTouched(idx: number): boolean {
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

    protected cargoWagonTypeIsInvalidBrutto(idx: number): boolean {
        if (this.cargoWagonTypeIsEmpty(idx)) {
            return true;
        }
        if (this.cargoWagonTypeHasNoData(idx)) {
            return true;
        }
        return false;
    }

    protected cargoWagonTypeIsInvalidNetto(idx: number): boolean {
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
            if (found === false) {
                return true;
            }
        }
        return false;
    }

    protected cargoWagonTypeHasNoData(idx: number): boolean {
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
            if (control.value != null && control.touched && (control.value.length < 3 && control.value.length > 0)) {
                return true;
            }
            return control.hasError('nodata');
        }
        return false;
    }

    private cargoWagonTypeIsEmpty(idx: number): boolean {
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
                    return false;
                }
            }
        }
        return false;
    }

    protected trainDataGroupArray_1_FieldIsInvalid(fieldName: string, idx: number): boolean {
        return false;
    }

    protected trainDataGroupArray_2_FieldIsInvalid(fieldName: string, idx: number): boolean {
        const control = this.trainDataGroupArray_2.controls[idx]?.get(fieldName);
        if (control && control.touched) {
            return !control.valid;
        }
        return false;
    }

    protected trainDataGroupArray_2_FieldLimitReached(fieldName: string, idx: number): boolean {
        const control = this.trainDataGroupArray_2.controls[idx]?.get(fieldName);
        if (control?.value) {
            if (control?.value.length == 1000 && control.touched) {
                return true;
            }
        }
        return false;
    }

    protected trainDataGroupFieldIsInvalid(fieldName: string): boolean {
        const control = this.trainDataGroup.get(fieldName);
        if (control && control.touched) {
            return !control.valid;
        }
        return false;
    }

    private latestHandoverBeforeEarliestHandover(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                let earlyDate = this.shippingTimeGroup.get('earliestHandover')?.value
                return new Date(control.value).getTime() < new Date(earlyDate).getTime() ? {latestHandoverBeforeEarliestHandoverError: true} : null;
            } else {
                return null;
            }
        }
    }

    private earliestHandoverAfterLatestHandover(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                let lateDate = this.shippingTimeGroup.get('latestHandover')?.value
                return new Date(lateDate).getTime() < new Date(control.value).getTime() ? {latestHandoverBeforeEarliestHandoverError: true} : null;
            } else {
                return null;
            }
        }
    }

    private earliestHandoverBeforeFirstShipmentDate(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                let earlyDate = this.shipmentDataGroupArray.at(0).get('shipmentDate')?.value
                return new Date(control.value).getTime() < new Date(earlyDate).getTime() ? {earliestHandoverBeforeShipmentDateError: true} : null;
            } else {
                return null;
            }
        }
    }

    private firstShipmentDateAfterearliestHandover(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                let lateDate = this.shippingTimeGroup.get('latestHandover')?.value
                return new Date(lateDate).getTime() < new Date(control.value).getTime() ? {latestHandoverBeforeEarliestHandoverError: true} : null;
            } else {
                return null;
            }
        }
    }

    private earliestDeliveryBeforeEarliestHandover(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                let earlyDate = this.shippingTimeGroup.get('earliestHandover')?.value
                return new Date(control.value).getTime() < new Date(earlyDate).getTime() ? {earliestDeliveryBeforeEarliestHandoverError: true} : null;
            } else {
                return null;
            }
        }
    }

    private earliestHandoverAfterEarliestDelivery(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                let lateDate = this.shippingTimeGroup.get('earliestDelivery')?.value
                return new Date(lateDate).getTime() < new Date(control.value).getTime() ? {earliestDeliveryBeforeEarliestHandoverError: true} : null;
            } else {
                return null;
            }
        }
    }

    private latestDeliveryBeforeEarliestDelivery(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                let earlyDate = this.shippingTimeGroup.get('earliestDelivery')?.value
                return new Date(control.value).getTime() < new Date(earlyDate).getTime() ? {latestDeliveryBeforeEarliestDeliveryError: true} : null;
            } else {
                return null;
            }
        }
    }

    private earliestDeliveryAfterLatestDelivery(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                let lateDate = this.shippingTimeGroup.get('latestDelivery')?.value
                return new Date(lateDate).getTime() < new Date(control.value).getTime() ? {latestDeliveryBeforeEarliestDeliveryError: true} : null;
            } else {
                return null;
            }
        }
    }

    private createCargoArrayByTrainLength(): Cargo[] {
        const cargoArray: Cargo[] = [];
        const vmax = this.trainDataGroup.get('vmax')?.value;
        const nhmCode = this.trainDataGroup.get('nhmCode')?.value;
        const grossWeight = this.trainDataGroup.get('grossWeight')?.value;
        const trainLength = this.trainDataGroup.get('trainLength')?.value;
        const dangerousGoodClass = this.trainDataGroup.get('dangerousGoodClass')?.value ? this.trainDataGroup.get('dangerousGoodClass')?.value : null;
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
            items: []
        }

        if (this.trainDataGroupArray_1 && this.trainDataGroupArray_1.length > 0) {
            for (let formGroup of this.trainDataGroupArray_1.controls) {
                const cargoNhmCode = formGroup.get('cargoNhmCode')?.value;
                const cargoWagonAmount = formGroup.get('cargoWagonAmount')?.value;
                const cargoWagonType = formGroup.get('cargoWagonType')?.value;
                const cargoUnCode = formGroup.get('cargoUnCode')?.value;
                const detail: CargoDetail = {
                    nhmCodeText: '',
                    nhmCode: cargoNhmCode,
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

    private createCargoArrayByWagonAmount(): Cargo[] {
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

    private checkOrderFields(): boolean {
        return this.templateNr.value;
    }

    private checkShippingTimeFields(): boolean {
        const earliestHandoverControl = this.shippingTimeGroup.get('earliestHandover');
        if (!earliestHandoverControl) {
            console.error('Failed to find control: earliestHandover');
        }
        const latestHandoverControl = this.shippingTimeGroup.get('latestHandover');
        if (!latestHandoverControl) {
            console.error('Failed to find control: latestHandover');
        }
        const earliestDeliveryControl = this.shippingTimeGroup.get('earliestDelivery');
        if (!earliestDeliveryControl) {
            console.error('Failed to find control: earliestDelivery');
        }
        const latestDeliveryControl = this.shippingTimeGroup.get('latestDelivery');
        if (!latestDeliveryControl) {
            console.error('Failed to find control: latestDelivery');
        }

        if (earliestHandoverControl && latestHandoverControl && earliestDeliveryControl && latestDeliveryControl) {
            if (!earliestHandoverControl.valid || !latestHandoverControl.valid || !earliestDeliveryControl.valid || !latestDeliveryControl.valid) {
                return false;
            }
        } else {
            return false;
        }

        if (this.shipmentDataGroupArray && this.shipmentDataGroupArray.length > 0) {
            for (let formGroup of this.shipmentDataGroupArray.controls) {
                const shipmentDateControl = formGroup.get('shipmentDate');
                if (!shipmentDateControl) {
                    console.error('Failed to find control: shipmentDate');
                    return false;
                }
                if (!shipmentDateControl.valid) {
                    return false;
                }
            }
        }
        return true;
    }

    protected isFormValid(): boolean {
        return this.checkTrainParameterFields() && this.checkOrderFields() && this.checkShippingTimeFields();
    }

    protected sendNewOrderRequest(): void {
        let cargoArray: Cargo[] = [];
        if (this.viewState === ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH) {
            cargoArray = this.createCargoArrayByTrainLength();
        } else {
            cargoArray = this.createCargoArrayByWagonAmount();
        }
        const transportArray: Transport[] = [];
        for (let i = 0; i < this.shipmentDataGroupArray.length; i++) {
            const transport: Transport = {
                shipmentDate: this.shipmentDataGroupArray.at(i).get('shipmentDate')?.value,
                customerReference: this.shipmentDataGroupArray.at(i).get('customerReference')?.value,
                orderReason: this.shipmentDataGroupArray.at(i).get('orderReasonAndMisc')?.value,
            };

            transportArray.push(transport);
        }

        const newOrderRequestValue: OrderRequest = {
            templateId: this.orderDataGroup.get("templateNr")?.value,
            cargo: cargoArray,
            transport: transportArray,
        };
        if (this.shippingTimeGroup.get('earliestHandover')?.value) {
            newOrderRequestValue.earliestHandover = formatDate(new Date(this.shippingTimeGroup.get('earliestHandover')?.value), 'yyyy-MM-ddTHH:mm:ssZZZZZ', this.locale);
        }
        if (this.shippingTimeGroup.get('latestHandover')?.value) {
            newOrderRequestValue.latestHandover = formatDate(new Date(this.shippingTimeGroup.get('latestHandover')?.value), 'yyyy-MM-ddTHH:mm:ssZZZZZ', this.locale);
        }

        if (this.shippingTimeGroup.get('earliestDelivery')?.value) {
            newOrderRequestValue.earliestDelivery = formatDate(new Date(this.shippingTimeGroup.get('earliestDelivery')?.value), 'yyyy-MM-ddTHH:mm:ssZZZZZ', this.locale);
        }

        if (this.shippingTimeGroup.get('latestDelivery')?.value) {
            newOrderRequestValue.latestDelivery = formatDate(new Date(this.shippingTimeGroup.get('latestDelivery')?.value), 'yyyy-MM-ddTHH:mm:ssZZZZZ', this.locale);
        }

        this.blockForm();
        // Reset form and close modal window if request was successful
        this.trainorderService.sendNewOrderRequest(newOrderRequestValue).subscribe((response: any) => {
            this.resetAndCloseOrderForm();
            this.unblockForm();
        }, (error: any) => {
            this.errorHandling(error);
            this.unblockForm();
        });
    }

    private errorHandling(response: HttpErrorResponse) {
        this.loadingInProgress = false;
        this.modalWindows.openErrorDialog({ apiProblem: response.error });
    }

    /**
     * Emits the next input value from the field
     * @param event
     * @param field type of the field
     */
    protected autocompleteInputChanged(event: any, field: string): void {
        switch (field) {
            case 'cargo':
                this.cargoInputChange.next(event.target.value);
                break;
            case 'dangerous-cargo':
                this.dangerousCargoInputChange.next(event.target.value);
                break;
            default:
                break;
        }
    }

    protected clearInput(key: string) {
        this.newOrderForm.controls.orderDataGroup.get(key)?.setValue(null);
        this.newOrderForm.controls.trainDataGroup.get(key)?.setValue(null);
        this.newOrderForm.controls.shippingTimeGroup.get(key)?.setValue(null);

        switch (key) {
            case 'orderDataGroup':
                break;
            case 'trainDataGroup':
                break;
            case 'shippingTimeGroup':
                break;
        }
    }


    /**
     *  Gets cargo suggestions list for autocomplete
     * @param input template element
     */

    private getCargoInfoAutocomplete(input: any): void {
        if (input.length >= 3 && !this.nhmCodeAutocomplete.find((elem) => elem.nhmCode === input)) {
            this.trainorderService.getCargoInfo(input).then((result: ApiGoodResponse) => {
                // Take only 30 answers that fit (array may be 1000+ in length), otherwise it takes a lot of resources to build these elements
                this.nhmCodeAutocomplete = result.slice(0, 30).sort((a, b) => (a.nhmCode > b.nhmCode ? 1 : -1));
            });
        }
    }

    private getWagonTypeAutocomplete(input: any, cargoWagonType: AbstractControl): void {
        cargoWagonType.setErrors({});
        if (input.length >= 3 && !this.wagonTypeAutocomplete.find((elem) => elem.name === input || elem.code === input)) {
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
            });

        }
    }


    /**
     * Gets dangerous cargo suggestions list for autocomplete
     * @param input template element
     */

    private getDangerousCargoInfoAutocomplete(input: any): void {
        if (input.length >= 3 && !this.dangerousGoodsAutocomplete.find((elem) => elem.unCode === input))
            // TODO: add description in the input as well
            this.trainorderService.getDangerousCargoInfo(input).then((result: ApiDangerousGoodResponse) => {
                // Take only 30 answers that fit (array may be 1000+ in length), otherwise it takes a lot of resources to build these elements
                this.dangerousGoodsAutocomplete = result.slice(0, 30).sort((a, b) => (a.unCode > b.unCode ? 1 : -1));
            });
    }

    /**
     * Used for input date fields to add focus class
     * @param event
     */
    protected onFocus(event: any) {
        event.target.classList.add('focused');
    }

    /**
     * Used for input date fields to remove focus class
     * @param event
     */
    protected onBlur(event: any) {
        if (!event.target.value) {
            event.target.classList.remove('focused');
        }
    }

    /**
     * Filters the pressed key and allows to input only numbers (without + - e)
     * @param event keydown event
     */
    private filterNumberInput(event: any): void {
        if ((event.code as string).startsWith("Numpad")) {
            const key = (event.code as string).substring(6);
            if (key.match(/^[0-9]*$/)) {
                return;
            }
        }
        if ((event.which != 9 && event.which != 8 && event.which != 0 && event.which < 48) || event.which > 57) {
            event.preventDefault();
        }
    }

    private blockForm() {
        this.loadingInProgress = true;
        document.querySelectorAll<HTMLElement>('.elm-button').forEach(el => {
            el.setAttribute("disabled", "true");
        });
    }

    private unblockForm() {
        this.loadingInProgress = false;
        document.querySelectorAll<HTMLElement>('.elm-button').forEach(el => {
            el.removeAttribute("disabled");
        });
    }

    /**
     * Resets form values and validation and closes the modal window
     */
    private resetAndCloseOrderForm(): void {
        this.modalWindows.closeAllModalWindows();
        //window.location.href = "/gzp/trainorder/order";
        this.newOrderComponentDialogRef.close();
        this.modalWindows.openConfirmationDialog(this.translation.instant('Order-component.Order-sent'), 3);
    }

    /**
     * Used in *ngFor for performance reason. Updates in template only new items in the array, instead of the whole array
     * @param index of array item
     * @param item of array
     * @returns
     */
    protected trackByFn(index: any, item: any): any {
        return index;
    }

    protected nextTab() {
        if (this.currentTab < this.tabs.length - 1) {
            this.currentTab++;
        }

        this.changeTab(this.currentTab);
    }

    protected prevTab() {
        if (this.currentTab >= 1) {
            this.currentTab--;
        }

        this.changeTab(this.currentTab);
    }

    private checkTrainParameterFields(): boolean {
        if (this.viewState === ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH) {
            return this.checkGrossWeightAndTrainLengthFields();
        } else {
            return this.checkNettoWeightAndWagonAmountFields();
        }
    }

    private checkGrossWeightAndTrainLengthFields(): boolean {
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
                if (this.cargoWagonTypeHasNoData(index)) {
                    return false;
                }
                const cargoWagonTypeControl = this.trainDataGroupArray_1.controls[index].get('cargoWagonType');
                if (!cargoWagonTypeControl) {
                    console.error('Failed to find control: cargoWagonType');
                } else {
                    if (this.cargoWagonTypeIsTouched(index)) {
                    let found = false;
                       for (let a of this.wagonTypeAutocomplete) {
                            if (a.code === cargoWagonTypeControl.value) {
                                found = true;
                            }
                        }
                        if (found === false) {
                            return false;
                        }
                    }
                }
                index++;
            }
        }
        return trainFields;
    }

    private checkNettoWeightAndWagonAmountFields(): boolean {
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
            } else if (cargoWagonTypeControl.value.length > 0) {
                let found = false;
                for (let a of this.wagonTypeAutocomplete) {
                    if (a.code === cargoWagonTypeControl.value) {
                        found = true;
                    }
                }
                if (found === false) {
                return false;
                }
            }
            index++;
        }
        return true;
    }

    protected changeTab(tabNumber: number) {
        const tabName = this.tabs[tabNumber];
        this.currentTab = tabNumber;

        document.querySelectorAll<HTMLElement>('.info-block').forEach(el => {
            if (el.id == tabName) el.style.display = 'grid';
            else el.style.display = 'none';
        });

        document.querySelectorAll<HTMLElement>('.input-block-complete').forEach(el => {
            if (el.id == tabName) el.style.display = 'grid';
            else el.style.display = 'none';
        });

        let tabTitle = '';
        let counter = 1;
        document.querySelectorAll<HTMLElement>('.tabs-item').forEach(el => {
            el.classList.remove('tabs-item-selected');
            el.classList.remove('tabs-item-valid');
            if (el.id == tabName + 'Head') {
                el.classList.add('tabs-item-selected');
                tabTitle = counter + '. ' + el.getElementsByTagName('a')[0].innerText;
            } else {
                switch (el.id) {
                    case 'orderDataTabHead':
                        if (this.orderDataGroup.valid) el.classList.add('tabs-item-valid');
                        break;
                    case 'trainDataTabHead':
                        if (this.checkTrainParameterFields()) el.classList.add('tabs-item-valid');
                        break;
                    case 'shippingTimeTabHead':
                        if (this.shippingTimeGroup.valid) el.classList.add('tabs-item-valid');
                        break;
                }
            }
            counter++;
        });
        this.changeTabTitle(tabTitle);
    }

    private changeTabTitle(text: string) {
        document.querySelectorAll<HTMLElement>('.tab-title').forEach(el => el.innerText = text);
    }

    protected loadTemplate(): void {
        const templateId = this.orderDataGroup.controls.templateNr.value;
        this.trainorderService.getOrderTemplate(templateId).subscribe(result => {
            this.orderTemplate = result.orderTemplate;
            this.setTrainParams();
        });
    }

    private setTrainParams(): void {
        // Zugparameter
        const cargo: Cargo[] = this.orderTemplate.cargo;
        this.setSetGrossWeightAndTrainLengthValues(cargo);
    }

    private setNettoWeightAndWagonAmount(cargo: Cargo[]): void {
        this.viewState = ViewState.NET_WEIGHT_AND_WAGGON_AMOUNT;
        this.newOrderForm.get('trainParamSelection')?.setValue(this.viewState);
        this.trainDataGroupArray_2.controls[0].get('cargoBzaNumber')?.setValue(cargo[0].nhmCode);
        this.trainDataGroupArray_2.controls[0].get('cargoNetWeight')?.setValue(cargo[0].netWeight);
        this.trainDataGroupArray_2.controls[0].get('cargoNhmCode')?.setValue(cargo[0].numberOfWagons);
        this.trainDataGroupArray_2.controls[0].get('cargoUnCode')?.setValue(cargo[0].unCode);
        this.trainDataGroupArray_2.controls[0].get('cargoWagonAmount')?.setValue(cargo[0].numberOfWagons);
        this.trainDataGroupArray_2.controls[0].get('cargoWagonType')?.setValue(cargo[0].wagonType);
        this.trainDataGroupArray_2.controls[0].get('dangerousGoodClass')?.setValue(cargo[0].dangerousGoodClass);

        for (let i = 1; i < cargo.length; i++) {
            this.addCargoData_2(cargo[i].nhmCode, String(cargo[i].netWeight), String(cargo[i].numberOfWagons), String(cargo[i].wagonType), String(cargo[0].bzaNumber), cargo[0].unCode, cargo[0].dangerousGoodClass);
        }
    }

    private setSetGrossWeightAndTrainLengthValues(cargo: Cargo[]): void {
        this.viewState = ViewState.GROSS_WEIGHT_AND_TRAIN_LENGTH;
        this.newOrderForm.get('trainParamSelection')?.setValue(this.viewState);

        const grossWeight = this.trainDataGroup.get('grossWeight');
        if (!grossWeight) {
            console.error('Failed to find field: grossWeight');
        } else {
            if (cargo[0]?.weight) {
                grossWeight.setValue(cargo[0].weight);
            } else {
                grossWeight.setValue(0);
            }
        }

        const trainLength = this.trainDataGroup.get('trainLength');
        if (!trainLength) {
            console.error('Failed to find field: trainLength');
        } else {
            if (cargo[0] && cargo[0].length) {
                trainLength.setValue(cargo[0].length);
            } else {
                trainLength.setValue(0);
            }
        }

        const vmax = this.trainDataGroup.get('vmax');
        if (!vmax) {
            console.error('Failed to find field: vmax');
        } else {
            if (cargo[0] && cargo[0].maximumSpeed) {
                vmax.setValue(cargo[0].maximumSpeed);
            } else {
                vmax.setValue(0);
            }
        }

        const nhmCode = this.trainDataGroup.get('nhmCode');
        if (!nhmCode) {
            console.error('Failed to find field: nhmCode');
        } else {
            if (cargo[0] && cargo[0].nhmCode) {
                nhmCode.setValue(cargo[0].nhmCode);
            } else {
                nhmCode.setValue('');
            }
        }

        const dangerousGoodClass = this.trainDataGroup.get('dangerousGoodClass');
        if (!dangerousGoodClass) {
            console.error('Failed to find field: dangerousGoodClass');
        } else {
            if (cargo[0] && cargo[0].dangerousGoodClass) {
                dangerousGoodClass.setValue(cargo[0].dangerousGoodClass);
            } else {
                dangerousGoodClass.setValue('');
            }
        }

        const bzaNr = this.trainDataGroup.get('bzaNr');
        if (!bzaNr) {
            console.error('Failed to find field: bzaNr');
        } else {
            if (cargo && cargo[0]) {
                bzaNr.setValue(cargo[0].bzaNumber);
            } else {
                bzaNr.setValue('');
            }
        }

        const p2 = this.trainDataGroup.get('p2');
        if (!p2) {
            console.error('Failed to find field: p2');
        } else {
            if (cargo && cargo[0]) {
                p2.setValue(cargo[0].intermodalProfileP2);
            } else {
                p2.setValue(0);
            }
        }

        const c2 = this.trainDataGroup.get('c2');
        if (!c2) {
            console.error('Failed to find field: c2');
        } else {
            if (cargo && cargo[0]) {
                c2.setValue(cargo[0].intermodalProfileC2);
            } else {
                c2.setValue(0);
            }
        }

        const p3 = this.trainDataGroup.get('p3');
        if (!p3) {
            console.error('Failed to find field: p3');
        } else {
            if (cargo && cargo[0]) {
                p3.setValue(cargo[0].intermodalProfileP3);
            } else {
                p3.setValue(0);
            }
        }

        const c3 = this.trainDataGroup.get('c3');
        if (!c3) {
            console.error('Failed to find field: c3');
        } else {
            if (cargo && cargo[0]) {
                c3.setValue(cargo[0].intermodalProfileC3);
            } else {
                c3.setValue(0);
            }
        }

        if (cargo[0] && cargo[0]?.items && cargo[0].items.length > 0) {
            for (let i = 0; i < cargo[0].items.length; i++) {
                const detail: CargoDetail = cargo[0].items[i];
                if (detail) {
                    this.addCargoData_1(detail.nhmCode, String(detail.numberOfWagons), detail.wagonType, detail.unCode);
                }
            }
        }
    }

    protected addCargoData_1(nhmCode?: string, wagonAmount?: string, wagonType?: string, unCode?: string): void {
        if (this.trainDataGroupArray_1.length < 10) {
            this.getAdditionalCargo_1().push(this.newAdditionalCargo_1(nhmCode, wagonAmount, wagonType, unCode));
        }
    }

    private newAdditionalCargo_1(nhmCode?: string, wagonAmount?: string, wagonType?: string, unCode?: string): FormGroup {
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

    private newAdditionalCargo_2(nhmCode?: string, netWeight?: string, wagonAmount?: string, wagonType?: string, bzaNumber?: string, unCode?: string, dangerousGoodClass?: string): FormGroup {
        if (!nhmCode) nhmCode = '';
        if (!netWeight) netWeight = '';
        if (!wagonAmount) wagonAmount = '';
        if (!wagonType) wagonType = '';
        if (!bzaNumber) bzaNumber = '';
        if (!unCode) unCode = '';
        if (!dangerousGoodClass) dangerousGoodClass = '';
        const formGroup = new FormGroup({
            cargoNhmCode: new FormControl(nhmCode, [Validators.required]),
            cargoNetWeight: new FormControl(netWeight, [Validators.required]),
            cargoWagonAmount: new FormControl(wagonAmount, [Validators.required]),
            cargoWagonType: new FormControl(wagonType, [Validators.required]),
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

    protected getAdditionalCargo_1(): FormArray {
        return this.trainDataGroupArray_1;
    }

    protected getAdditionalCargo_2(): FormArray {
        return this.trainDataGroupArray_2;
    }

    protected addCargoData_2(nhmCode?: string, netWeight?: string, wagonAmount?: string, wagonType?: string, bzaNumber?: string, unCode?: string, dangerousGoodClass?: string): void {
        if (this.trainDataGroupArray_2.length < 10) {
            this.getAdditionalCargo_2().push(this.newAdditionalCargo_2(nhmCode, netWeight, wagonAmount, wagonType, bzaNumber, unCode, dangerousGoodClass));
        }
    }

    protected deleteCargoData_1(i: number): void {
        this.getAdditionalCargo_1().removeAt(i);
    }

    protected deleteCargoData_2(i: number): void {
        this.getAdditionalCargo_2().removeAt(i);
    }

    protected addShipmentData(): void {
        const group = this.fb.group({
            customerReference: new FormControl('', [Validators.maxLength(this.maxFieldLength.customerReference)]),
            shipmentDate: new FormControl('', [Validators.required, maxDateValidator(this.maxDate), minDateValidator(this.today)]),
            orderReasonAndMisc: new FormControl(''),
        });
        this.shipmentDataGroupArray.push(group);
    }

    protected removeShipmentData(index: number): void {
        this.shipmentDataGroupArray.removeAt(index);
    }
}
