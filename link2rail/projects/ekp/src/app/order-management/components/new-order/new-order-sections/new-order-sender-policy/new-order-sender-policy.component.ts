import { AfterViewInit, ChangeDetectorRef, Component, inject, Injector, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SectionBase } from '../section.base';
import { SectionName } from '../../enums/order-enums';
import { HandOverTakeOverEnum, HandOverTakeOverOptions } from '../../models/new-order.model';
import { CodeNamePair } from '@src/app/order-management/models/general-order';
import { AttachedDocument, ConsignorDeclaration, initialHandoverConditions, initialTakeOverConditions, RailOrder } from '../../../../models/rail-order-api';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';
import { FormFieldService } from '../../service/form-field.service';
@Component({
    selector: 'app-new-order-sender-policy',
    templateUrl: './new-order-sender-policy.component.html',
    styleUrls: ['../../new-order-main/new-order-main.component.scss',
        './new-order-sender-policy.component.scss']
})

export class NewOrderSenderPolicyComponent extends SectionBase implements OnInit, AfterViewInit {

    @Input() currentSectionName: SectionName;
    @Input() editMode: boolean;

    protected handOverTakeOverOptions: HandOverTakeOverOptions[] = [
        { value: HandOverTakeOverEnum.takeOver, label: 'New-order.Sender-policy.Label.Takeover-conditions-takeover' },
        { value: HandOverTakeOverEnum.handOver, label: 'New-order.Sender-policy.Label.Handover-conditions-handover' }
    ];

    public formGroup: FormGroup;
    public handOverTakeOverEnum = HandOverTakeOverEnum;

    protected isHandOverConditionsVisible = false;
    protected isTakeOverConditionsVisible = false;
    protected railOrder: RailOrder;
    protected isAttachedDocumentsGroupVisible: boolean = false;
    protected isTakeOverConditionsSeaFreightGroupVisible: boolean = false;
    protected SectionName = SectionName;
    protected consignorDeclarationCodeOptions: CodeNamePair[] = [];
    protected supplementTypeList: CodeNamePair[] = [];

    private formFieldService: FormFieldService = inject(FormFieldService);
    private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);

    constructor(private injector: Injector, private formBuilder: FormBuilder, private cd: ChangeDetectorRef) {
        super();
        this.createForm();
    }

    ngOnInit(): void {
        this.loadRailorderConsignorDeclarationCodes();
        this.loadSupplementTypes();
        this.subscribeToTakeOverConditionsChanges();
    }

    ngAfterViewInit() {
        if (!this.editMode) {
            this.formGroup.disable();
        }
    }
    public updateRailOrder(ro: RailOrder) {
        this.railOrder = ro;
        this.updateConsignorDeclarationsFormArray();
        this.setFormValues();
        this.disableFields();
        this.cd.detectChanges();
    }

    private updateConsignorDeclarationsFormArray(): void {
        if (this.railOrder?.specialAnnotations?.consignorDeclarations?.length === 0 && this.consignorDeclarations?.length === 0) {
            this.addConsignorDeclaration();
        }
    }

    private disableFields() {
        this.formFieldService.disableFields(this.formGroup, 'senderPolicy', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
    }

    private subscribeToTakeOverConditionsChanges(): void {
        this.formGroup.get('takeOverConditionsTypeOfTakeOver')?.valueChanges.subscribe(value => {
            this.updateConditionVisibility(value);
        });
    }

    private subscribeToFormChanges(): void {
        this.formGroup.valueChanges.subscribe((changes) => {
            if (this.formGroup.dirty || this.formGroup.touched) {
                this.updateRailOrderFromForm(changes);
            }
        });
    }

    private updateConditionVisibility(value: number): void {
        if (value == 1) {
            this.isTakeOverConditionsVisible = true;
            this.isHandOverConditionsVisible = false;
        } else if (value == 0) {
            this.isHandOverConditionsVisible = true;
            this.isTakeOverConditionsVisible = false;
        } else {
            this.isTakeOverConditionsVisible = false;
            this.isHandOverConditionsVisible = false;
        }
    }

    private onChangeConsignorDeclarations() {
        if (!this.railOrder.specialAnnotations) {
            this.railOrder.specialAnnotations = {};
        }
        this.railOrder.specialAnnotations.consignorDeclarations = [];
        for (let i = 0; i < this.consignorDeclarations.length; i++) {
            const declaration = this.consignorDeclarations.at(i);
            const item = {
                code: (declaration.get('consignorDeclarationCode').value) ? ((declaration.get('consignorDeclarationCode').value).slice(0, declaration.get('consignorDeclarationCode').value.indexOf('#'))) : null,
                additionalInformation: declaration.get('consignorDeclarationDescription').value
            }
            this.railOrder.specialAnnotations.consignorDeclarations.push(item);
        }
    }

    // private updateSpecialAnnotations(changes: any): void {
    //     if (!this.railOrder.specialAnnotations) {
    //         this.railOrder.specialAnnotations = {};
    //     }
    //     // this.railOrder.specialAnnotations.consignorDeclarations = changes.consignorDeclarations;
    //     // this.railOrder.specialAnnotations.annotationOfConsignorDescription = changes.annotationOfConsignorDescription;
    //     // this.railOrder.specialAnnotations.additionalDeclarationOfCarrier = changes.additionalDeclarationOfCarrier;
    // }

    private updateRailOrderFromForm(changes: any): void {
        this.updateExternalReference('RAR', 'externalReferenceSender', changes);
        this.updateExternalReference('RER', 'externalReferenceReceiver', changes);

        // what is this method for??
        // this.updateSpecialAnnotations(changes);
        this.mapAttachedDocumentsToRailOrder();

        this.updateHandOverConditions(changes);
        this.updateTakeOverConditions(changes);
    }

    private updateExternalReference(type: string, field: string, changes: any): void {
        const reference = this.railOrder.externalReferences?.find(ref => ref.type === type);
        if (reference) {
            reference.identifier = changes[field];
        } else if (changes[field]) {
            this.railOrder.externalReferences.push({ type, identifier: changes[field] });
        }
    }

    private updateHandOverConditions(changes: any): void {
        if (this.hasHandOverChanges(changes)) {
            this.railOrder.handOverConditions = this.railOrder.handOverConditions || initialHandoverConditions();

            this.setHandOverDetails(changes);

            if (changes.handOverConditionsDepartureDate) {
                this.setDepartureDate(changes.handOverConditionsDepartureDate);
            }

            if (changes.handOverConditionsDepartureTime) {
                this.setDepartureTime(changes.handOverConditionsDepartureTime);
            }
        }
    }

    private updateTakeOverConditions(changes: any): void {
        if (this.hasTakeOverChanges) {
            this.railOrder.takeOverConditions = this.railOrder.takeOverConditions || initialTakeOverConditions();

            this.setTakeOverDetails(changes);

            if (changes.takeOverConditionsArrivalDate) {
                this.setArrivalDate(changes.takeOverConditionsArrivalDate);
            }

            if (changes.takeOverConditionsArrivalTime) {
                this.setArrivalTime(changes.takeOverConditionsArrivalTime);
            }
        }
    }


    // Helper methods for setting details and time
    private setHandOverDetails(changes: any): void {
        this.railOrder.handOverConditions.typeOfHandover = changes.handOverConditionsTypeOfHandOver;
        this.railOrder.handOverConditions.shipOwner = changes.handOverConditionsShipOwner;
        this.railOrder.handOverConditions.shipName = changes.handOverConditionsShipName;
        this.railOrder.handOverConditions.destinationPort = changes.handOverConditionsDestinationPort;
    }

    private setDepartureDate(departureDate: string): void {
        const newDate = new Date(departureDate);
        if (!this.railOrder.handOverConditions.departure) {
            newDate.setHours(0, 0);
        } else {
            const existingDepartureDate = new Date(this.railOrder.handOverConditions.departure);
            newDate.setHours(existingDepartureDate.getHours(), existingDepartureDate.getMinutes());
        }
        this.railOrder.handOverConditions.departure = this.formatToISOWithOffset(newDate);
    }

    private setDepartureTime(departureTime: string): void {
        const timeParts = departureTime.split(':').map(Number);
        const existingDeparture = this.railOrder.handOverConditions.departure;

        if (existingDeparture) {
            const existingDepartureDate = new Date(this.railOrder.handOverConditions.departure);
            existingDepartureDate.setHours(timeParts[0] || 0, timeParts[1] || 0);
            this.railOrder.handOverConditions.departure = this.formatToISOWithOffset(existingDepartureDate);
        } else {
            const newDate = new Date();
            newDate.setHours(timeParts[0] || 0, timeParts[1] || 0);
            this.railOrder.handOverConditions.departure = this.formatToISOWithOffset(newDate);
        }
    }

    private setTakeOverDetails(changes: any): void {
        this.railOrder.takeOverConditions.typeOfTakeover = changes.takeOverConditionsTypeOfTakeOver;
        this.railOrder.takeOverConditions.shipOwner = changes.takeOverConditionsShipOwner;
        this.railOrder.takeOverConditions.shipName = changes.takeOverConditionsShipName;
        this.railOrder.takeOverConditions.originPort = changes.takeOverConditionsOriginPort;
    }

    private setArrivalDate(arrivalDate: string): void {
        const newDate = new Date(arrivalDate);
        if (!this.railOrder.takeOverConditions.arrival) {
            newDate.setHours(0, 0);
        } else {
            const existingArrivalDate = new Date(this.railOrder.takeOverConditions.arrival);
            newDate.setHours(existingArrivalDate.getHours(), existingArrivalDate.getMinutes());
        }
        this.railOrder.takeOverConditions.arrival = this.formatToISOWithOffset(newDate);
    }

    private setArrivalTime(arrivalTime: string): void {
        const timeParts = arrivalTime.split(':').map(Number);
        const existingArrival = this.railOrder.takeOverConditions.arrival;

        if (existingArrival) {
            const existingArrivalDate = new Date(this.railOrder.takeOverConditions.arrival);
            existingArrivalDate.setHours(timeParts[0] || 0, timeParts[1] || 0);
            this.railOrder.takeOverConditions.arrival = this.formatToISOWithOffset(existingArrivalDate);
        } else {
            const newDate = new Date();
            newDate.setHours(timeParts[0] || 0, timeParts[1] || 0);
            this.railOrder.takeOverConditions.arrival = this.formatToISOWithOffset(newDate);
        }
    }

    private createForm(): void {
        this.formGroup = this.formBuilder.group({
            externalReferenceSender: new FormControl(),
            externalReferenceReceiver: new FormControl(),
            // Why are those fields here??
            // annotationOfConsignorDescription: new FormControl(),
            // additionalDeclarationOfCarrier: new FormControl(),
            consignorDeclarations: this.formBuilder.array([]),
            attachedDocuments: this.formBuilder.array([]),
            takeOverConditionsTypeOfTakeOver: new FormControl(),
            takeOverConditionsShipOwner: new FormControl(),
            takeOverConditionsShipName: new FormControl(),
            takeOverConditionsOriginPort: new FormControl(),
            takeOverConditionsArrivalDate: new FormControl(),
            takeOverConditionsArrivalTime: new FormControl(),
            handOverConditionsTypeOfHandOver: new FormControl(),
            handOverConditionsShipOwner: new FormControl(),
            handOverConditionsShipName: new FormControl(),
            handOverConditionsDestinationPort: new FormControl(),
            handOverConditionsDepartureDate: new FormControl(),
            handOverConditionsDepartureTime: new FormControl(),
        }, { updateOn: 'blur' });
        this.subscribeToFormChanges();
    }

    protected toggleAttachedDocumentsGroupVisibility() {
        this.isAttachedDocumentsGroupVisible = !this.isAttachedDocumentsGroupVisible;
    }

    protected toggleTakeOverConditionsSeaFreightGroupVisibiliy() {
        this.isTakeOverConditionsSeaFreightGroupVisible = !this.isTakeOverConditionsSeaFreightGroupVisible;
    }

    private setFormValues() {
        this.setExternalReferenceSender();
        this.setExternalReferenceReceiver();
        this.setFormValuesSpecialAnnotations();
        this.setFormValuesAttachedDocument()
        this.setFormValuesTakeOverConditions();
        this.setFormValuesHandOverConditions();
    };

    private setFormValuesSpecialAnnotations(): void {
        const { specialAnnotations } = this.railOrder ?? {};
        if (specialAnnotations?.consignorDeclarations?.length > 0) {
            this.consignorDeclarations.clear();
            specialAnnotations?.consignorDeclarations?.forEach(declaration => {
                this.consignorDeclarations.push(this.createConsignorDeclaration(declaration), {emitEvent: false});
            });
        }
        // this.additionalDeclarationOfCarrier?.setValue(specialAnnotations?.additionalDeclarationOfCarrier);
    }

    private getConsignorDeclarationCodeByCode(code) {
        const item = this.consignorDeclarationCodeOptions.find(obj => obj.code == code);
        return item ? `${item.code}#${item.shortName}` : null;
    }

    private setFormValuesTakeOverConditions(): void {
        if (!this.railOrder.takeOverConditions && !this.railOrder.handOverConditions) {
            this.railOrder.takeOverConditions = initialTakeOverConditions();
        }
        if (!(Object.keys(this.railOrder.takeOverConditions).length > 0)) {
            this.takeOverConditionsTypeOfTakeOver.setValue(0);
        }
        if (!this.railOrder.takeOverConditions) return;

        const arrivalDate = this.railOrder.takeOverConditions.arrival;
        if (arrivalDate) {
            const formattedDate = this.formatIsoDate(arrivalDate);
            if (formattedDate) {
                this.takeOverConditionsArrivalDate.setValue(formattedDate.date);
                this.takeOverConditionsArrivalTime.setValue(formattedDate.time);
            } else {
                console.error('Invalid date format for takeOverConditions.arrival:', arrivalDate);
            }
        }

        this.takeOverConditionsOriginPort.setValue(this.railOrder.takeOverConditions.originPort || '');
        this.takeOverConditionsShipName.setValue(this.railOrder.takeOverConditions.shipName || '');
        this.takeOverConditionsShipOwner.setValue(this.railOrder.takeOverConditions.shipOwner || '');
        this.takeOverConditionsTypeOfTakeOver.setValue(this.railOrder.takeOverConditions.typeOfTakeover || HandOverTakeOverEnum.takeOver);
    }
    private setFormValuesHandOverConditions(): void {
        if (!this.railOrder.handOverConditions) return;
        if (!this.railOrder.handOverConditions?.typeOfHandover ||
            this.railOrder.handOverConditions.typeOfHandover === HandOverTakeOverEnum.handOver) {
            this.takeOverConditionsTypeOfTakeOver.setValue(HandOverTakeOverEnum.handOver);
        }

        const _isoDate = this.railOrder?.handOverConditions?.departure;
        if (_isoDate !== undefined && _isoDate !== null) {
            const isoDate = String(_isoDate);
            if (isoDate) {
                const date = new Date(isoDate.replace("+0000", "Z"));
                if (!isNaN(date.getTime())) {  // Check if valid date
                    const formattedDate = date.toISOString().slice(0, 10);
                    this.handOverConditionsDepartureDate.setValue(formattedDate);
                    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    this.handOverConditionsDepartureTime.setValue(formattedTime);
                } else {
                    console.error('Invalid date format:', isoDate);
                }
            }
        }

        this.handOverConditionsDestinationPort.setValue(this.railOrder?.handOverConditions?.destinationPort || '');
        this.handOverConditionsShipName.setValue(this.railOrder?.handOverConditions?.shipName || '');
        this.handOverConditionsShipOwner.setValue(this.railOrder?.handOverConditions?.shipOwner || '');
        const typeOfHandover = this.railOrder?.handOverConditions?.typeOfHandover ?? HandOverTakeOverEnum.handOver;
        this.handOverConditionsTypeOfHandOver.setValue(typeOfHandover);
        if (this.railOrder?.handOverConditions) {
            this.railOrder.handOverConditions.typeOfHandover = typeOfHandover;
        }
    }

    private formatToISOWithOffset(date: Date) {
        const pad = (num) => String(num).padStart(2, '0');
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());

        // Format as "YYYY-MM-DDTHH:mm:ss+0000"
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+0000`;
    }

    private formatIsoDate(isoDate: string): { date: string; time: string } | null {
        const date = new Date(String(isoDate).replace('+0000', 'Z'));
        if (isNaN(date.getTime())) return null;

        const formattedDate = date.toISOString().slice(0, 10);
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        return { date: formattedDate, time: formattedTime };
    }

    public onChangeOrder(): void {

    }

    private loadRailorderConsignorDeclarationCodes(): void {
        this.railOrderInternalService.getConsignorDeclarations().subscribe({
            next: (data: CodeNamePair[]) => {
                this.consignorDeclarationCodeOptions = data;
            },
            error: (error) => {
                console.error('Error loading RailorderConsignorDeclarationCodes', error);
            }
        });
    }

    private loadSupplementTypes(): void {
        this.railOrderInternalService.getSupplementTypes().subscribe({

            next: (data: CodeNamePair[]) => {
                this.supplementTypeList = data;
            },
            error: (error) => {
                console.error('Error loading SublementTypes', error);
            }
        });
    }

    private setExternalReferenceSender() {
        this.externalReferenceSender?.setValue(null);
        const senderReference = this.railOrder.externalReferences.find(ref => ref.type === 'RAR');
        if (senderReference) {
            this.formGroup.get('externalReferenceSender')?.setValue(senderReference.identifier);
        }
    }

    private setExternalReferenceReceiver(): void {
        this.externalReferenceReceiver?.setValue(null);
        const receiverReference = this.railOrder.externalReferences.find(ref => ref.type === 'RER');
        if (receiverReference) {
            this.formGroup.get('externalReferenceReceiver')?.setValue(receiverReference.identifier);
        }
    }

    private setFormValuesAttachedDocument() {
        if (this.railOrder?.attachedDocuments?.length === 0 && this.attachedDocuments?.length === 0) {
            this.addAttachedDocument(null);
            return;
        }

        const { attachedDocuments } = this.railOrder ?? {};

        if (attachedDocuments?.length > 0) {
            this.attachedDocuments.clear()
            attachedDocuments.forEach(document => {
                this.addAttachedDocument(document, false);
            });
        }

    }

    private createAttachedDocument(document?: AttachedDocument): FormGroup {
        return this.formBuilder.group({
            attachedDocumentCode: new FormControl(document?.code),
            attachedDocumentDescription: new FormControl(document?.description),
            attachedDocumentDateOfIssue: new FormControl(document?.dateOfIssue),
            attachedDocumentNumberOfOriginals: new FormControl(document?.numberOfOriginals),
            attachedDocumentReferenceNumber: new FormControl(document?.referenceNumber)
        });
    }

    protected addAttachedDocument(attachedDomunent: AttachedDocument, emitEvent: boolean = true): void {
        if (this.attachedDocuments?.length < 10) {
            this.attachedDocuments?.push(this.createAttachedDocument(attachedDomunent));
            if (emitEvent) {
                this.mapAttachedDocumentsToRailOrder();
            }
        } else {
            console.log('Only 10 attached documents are allowed.');
        }
    }

    protected removeAttachedDocument(attachedDocumentAtIndex: number): void {
        if (this.attachedDocuments.length > 0) {
            this.attachedDocuments.removeAt(attachedDocumentAtIndex, { emitEvent: false });
            this.mapAttachedDocumentsToRailOrder();
        }
    }

    private mapAttachedDocumentsToRailOrder(): void {
        const attachedDocuments: AttachedDocument[] = this.attachedDocuments?.value.map((doc) => ({
            code: doc.attachedDocumentCode,
            description: doc.attachedDocumentDescription,
            dateOfIssue: doc.attachedDocumentDateOfIssue,
            numberOfOriginals: doc.attachedDocumentNumberOfOriginals,
            referenceNumber: doc.attachedDocumentReferenceNumber
        }));

        this.railOrder.attachedDocuments = attachedDocuments;
    }

    public get attachedDocuments(): FormArray {
        return this.formGroup.get('attachedDocuments') as FormArray;
    }

    public get consignorDeclarations(): FormArray {
        return this.formGroup.get('consignorDeclarations') as FormArray;
    }

    // public get annotationOfConsignorDescription(): FormControl {
    //     return this.formGroup.get('annotationOfConsignorDescription') as FormControl;
    // }

    // public get additionalDeclarationOfCarrier(): FormControl {
    //     return this.formGroup.get('additionalDeclarationOfCarrier') as FormControl;
    // }

    private createConsignorDeclaration(consignorDeclaration?: ConsignorDeclaration): FormGroup {
        return this.formBuilder.group({
            consignorDeclarationCode: new FormControl(this.getConsignorDeclarationCodeByCode(consignorDeclaration?.code)),
            consignorDeclarationDescription: new FormControl(consignorDeclaration?.additionalInformation),
        });
    }

    protected addConsignorDeclaration(consignorDeclaration?: ConsignorDeclaration): void {
        if (this.consignorDeclarations?.length < 5) {
            this.consignorDeclarations?.push(this.createConsignorDeclaration(consignorDeclaration));
        } else {
            console.log('Only 5 consignor declarations are allowed.');
        }
    }

    protected removeConsignorDeclaration(index: number): void {
        if (this.consignorDeclarations?.length > 1) {
            this.consignorDeclarations?.removeAt(index);
        }
        this.onChangeConsignorDeclarations();
        this.formGroup.updateValueAndValidity();
    }

    public get handOverConditionsTypeOfHandOver(): FormControl {
        return this.formGroup.get('handOverConditionsTypeOfHandOver') as FormControl;
    }

    public get handOverConditionsShipOwner(): FormControl {
        return this.formGroup.get('handOverConditionsShipOwner') as FormControl;
    }

    public get handOverConditionsShipName(): FormControl {
        return this.formGroup.get('handOverConditionsShipName') as FormControl;
    }

    public get handOverConditionsDestinationPort(): FormControl {
        return this.formGroup.get('handOverConditionsDestinationPort') as FormControl;
    }

    public get handOverConditionsDepartureDate(): FormControl {
        return this.formGroup.get('handOverConditionsDepartureDate') as FormControl;
    }

    public get handOverConditionsDepartureTime(): FormControl {
        return this.formGroup.get('handOverConditionsDepartureTime') as FormControl;
    }

    public get takeOverConditionsTypeOfTakeOver(): FormControl {
        return this.formGroup.get('takeOverConditionsTypeOfTakeOver') as FormControl;
    }

    public get takeOverConditionsShipOwner(): FormControl {
        return this.formGroup.get('takeOverConditionsShipOwner') as FormControl;
    }

    public get takeOverConditionsShipName(): FormControl {
        return this.formGroup.get('takeOverConditionsShipName') as FormControl;
    }

    public get takeOverConditionsOriginPort(): FormControl {
        return this.formGroup.get('takeOverConditionsOriginPort') as FormControl;
    }

    public get takeOverConditionsArrivalDate(): FormControl {
        return this.formGroup.get('takeOverConditionsArrivalDate') as FormControl;
    }

    public get takeOverConditionsArrivalTime(): FormControl {
        return this.formGroup.get('takeOverConditionsArrivalTime') as FormControl;
    }

    public get externalReferenceSender(): FormControl {
        return this.formGroup.get('externalReferencSender') as FormControl;
    }

    public get externalReferenceReceiver(): FormControl {
        return this.formGroup.get('externalReferencReceiver') as FormControl;
    }

    public validate(): string[] {
        return [];
    }

    private hasHandOverChanges(changes): boolean {
        return changes.handOverConditionsShipOwner?.length ||
            changes.handOverConditionsShipName?.length ||
            changes.handOverConditionsDestinationPort?.length ||
            changes.handOverConditionsDepartureDate?.length ? true : false;
    }

    private hasTakeOverChanges(changes): boolean {
        return changes.takeOverConditionsShipOwner?.length ||
            changes.takeOverConditionsShipName?.length ||
            changes.takeOverConditionsOriginPort?.length ||
            changes.takeConditionsArrivalDate?.length ? true : false;
    }

    protected isConsignorDeclarationObligatory(index: number) {
        const consignorDeclarations = this.formGroup.get('consignorDeclarations') as FormArray
        const consignorDeclarationsControl = consignorDeclarations?.at(index)
        const consignorDeclarationCodeContol = consignorDeclarationsControl.get('consignorDeclarationCode')
        const consignorDeclarationDescriptionControl = consignorDeclarationsControl.get('consignorDeclarationDescription')
        const consignorDeclarationsValue = consignorDeclarationCodeContol?.value ? consignorDeclarationCodeContol?.value : null;
        if (consignorDeclarationsValue) {
            const arr = consignorDeclarationsValue.split('#');
            const value = arr[1];
            if (value == 'N') {
                consignorDeclarationDescriptionControl.disable({emitEvent: false});
                consignorDeclarationDescriptionControl.setValue(null, {emitEvent: false});
            }
            else {
                consignorDeclarationDescriptionControl.enable({emitEvent: false})
            }
        }
        else {
            consignorDeclarationDescriptionControl.enable({emitEvent: false})
        }
        this.onChangeConsignorDeclarations();
    }

    protected onBlurConsignorDeclarationDescription(idx: number): void {
        this.onChangeConsignorDeclarations();
    }
}


