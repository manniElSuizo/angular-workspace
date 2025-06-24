import { Component, inject, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RailOrderCodeSearchSummary } from '../models/ApiRailOrderCode.model';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '@src/app/shared/shared.module';
import { RailOrderService } from '@src/app/order-management/service/rail-order.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';

@Component({
  selector: 'app-order-template-rename',
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule
  ],
  templateUrl: './order-template-rename.component.html',
  styleUrl: './order-template-rename.component.scss'
})
export class OrderTemplateRenameComponent {
  protected dialogTitle: string = '';
  protected orderTemplateSummary: RailOrderCodeSearchSummary;
  protected formGroup: FormGroup;

  private railOrderService:RailOrderService = inject(RailOrderService);
    private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);

  constructor(
      private dialogRef: MatDialogRef<OrderTemplateRenameComponent>,
      @Inject(MAT_DIALOG_DATA) private orderTemplate: RailOrderCodeSearchSummary) {
    this.dialogTitle = orderTemplate.templateNumber + (orderTemplate.templateName ? ' | ' + orderTemplate.templateName : '');
    this.orderTemplateSummary = orderTemplate;

    this.formGroup = new FormGroup({'templateName': new FormControl(this.orderTemplateSummary.templateName, Validators.maxLength(50))});
  }

  protected rename(): void {
    if(this.formGroup.valid) {
      this.railOrderService.railOrderTemplatesRename(this.orderTemplateSummary.templateNumber, this.formGroup.get('templateName').value).subscribe({
        next: () => {
          this.dialogRef.close('refresh');
        },
        error: err => {
          this.dialogRef.close(false);
          this.apiErrorDialogService.openApiErrorDialog(err);
        }
      });
    }
  }

  protected get templateName() {
    return this.formGroup.get('templateName') as FormControl;
  }
}
