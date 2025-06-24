import {Injectable} from "@angular/core";
import {
    CommercialLocation,
    DemandLocation,
    DemandWagonType,
    FreightWagonLocation,
    IdNameType
} from "../../api/generated";
import {CommercialLocationView} from "../models/commercial-location-view";
import {DemandWagonTypeView} from "../models/demand-wagon-type-view";
import {IdNameTypeView} from "../models/id-name-type-view";
import {CustomerInformationView} from "../models/customer-information-view";
import {DemandLocationView} from "../models/demand-location-view";
import {FreightWagonLocationView} from "../models/freight-wagon-location-view";
import {NHMView} from "../models/nhm-view";
import {TransitRailwayUndertakingView} from "../models/transit-railway-undertaking-view";
import {CustomerInformation} from "../../api/generated/model/customer-information";
import {NHM} from "../../api/generated/model/nhm";
import {TransitRailwayUndertaking} from "../../api/generated/model/transit-railway-undertaking";
import {Status} from "../../api/generated/model/status";
import {OrderStatusTranslations, OrderStatusViewEnum} from "../../order/enums/order-status-view.enum";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
    providedIn: "root",
})
export class CommonMappingService {
    constructor(
        private translate: TranslateService,
    ) {}

    // From API to View
    public fromApiCommercialLocation(source: CommercialLocation): CommercialLocationView {
        return this.mapObject(source) as CommercialLocationView;
    }

    public fromApiDemandWagonType(source: DemandWagonType): DemandWagonTypeView {
        return this.mapObject(source) as DemandWagonTypeView;
    }

    public fromApiIdNameType(source: IdNameType): IdNameTypeView {
        return this.mapObject(source) as IdNameTypeView;
    }

    public fromApiCustomerInformation(source: CustomerInformation): CustomerInformationView {
        return this.mapObject(source) as CustomerInformationView;
    }

    public fromApiDemandLocation(source: DemandLocation): DemandLocationView {
        return {
            commercialLocation: this.fromApiCommercialLocation(source.commercialLocation),
            freightWagonLocation: this.fromApiFreightWagonLocation(source.freightWagonLocation)
        } as DemandLocationView;
    }

    public fromApiFreightWagonLocation(source: FreightWagonLocation): FreightWagonLocationView {
        return this.mapObject(source) as FreightWagonLocationView;
    }

    public fromApiNHM(source: NHM): NHMView {
        return this.mapObject(source) as NHMView;
    }

    public fromApiTransitRailwayUndertaking(source: TransitRailwayUndertaking): TransitRailwayUndertakingView {
        return this.mapObject(source) as TransitRailwayUndertakingView;
    }

    public fromApiStatus(status: Status): string {
        return this.translate.instant(`ewd.shared.status.${OrderStatusTranslations[this.statusToOrderStatusViewEnumMap[status]]}`)
    }

    // From View to API
    public toApiCommercialLocation(source: CommercialLocationView): CommercialLocation {
        return this.mapObject(source) as CommercialLocation;
    }

    public toApiDemandWagonType(source: DemandWagonTypeView): DemandWagonType {
        return this.mapObject(source) as DemandWagonType;
    }

    public toApiIdNameType(source: IdNameTypeView): IdNameType {
        return this.mapObject(source) as IdNameType;
    }

    public toApiCustomerInformation(source: CustomerInformationView): CustomerInformation {
        return this.mapObject(source) as CustomerInformation;
    }

    public toApiDemandLocation(source: DemandLocationView): DemandLocation {
        return {
            commercialLocation: this.toApiCommercialLocation(source.commercialLocation),
            freightWagonLocation: this.toApiFreightWagonLocation(source.freightWagonLocation)
        } as DemandLocation;
    }

    public toApiFreightWagonLocation(source: FreightWagonLocationView): FreightWagonLocation {
        return this.mapObject(source) as FreightWagonLocation;
    }

    public toApiNHM(source: NHMView): NHM {
        return this.mapObject(source) as NHM;
    }

    public toApiTransitRailwayUndertaking(source: TransitRailwayUndertakingView): TransitRailwayUndertaking {
        return this.mapObject(source) as TransitRailwayUndertaking;
    }

    private mapObject(source: any): any | null {
        if (!source) return null;
        return {...source};
    }

    private statusToOrderStatusViewEnumMap: Record<Status, OrderStatusViewEnum> = {
        CANCELED: OrderStatusViewEnum.Canceled,
        CREATED: OrderStatusViewEnum.Created,
        DISPATCHED: OrderStatusViewEnum.Dispatched,
        DRAFT: OrderStatusViewEnum.Draft,
        DRAFT_REMOVED: OrderStatusViewEnum.DraftRemoved,
        IN_PROCESS: OrderStatusViewEnum.InProcess,
        IS_TRANSMITTED: OrderStatusViewEnum.IsTransmitted,
        PARTIAL_CANCELLATION: OrderStatusViewEnum.PartialCancellation,
        REJECTED: OrderStatusViewEnum.Rejected,
        TRANSMITTED: OrderStatusViewEnum.Transmitted,
        TRANSMIT_FAILED: OrderStatusViewEnum.TransmitFailed,
    };
}