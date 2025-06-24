import {DemandLocationView} from "../../common/models/demand-location-view";
import {OrderDemandDateTimeView} from "../../order/models/order-demand-date-time-view";

export interface DemandView {
    demandLocation: DemandLocationView;
    demandDateTimes: Array<OrderDemandDateTimeView>
}