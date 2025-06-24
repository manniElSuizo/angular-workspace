import {CustomerInformationView} from "../../common/models/customer-information-view";
import {DemandView} from "../../template/models/template-demand-view";

export interface OrderView {
    orderId: string;
    orderIdConsumer?: string;
    internalOrderNumber?: string;
    templateName?: string;
    orderer: CustomerInformationView;
    shipper?: CustomerInformationView;
    status: string;
    origin: string;
    demand: DemandView;
}

export interface OrderStatusHistoryView {
    orderIdConsumer?: string;
    history: Array<StatusHistoryView>;

}

export interface StatusHistoryView {
    status: string;
    dateTime: Date;
}
