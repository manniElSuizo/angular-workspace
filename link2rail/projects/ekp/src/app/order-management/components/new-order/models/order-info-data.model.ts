import { RailOrder } from "../../../models/rail-order-api";

export interface OrderInfoData {
    isNew?: boolean;
    editMode?: boolean;
    railOrder?: RailOrder;
    templateNumber?: string;
};