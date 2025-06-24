import { Injectable } from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import { ApiError, ApiProblem } from '@src/app/trainorder/models/ApiModels';

@Injectable({
    providedIn: 'root',
})
export class ErrorProcessingService {

    public extractMessage(response: HttpErrorResponse) : string {
        if (ErrorProcessingService.isApiProblem(response.error)) {
            return this.extractMessageApiProblem(response.error);
        } else {
            return this.extractMessageHttpErrorResponse(response);
        }
    }

    private extractMessageApiProblem(response: ApiProblem) : string {
        const arr: string[] = [];
        arr.push(response.detail)
        if (response?.errors) {
            response.errors.forEach((e: ApiError) => arr.push("- " + e.field + ": " + e.detail));
        }
        return arr.join(" | ");
    }

    private extractMessageHttpErrorResponse(response: HttpErrorResponse) : string {
        let message: string;
        if (response?.error.errors) {
            const arr: string[] = [];
            response.error.errors.forEach((e: Error) => arr.push(e.message));
            message = arr.join(" | ");
        } else {
            message = response.error.message;
        }
        return message;
    }

    private static isApiProblem(obj: any) : obj is ApiProblem {
        return 'errorCode' in obj && 'status' in obj && 'detail' in obj && 'instance' in obj;
    }
}
