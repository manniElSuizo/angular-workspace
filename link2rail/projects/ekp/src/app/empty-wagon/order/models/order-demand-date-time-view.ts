import {OrderDemandTypeView} from "./order-demand-type-view";

export interface OrderDemandDateTimeView {
    deliveryDateTime?: Date | null;
    demands: Array<OrderDemandTypeView>;
}