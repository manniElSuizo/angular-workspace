import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiError, ApiProblem } from '@src/app/trainorder/models/ApiModels';
import { ErrorData } from './ErrorData';
import { SharedModule } from '../../shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-api-error',
  templateUrl: './api-error.component.html',
  styleUrls: ['./api-error.component.scss'],
  imports: [
    CommonModule,
    SharedModule
  ],
  standalone: true
})
export class ErrorDialogComponent {
  errorText?: string;
  apiErrors?: ApiError[];
  apiProblem?: ApiProblem;
  instance?: string;
  text?: string;

  constructor(private dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ErrorData) {
    this.errorText = data.text?.split(" | ").join("\n");
    this.apiProblem = data.apiProblem;
    this.apiErrors = data.apiProblem?.errors;
    this.instance = data.apiProblem?.instance?.substring(9,500);
    this.text = data.text;
  }

  protected close() {
    this.dialogRef.close();
  }
}
