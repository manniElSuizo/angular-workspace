import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '@src/app/shared/shared.module';
import { TrainIdentifier, TrainSummary } from '@src/app/trainorder/models/ApiTrainsList.models';

@Component({
  selector: 'app-cancellation-confirmation-roundtrip',
  templateUrl: './cancellation-confirmation-roundtrip.component.html',
  styleUrl: './cancellation-confirmation-roundtrip.component.scss',
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule
  ]
})
export class CancellationConfirmationRoundtripComponent {
  protected nextTrainToCancel: TrainIdentifier;

  constructor(@Inject(MAT_DIALOG_DATA) data: { nextTrainToCancel: TrainIdentifier }, private dialogRef: MatDialogRef<CancellationConfirmationRoundtripComponent>) {
    this.nextTrainToCancel = data.nextTrainToCancel;
  }

  protected closeConfirmation() {
    this.dialogRef.close(false);
  }
  protected doCancel() {
    this.dialogRef.close(true);
  }
}
