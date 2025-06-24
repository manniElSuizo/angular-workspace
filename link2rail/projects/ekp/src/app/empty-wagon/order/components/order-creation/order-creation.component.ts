import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    inject,
    Inject,
    OnChanges,
    QueryList,
    ViewChildren
} from '@angular/core';
import {FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DBUIElementsModule} from "@db-ui/ngx-elements-enterprise/dist/lib";
import {CommonModule} from "@angular/common";
import {TrainorderPipesModule} from "../../../../trainorder/pipes/trainorder-pipes.module";
import {TranslateModule} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {DemandView} from "../../../template/models/template-demand-view";
import {OrderPartnersComponent, OrderPartnersData} from '../common/order-partners/order-partners.component';
import {OrderInquiryView} from '../../models/order-inquiry-view';
import {TemplateData} from '../../services/order-dialog.service';
import {DemandComponent} from "../common/demand/demand.component";
import {OrderService} from "../../services/order.service";
import {ErrorDialogService} from "../../../../shared/error-handler/service/api-error-dialog.service";
import {OrderTemplateComponent} from "../common/order-template/order-template.component";
import {TemplateService} from "../../../template/services/template.service";
import {provideNgxMask} from "ngx-mask";
import {collectFormErrorsWithNames} from "../../../../shared/utils/form-errors-collector";
import {Router} from "@angular/router";

export enum OrderAction {
    CREATE = 'create',
    VIEW = 'view',
    UNKNOWN = 'unknown'
}

@Component({
    selector: 'app-create-data',
    standalone: true,
    imports: [
        DBUIElementsModule,
        CommonModule,
        ReactiveFormsModule,
        TrainorderPipesModule,
        TranslateModule,
        MatDialogClose,
        DemandComponent,
        OrderPartnersComponent,
        OrderTemplateComponent
    ],
    providers: [provideNgxMask({validation: true})],
    templateUrl: './order-creation.component.html',
    styleUrl: './order-creation.component.scss'
})
export class OrderCreationComponent implements OnChanges, AfterViewInit {
    @ViewChildren(DemandComponent) demandComponents: QueryList<DemandComponent>;
    formGroup: FormGroup;
    protected loadingInProgress: boolean;
    protected isSendButtonDisabled: boolean = false;

    protected demands: DemandView[] = [];
    protected action: OrderAction;
    protected templateName: string;
    protected _partners: OrderPartnersData;
    protected data: OrderInquiryView;
    protected showWagonAmountNotValidMessage: number;

    private readonly ORDER_OVERVIEW_ROUTE = 'empty-wagon/empty-wagon-order-list';

    constructor(
        private orderService: OrderService,
        private templateService: TemplateService,
        private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService),
        private dialogRef: MatDialogRef<OrderCreationComponent>,
        @Inject(MAT_DIALOG_DATA) data: TemplateData,
        private router: Router, // Inject Router service
        private cd: ChangeDetectorRef
    ) {
        this.action = data.action;
        this.initData(data.templateView);
        this.initForm();
        this.disableControls();

    }

    ngOnChanges() {
        this.cd.detectChanges();
    }

    ngAfterViewInit(): void {
        this.cd.detectChanges();
    }

    private initForm() {
        this.formGroup = new FormGroup({
            templateControl: new FormGroup({}),
            partnersControl: new FormGroup({}),
            demandsControl: new FormArray([])
        });
        this.demands?.forEach(_demand => {this.demandsControl.push(new FormGroup({}))});
    }

    private initData(data: OrderInquiryView): void {
        if (!data) {
            this.data = null;
            return;
        }
        console.log(data);
        this.data = data;
        this.demands = this.data?.demand;
        this.templateName = this.data?.templateName;
        this._partners = {
            orderer: this.data?.orderer,
            shipper: this.data?.shipper
        }
    }

    private reset() {
        this.data = undefined;
        this.templateName = undefined;
        this.demands = [];
        this.initForm();
    }

    sendOrderCreationRequest() {
        this.isSendButtonDisabled = true;
        this.fillData();
        this.orderService.createOrder(this.data).subscribe({
            next: (response) => {
                console.log('created response: ', response);
                this.isSendButtonDisabled = false;
                this.dialogRef.close({success: true, orderId: response.orderId});
                const queryParams = {queryParams: {searchReference: response.orderId}};
                this.router.navigate([this.ORDER_OVERVIEW_ROUTE], queryParams)
                    .then(_r => console.log(queryParams));

            },
            error: err => {
                this.dialogRef.close({success: false});
                this.isSendButtonDisabled = false;
                this.apiErrorDialogService.openApiErrorDialog(err);
            }
        })
    }

    isFormValid(): boolean {
        this.formGroup.markAllAsTouched();
        if (!this.formGroup.valid)
            console.log('errors', collectFormErrorsWithNames(this.formGroup));
        return this.formGroup.valid;
    }

    submit() {
        if (this.isFormValid())
            this.sendOrderCreationRequest();
    }

    protected getDemandFormGroup(idx: number): FormGroup {
        return this.demandsControl.controls[idx] as FormGroup;
    }

    get partners(): OrderPartnersData {
        return this._partners;
    }

    get templateControl(): FormGroup {
        return this.formGroup.get('templateControl') as FormGroup;
    }

    get partnersControl(): FormGroup {
        return this.formGroup.get('partnersControl') as FormGroup;
    }

    get demandsControl(): FormArray {
        return this.formGroup.get('demandsControl') as FormArray;
    }

    onTemplateNameChange($event: any) {
        console.log('onTemplateNameChange', $event);
        this.reset();
        if (!$event) return;
        this.templateService.getTemplateByName($event).subscribe({
            next: (template: OrderInquiryView) => {
                console.log(template);
                this.initData(template);
                this.initForm();
                this.cd.detectChanges();
            },
            error: _err => {}

        });

    }

    fillData(): void {
        if (!this.data) return null;
        this.data.demand = [];
        this.demandComponents.forEach((component) =>
            this.data.demand.push(component.fillData())
        )
    }

    private disableControls() {
        if (this.action !== 'create' || !!this.templateName)
            this.templateControl.disable();
    }
}