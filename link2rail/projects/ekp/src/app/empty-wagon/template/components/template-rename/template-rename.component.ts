import {Component, inject, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {SharedModule} from "../../../../shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {FormControl, FormGroup} from "@angular/forms";
import {TemplateService} from "../../services/template.service";
import {ErrorDialogService} from "../../../../shared/error-handler/service/api-error-dialog.service";

@Component({
    selector: 'app-template-rename',
    standalone: true,
    imports: [
        MatDialogClose,
        SharedModule,
        TranslateModule
    ],
    templateUrl: './template-rename.component.html',
    styleUrl: './template-rename.component.scss'
})
export class TemplateRenameComponent implements OnInit {
    templateName: string;
    customerTemplateName: string;
    protected formGroup: FormGroup;
    protected isSendButtonDisabled: boolean;

    constructor(
        private templateService: TemplateService,
        private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService),
        private dialogRef: MatDialogRef<TemplateRenameComponent>,
        @Inject(MAT_DIALOG_DATA) data: any
    ) {
        console.log('OrderCreationComponent', data);
        this.templateName = data.templateName;
        this.customerTemplateName = data?.customerTemplateName;
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            customerTemplateNameControl: new FormControl(this.customerTemplateName)
        });
    }

    submit() {
        this.isSendButtonDisabled = true;
        this.templateService.updateCustomerTemplateName(this.templateName, this.customerTemplateNameControl.value)
            .subscribe({
                next: (_response) => {
                    this.isSendButtonDisabled = false;
                    this.dialogRef.close(true);
                },
                error: err => {
                    this.dialogRef.close(false);
                    this.isSendButtonDisabled = false;
                    this.apiErrorDialogService.openApiErrorDialog(err);
                }
            })
    }

    get customerTemplateNameControl(): FormControl {
        return this.formGroup.get('customerTemplateNameControl') as FormControl;
    }
}