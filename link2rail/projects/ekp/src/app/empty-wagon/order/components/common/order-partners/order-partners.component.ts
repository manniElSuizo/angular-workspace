import {Component, Input, OnChanges} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { CustomerInformationView } from '@src/app/empty-wagon/common/models/customer-information-view';
import {TranslateModule} from "@ngx-translate/core";

export interface OrderPartnersData {
    orderer: CustomerInformationView,
    shipper: CustomerInformationView,
}

@Component({
    selector: 'app-order-partners',
    templateUrl: './order-partners.component.html',
    styleUrl: './order-partners.component.scss',
    imports: [
        TranslateModule,
        ReactiveFormsModule
    ],
    standalone: true
})
export class OrderPartnersComponent implements OnChanges {
    @Input() data: OrderPartnersData;
    @Input() formGroup: FormGroup;
    @Input() parentFormGroup: FormGroup;

    ngOnChanges(): void {
        this.createForm();
    }

    private createForm(): void {
        if (!this.formGroup) this.formGroup = new FormGroup({});
        this.formGroup.addControl('ordererSgvControl', new FormControl(this.data?.orderer?.sgvName, [Validators.required]));
        this.formGroup.addControl('ordererPartnerControl', new FormControl(this.data?.orderer?.partnerName, [Validators.required]));
        this.formGroup.addControl('shipperSgvControl', new FormControl(this.data?.shipper?.sgvName));
        this.formGroup.addControl('shipperPartnerControl', new FormControl(this.data?.shipper?.partnerName));

        this.ordererSgvControl.disable();
        this.ordererPartnerControl.disable();
        this.shipperSgvControl.disable();
        this.shipperPartnerControl.disable();
    }

    get ordererSgvControl(): FormControl {
        return this.formGroup.get('ordererSgvControl') as FormControl;
    }

    get ordererPartnerControl(): FormControl {
        return this.formGroup.get('ordererPartnerControl') as FormControl;
    }

    get shipperSgvControl(): FormControl {
        return this.formGroup.get('shipperSgvControl') as FormControl;
    }

    get shipperPartnerControl(): FormControl {
        return this.formGroup.get('shipperPartnerControl') as FormControl;
    }
}
