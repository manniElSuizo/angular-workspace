import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DBUIElementsModule } from '@db-ui/ngx-elements-enterprise/dist/lib';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiError, ApiProblem } from '@src/app/trainorder/models/ApiModels';

@Component({
  selector: 'app-generic-error',
  standalone: true,
  imports: [CommonModule, TranslateModule, DBUIElementsModule],
  templateUrl: './generic-error.component.html',
  styleUrl: './generic-error.component.scss'
})
export class GenericErrorComponent {
  @ViewChild("arrowIcon") arrowIcon: ElementRef;
  @ViewChild("errorList") errorList: ElementRef;

  protected errorText?: string;
  protected apiErrors?: ApiError[];
  protected apiProblem?: ApiProblem;
  protected instance?: string;
  protected text?: string = null;
  protected message?: string;

  protected isApiError: boolean = false;
  protected httpErrorStatus: number = null;

  protected showGenericError: boolean = false;

  private translate: TranslateService = inject(TranslateService);
  constructor(private dialogRef: MatDialogRef<GenericErrorComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.isApiError = data.error?.title && data.error?.errorCode;
    this.httpErrorStatus = data.error?.status;
    this.httpErrorStatus = this.httpErrorStatus || data.status || null;

    if(this.httpErrorStatus == 401 || this.httpErrorStatus == 403 || (this.httpErrorStatus == 404 && !this.isApiError)) {
        this.text = this.translate.instant('Shared.Errors.' + this.httpErrorStatus);
        this.showGenericError = true;
    } else if (this.httpErrorStatus >= 500) {
        this.text = this.translate.instant('Shared.Errors.Generic');
        this.showGenericError = true;
    }

    if (this.isApiError && !this.showGenericError) {
      if (this.httpErrorStatus >= 400) {
        this.apiProblem = data.error;
        this.apiErrors = this.apiProblem.errors;
      }
    } else if(!this.text) {
      // this.parseError(data)
      this.showGenericError = true;
      this.text = this.translate.instant('Shared.Errors.Generic');
    }
  }

  private parseError(data) {
    this.apiErrors = [];
    if (data.error?.statusText) {
      this.text = data.error.statusText;
    }
    if (data.error?.message) {
      this.text = data.error.message;
    }
    if(data.status) {
      this.httpErrorStatus = data.status;
    }
    if(data.message) {
      this.message = data.message;
    }
    if(data.statusText) {
      this.text = data.statusText;
      this.apiErrors.push({detail: data.url ? data.message : data.url, errorCode: data.status, field: null, title: data.statusText});
    }
  }

  protected close() {
    this.dialogRef.close();
  }

  protected openDetails() {
      this.arrowIcon.nativeElement.classList.toggle('arrow-up');
      this.errorList.nativeElement.classList.toggle('errors-list-show');
  }
}
