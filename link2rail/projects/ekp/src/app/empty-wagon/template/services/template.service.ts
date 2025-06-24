import {Injectable} from '@angular/core';
import {TemplateSummaryRequestView, TemplateSummaryResponseView} from "../models/template-symmary-view";
import {Observable} from "rxjs";

import {TemplateSummaryMappingService} from "./template-summary-mapping.service";
import {catchError, map} from "rxjs/operators";

import {HttpErrorResponse} from "@angular/common/http";
import {OrderInquiryView} from "../../order/models/order-inquiry-view";
import {TemplateMappingService} from "./template-mapping.service";
import {
    EmptyWagonOrderTemplateService,
    TemplateSummaryRequest,
    UpdateCustomerTemplateNameRequest
} from "../../api/generated";

@Injectable({
    providedIn: 'root'
})
export class TemplateService {

    constructor(
        private apiService: EmptyWagonOrderTemplateService,
        private templateSummaryMappingService: TemplateSummaryMappingService,
        private templateMappingService: TemplateMappingService
    ) {}

    searchTemplates(request: TemplateSummaryRequestView): Observable<TemplateSummaryResponseView> {
        const templateSummaryRequest: TemplateSummaryRequest = this.templateSummaryMappingService.toApiRequest(request);
        return this.apiService.searchTemplates(templateSummaryRequest).pipe(
            map(response => this.templateSummaryMappingService.fromApiResponse(response))
        );
    }

    getTemplateByName(templateName: string): Observable<OrderInquiryView> {
        return this.apiService.getTemplateByTemplateName(templateName).pipe(
            map(response => this.templateMappingService.fromApiTemplate(response)),
            catchError((error: HttpErrorResponse) => {
                console.error('Error fetching template by name:', error);
                throw error;
            })
        );
    }

    updateCustomerTemplateName(templateName: string, customerTemplateName: string): Observable<OrderInquiryView> {
        const request = {
            customerTemplateName
        } as UpdateCustomerTemplateNameRequest;
        return this.apiService.updateCustomerTemplateName(templateName, request);
    }
}
