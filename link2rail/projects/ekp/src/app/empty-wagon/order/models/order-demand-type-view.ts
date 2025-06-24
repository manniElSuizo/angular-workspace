import {DemandWagonTypeView} from "../../common/models/demand-wagon-type-view";
import {NHMView} from "../../common/models/nhm-view";
import {CommercialLocationView} from "../../common/models/commercial-location-view";
import {TransitRailwayUndertakingView} from "../../common/models/transit-railway-undertaking-view";

export interface OrderDemandTypeView {

    demandWagonType: DemandWagonTypeView;
    nhm?: NHMView;
    loadRunLocation?: CommercialLocationView;
    transitRailwayUndertaking?: TransitRailwayUndertakingView;
    maxNumberOfWagons?: number;
    numberOfWagonsOrdered: number;
    numberOfWagonsDisposed?: any | null;
    customerReference?: string;
    commentToCustomerService?: string;
    commentDisponent?: string;
    assessment?: boolean;
    shipperAuthorization?: boolean;
}