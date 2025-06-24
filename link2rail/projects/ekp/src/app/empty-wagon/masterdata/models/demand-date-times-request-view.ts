import {DemandLocationView} from "../../common/models/demand-location-view";
import {
    EmptyWagonOrderInternalMasterdataService
} from "../../api/generated/api/empty-wagon-order-internal-masterdata.service";

export interface DemandDateTimesRequestView {


    demandDate: Date;

    demandLocation: DemandLocationView;
}