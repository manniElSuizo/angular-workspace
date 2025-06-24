import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DateTimePipe } from "./date-time.pipe";
import { CustomerSgvNamePipe } from "./customer-sgv-name.pipe";
import { OrderNumberPipe } from '@src/app/shared/pipes/order-number.pipe';
import { WagonNumberPipe } from "@src/app/shared/pipes/wagon-number.pipe";
import { TranslateWagonStatusPipe } from "./translate-wagon-status.pipe";
import { SuitableForRunningPipe } from "./suitable-for-running.pipe";
import { MarketareaCustomerNamePipe } from "@src/app/trainorder/pipes/marketarea-customer-name.pipe";
import { TranslateOrderStatusPipe } from "./translate-order-status.pipe";
import { OrderNumberFormatterDirective } from "../directives/order-number.directive";
import { CustomerSgvPartnerIdPipe } from "./customer-sgv-partner-id.pipe";
import { TranslateOrderInternalStatusPipe } from "./translate-order-internal-status.pipe";
import { DangerousGoodLawPipe } from "./dangerous-good-law-pipe";
import { CountryPipe } from "./country.pipe";
import { RailAuthorityPipe } from "./rail-authority.pipe";
import { SgvPipe, SitePipe } from "./sgv-sites.pipe";
import { CommercialLocationSummaryPipe } from "./commercial-location-summary.pipe";
import { LocationNamePipe } from "./location-name.pipe";
import { InfrastructureLocationSummaryPipe } from "./infrastructure-location-summary.pipe";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DateTimePipe,
    CustomerSgvNamePipe,
    OrderNumberPipe,
    WagonNumberPipe,
    TranslateWagonStatusPipe,
    TranslateOrderStatusPipe,
    TranslateOrderInternalStatusPipe,
    SuitableForRunningPipe,
    MarketareaCustomerNamePipe,
    OrderNumberFormatterDirective,
    CustomerSgvPartnerIdPipe,
    DangerousGoodLawPipe,
    CountryPipe,
    RailAuthorityPipe,
    SgvPipe,
    SitePipe,
    CommercialLocationSummaryPipe,
    LocationNamePipe,
    InfrastructureLocationSummaryPipe
  ],
  exports: [
    DateTimePipe,
    CustomerSgvNamePipe,
    OrderNumberPipe,
    WagonNumberPipe,
    TranslateWagonStatusPipe,
    TranslateOrderStatusPipe,
    TranslateOrderInternalStatusPipe,
    SuitableForRunningPipe,
    MarketareaCustomerNamePipe,
    OrderNumberFormatterDirective,
    CustomerSgvPartnerIdPipe,
    DangerousGoodLawPipe,
    CountryPipe,
    RailAuthorityPipe,
    SgvPipe,
    SitePipe,
    CommercialLocationSummaryPipe,
    InfrastructureLocationSummaryPipe,
    LocationNamePipe
  ],
  providers: [
    CustomerSgvNamePipe,
    CustomerSgvPartnerIdPipe,
    OrderNumberPipe,
    WagonNumberPipe,
    TranslateWagonStatusPipe,
    TranslateOrderStatusPipe,
    TranslateOrderInternalStatusPipe,
    SuitableForRunningPipe,
    MarketareaCustomerNamePipe,
    OrderNumberFormatterDirective,
    CountryPipe,
    RailAuthorityPipe,
    SgvPipe,
    SitePipe,
    CommercialLocationSummaryPipe,
    InfrastructureLocationSummaryPipe,
    LocationNamePipe
    ]
})
export class SharedPipesModule {

}
