import {Injectable} from '@angular/core';
import {CommonMappingService} from "../../common/services/common-mapping.service";
import {
    TemplateSummaryRequestView,
    TemplateSummaryResponseView,
    TemplateSummaryView
} from "../models/template-symmary-view";
import {TemplateSummaryRequest} from "../../api/generated/model/template-summary-request";
import {TemplateSummaryResponse} from "../../api/generated/model/template-summary-response";
import {TemplateSummary} from "../../api/generated/model/template-summary";

@Injectable({
    providedIn: 'root'
})
export class TemplateSummaryMappingService {

    constructor(
        private commonMapping: CommonMappingService
    ) {
    }

    public fromApiResponse(source: TemplateSummaryResponse): TemplateSummaryResponseView {
        const {offset, total, summaries, limit} = source;
        return {
            items: summaries.map(value => this.mapOrderSummaryToOrderSummaryView(value)),
            limit,
            offset,
            total
        }
    }

    public toApiRequest(source: TemplateSummaryRequestView): TemplateSummaryRequest {
        return {...source};
    }

    private mapOrderSummaryToOrderSummaryView(suorce: TemplateSummary): TemplateSummaryView {
        const {
            templateName,
            customerTemplateName,
            orderer,
            shipper,
            isReadOnly,
        } = suorce;

        return {
            templateName,
            customerTemplateName,
            orderer: this.commonMapping.fromApiCustomerInformation(orderer),
            shipper: this.commonMapping.fromApiCustomerInformation(shipper),
            isReadOnly
        } as TemplateSummaryView

    }

}
