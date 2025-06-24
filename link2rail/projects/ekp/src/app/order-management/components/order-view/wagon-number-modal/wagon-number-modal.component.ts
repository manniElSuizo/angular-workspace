import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { SharedModule } from "@src/app/shared/shared.module";
import { RailOrderSearchSummary } from "@src/app/trainorder/models/ApiRailOrder.model";

@Component({
  selector: 'app-wagon-number-modal',
  templateUrl: './wagon-number-modal.component.html',
  styleUrls: ['./wagon-number-modal.component.scss'],
  standalone: true,
  imports: [
      SharedModule,
      MatDialogModule
  ]
})
export class WagonNumberModalComponent {

  protected railOrder: RailOrderSearchSummary;
  public formattedWagonNumbers: string = '';  // This will hold the formatted wagon numbers

  constructor(@Inject(MAT_DIALOG_DATA) public param: RailOrderSearchSummary,
              private dialogRef: MatDialogRef<WagonNumberModalComponent>) {
    this.railOrder = param;
  }

  ngOnInit(): void {
    this.populateWagonNumbers();
  }

  protected closeDialog() {
    this.dialogRef.close();
  }

  protected getZabOrderNumber(): string {
    if (this.railOrder) {
      return String(this.railOrder.orderKey.orderNumber);
    }
    return '';
  }

  protected getRailorderAuthority(): string {
    if (this.railOrder) {
      return String(this.railOrder.orderKey.orderAuthority);
    }
    return '';
  }

  private formatWagonNumber(value: string | null): string {
    let output = (!value) ? null : (value + '').replace(/[^0-9]/g, '').slice(0, 12);
    if (output) {
      return output.replace(/^(\d{4})(\d{4})(\d{3})(\d{1})$/g, '$1 $2 $3-$4');
    }
    return "";
  }

  // Format the wagon numbers and set them to the formattedWagonNumbers property
  protected populateWagonNumbers(): void {
    if (this.railOrder && this.railOrder.wagonNumbers && this.railOrder.wagonNumbers.length > 0) {
      this.formattedWagonNumbers = this.railOrder.wagonNumbers
        .map(wagonNumber => this.formatWagonNumber(wagonNumber))
        .join('\n');  // Join wagon numbers with a newline
    } else {
      this.formattedWagonNumbers = 'No wagon number found';
    }
  }
}
