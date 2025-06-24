import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '@src/app/shared/shared.module';

@Component({
  selector: 'app-confirmation-dialog-template',
  templateUrl: './confirmation-dialog-template.component.html',
  styleUrls: ['./confirmation-dialog-template.component.scss'],
    standalone: true,
    imports: [
        SharedModule
    ]
})
export class ConfirmationDialogTemplateComponent {

  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { headerText: string, bodyText: string }
    ){
    console.log('data', data);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
