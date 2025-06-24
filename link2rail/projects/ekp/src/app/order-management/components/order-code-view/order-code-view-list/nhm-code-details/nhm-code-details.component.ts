import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '@src/app/shared/shared.module';
import { RailOrderCodeSearchSummary } from '../../models/ApiRailOrderCode.model';

@Component({
  selector: 'app-nhm-code-details',
  templateUrl: './nhm-code-details.component.html',
  styleUrls: ['./nhm-code-details.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule
  ]
})
export class NhmCodeDetailsComponent {
  protected railOrderCodeSummary: RailOrderCodeSearchSummary = undefined;

  constructor(private dialogRef: MatDialogRef<NhmCodeDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: { railOrderCodeSummary: RailOrderCodeSearchSummary }) {
    console.log();
    this.railOrderCodeSummary = data['data'];
  }
}
