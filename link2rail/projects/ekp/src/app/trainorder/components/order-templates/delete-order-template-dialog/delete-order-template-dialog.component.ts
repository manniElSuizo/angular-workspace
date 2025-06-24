import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import { SharedModule } from '@src/app/shared/shared.module';

@Component({
    selector: 'app-delete-order-template-dialog',
    templateUrl: './delete-order-template-dialog.component.html',
    styleUrls: ['./delete-order-template-dialog.component.scss'],
    standalone: true,
    imports: [
        SharedModule,
        MatDialogModule
    ]
})
export class DeleteOrderTemplateDialogComponent implements OnInit {
    templateId: string;

    constructor(
        private dialogRef: MatDialogRef<DeleteOrderTemplateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) templateNum: string
    ) {
        this.templateId = templateNum;
    }

    ngOnInit(): void {
    }

    public onConfirmationClick() {
        this.dialogRef.close(true);
    }

    public onDiscardClick() {
        this.dialogRef.close(false);
    }
}
