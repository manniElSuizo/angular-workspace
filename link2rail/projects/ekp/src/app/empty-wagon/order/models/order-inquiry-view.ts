import {CustomerInformationView} from "../../common/models/customer-information-view";
import {DemandView} from "../../template/models/template-demand-view";

export interface OrderInquiryView {
    templateName: string;
    customerTemplateName?: string;
    orderer: CustomerInformationView;
    shipper?: CustomerInformationView;
    demand: Array<DemandView>;
}