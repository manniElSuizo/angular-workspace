import {AfterViewInit, ChangeDetectorRef, Component, inject, Inject, OnInit, ViewChild} from '@angular/core';
import {DBUIElementsModule} from "@db-ui/ngx-elements-enterprise/dist/lib";
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {CommonModule, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {OrderView} from "../../models/order-view";
import {OrderService} from "../../services/order.service";
import {DemandComponent} from "../common/demand/demand.component";
import {DemandView} from "../../../template/models/template-demand-view";
import {ErrorDialogService} from "../../../../shared/error-handler/service/api-error-dialog.service";
import {OrderTemplateComponent} from "../common/order-template/order-template.component";
import {provideNgxMask} from "ngx-mask";
import {collectFormErrorsWithNames} from "../../../../shared/utils/form-errors-collector";
import {Router} from "@angular/router";
import {OrderPartnersComponent} from "../common/order-partners/order-partners.component";

@Component({
    selector: 'app-modify-data',
    standalone: true,
    imports: [
        DBUIElementsModule,
        FormsModule,
        MatDialogClose,
        NgIf,
        DemandComponent,
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        OrderPartnersComponent,
        OrderTemplateComponent
    ],
    providers: [provideNgxMask({validation: true})],
    templateUrl: './order-modification.component.html',
    styleUrl: './order-modification.component.scss'
})
export class OrderModificationComponent implements OnInit, AfterViewInit {
    @ViewChild(DemandComponent) demandComponent: DemandComponent;

    action: string;
    data: OrderView;
    formGroup: FormGroup;

    partners: any;
    demand: DemandView;
    isSendButtonDisabled: boolean = false;

    private readonly ORDER_OVERVIEW_ROUTE = 'empty-wagon/empty-wagon-order-list';

    constructor(
        private orderService: OrderService,
        private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService),
        private dialogRef: MatDialogRef<OrderModificationComponent>,
        @Inject(MAT_DIALOG_DATA) data: any,
        private router: Router, // Inject Router service
        private cd: ChangeDetectorRef
    ) {
        this.initData(data);
        console.log('OrderModificationComponent initData demand', this.demand);
    }

    ngOnInit() {
        this.initForm();
    }

    ngAfterViewInit(): void {

        this.cd.detectChanges();
    }

    private initForm() {
        this.formGroup = new FormGroup({
            templateControl: new FormGroup({}),
            partnersControl: new FormGroup({}),
            demandControl: new FormGroup({})
        });
    }

    submit() {
        if (this.formGroup.valid)
            this.sendOrderModificationRequest();
    }

    sendOrderModificationRequest() {
        this.isSendButtonDisabled = true;
        this.fillData();
        this.orderService.modifyOrder(this.data.orderIdConsumer, this.demand).subscribe({
            next: (response) => {
                console.log('created response: ', response);
                this.isSendButtonDisabled = false;
                this.dialogRef.close(true);
                const queryParams = {queryParams: {searchReference: this.data.orderIdConsumer}};
                this.router.navigate([this.ORDER_OVERVIEW_ROUTE], queryParams)
                    .then(_r => console.log(queryParams));
            },
            error: err => {
                this.dialogRef.close(false);
                this.isSendButtonDisabled = false;
                this.apiErrorDialogService.openApiErrorDialog(err);
            }
        });
        console.log('sendOrderModificationRequest', this.data)
    }

    isFormValid(): boolean {
        this.formGroup.markAllAsTouched();
        if (!this.formGroup.valid)
            console.log('errors', collectFormErrorsWithNames(this.formGroup));
        return this.formGroup.valid;
    }

    fillData(): void {
        if (!this.data) return null;
        this.demandComponent.fillData(this.demand);
        console.log('fillData this.demandComponents', this.demand)
    }

    get templateControl(): FormGroup {
        return this.formGroup.get('templateControl') as FormGroup;
    }

    get partnersControl(): FormGroup {
        return this.formGroup.get('partnersControl') as FormGroup;
    }

    get demandControl(): FormGroup {
        return this.formGroup.get('demandControl') as FormGroup;
    }

    private initData(data: any) {
        console.log('OrderModificationComponent', data);
        this.action = data?.action;
        this.data = data?.order;
        this.demand = this.data.demand;
        this.partners = {
            orderer: this.data?.orderer,
            shipper: this.data?.shipper
        };

    }

}
