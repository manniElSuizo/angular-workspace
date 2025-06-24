import { RailOrderStatus } from "@src/app/order-management/models/general-order";
import { RailOrderStage } from "../../wagon-view/models/api-wagon-list";

export interface FieldConfig {
    fieldName: string;
    editableAC?: boolean;
    editableStatus?: RailOrderStatus[];
    disableStage?: RailOrderStage[];
    allwaysDisabled?: boolean
}
