import {Component} from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { OrderProgramUploadResponse } from '@src/app/trainorder/models/file-upload';
import {ModalWindows} from '../modal-windows/modal-windows';
import {FileUploadService} from './file-upload.service';
import {HttpErrorResponse} from "@angular/common/http";
import { ApiError, ApiProblem } from '@src/app/trainorder/models/ApiModels';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    standalone: true,
    imports: [TranslateModule]
})
export class FileUploadComponent {
    fileName = '';
    file: File;
    protected loadingInProgress: boolean = false;

    constructor(private modalWindows: ModalWindows, private translation: TranslateService, private fileUploadService: FileUploadService) {
    }

    onFileSelected(event: any) {
        this.file = event.target.files[0];
        if (this.file) {
            this.fileName = this.file.name;
            if (this.fileName.length > 30) {
                this.fileName = this.fileName.substring(0, 30) + "...";
            }
            console.log("file", this.file);
            document.querySelectorAll<HTMLElement>('#uploadButton').forEach(el => {
                el.removeAttribute("disabled");
            });
        }
    }

    uploadFile(ignore: any) {
        this.loadingInProgress = true;
        if (this.file) {
            this.fileName = this.file.name;

            this.fileUploadService.uploadMonthWeekProgram(this.file).subscribe((result: OrderProgramUploadResponse) => {
                this.handleUploadResponse(result);
            }, (error: HttpErrorResponse) => {
                const err: ApiProblem = {...error.error};
                this.handleErroneousResponse(err);
            });
        }
    }

    handleUploadResponse(result: OrderProgramUploadResponse) {
        console.log("result", result);
        // close modal and show confirmation-display modal (ConfirmationDisplayComponent)
        this.modalWindows.openConfirmationDialog(this.translation.instant('Shared.File-upload-success'), 3);
        this.loadingInProgress = false;
    }

    private handleErroneousResponse(response: ApiProblem) {
        this.modalWindows.closeAllModalWindows();

        if (response.errors !== null && response.errors?.length !== 0) {
            let errorArray: ApiError[] = [];
            response.errors?.forEach(error => {
                // format of field in this case: "{line nbr}-{field}", line-nbr starting by 0
                const lineAndField = error.field.split("-");
                errorArray.push({
                    errorCode: error.errorCode, detail: `Line: ${lineAndField[0] + 1} ${error.detail}`,
                    field: lineAndField[1], title: error.title
                });
            });

            this.modalWindows.openErrorDialog({errors: errorArray});
            this.loadingInProgress = false;
            return;
        }

        // show errors in confirmation modal
        this.modalWindows.openErrorDialog({text: this.translation.instant("Shared.Errors.General-technical-error")});
        this.loadingInProgress = true;
    }
}
