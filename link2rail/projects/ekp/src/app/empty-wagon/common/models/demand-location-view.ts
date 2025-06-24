
import { CommercialLocationView } from "./commercial-location-view";
import { FreightWagonLocationView } from "./freight-wagon-location-view";

export interface DemandLocationView {
  commercialLocation: CommercialLocationView;
  freightWagonLocation?: FreightWagonLocationView;
}
