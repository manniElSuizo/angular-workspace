import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ErrorData } from '../api-error/ErrorData';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-api-info',
  templateUrl: './api-info.component.html',
  styleUrls: ['./api-info.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule
  ]
})
export class ApiInfoComponent {
  errorText?: string;

  constructor(private dialogRef: MatDialogRef<ApiInfoComponent>,
    @Inject(MAT_DIALOG_DATA) data: ErrorData) {
    this.errorText = data.text;
  }

}
