export enum OrderStatusTypes {
    ORDER_ACQUIRED = 'ORDER_ACQUIRED', //Bestellung erfasst
    ORDER_IN_VALIDATION = 'ORDER_IN_VALIDATION', //Bestellung erfasst
    ORDER_ACCEPTED = 'ORDER_ACCEPTED', //Angenommen
    ORDER_DECLINED_WITH_ALTERNATIVE = 'ORDER_DECLINED_WITH_ALTERNATIVE', //Abgelehnt mit Alternative
    ORDER_DECLINED = 'ORDER_DECLINED', //Abgelehnt
    PLANNING_OFFER_AVAILABLE = 'PLANNING_OFFER_AVAILABLE',
    // ALTERNATIVE_ACCEPTED = 'ALTERNATIVE_ACCEPTED',
    // ALTERNATIVE_DECLINED = 'ALTERNATIVE_DECLINED',
    CANCELLATION_ACQUIRED = 'CANCELLATION_ACQUIRED', //Annulierung in Bearbeitung
    CANCELED = 'CANCELED', //Annuliert
    REDUCTION_ACCEPTED = 'REDUCTION_ACCEPTED', //Mengenreduzierung angenommen
    CANCELLATION_IN_VALIDATION = "CANCELLATION_IN_VALIDATION",
    CANCELLATION_DECLINED = "CANCELLATION_DECLINED",
    ERROR = "ERROR"
}

export class OrderStatusHelper {
    static getOrderAcceptedStatusArray(): string[] {
        return [
            // OrderStatusTypes.Acquired,
            OrderStatusTypes.ORDER_ACCEPTED,
            // OrderStatusTypes.ReductionAccepted,
            //OrderStatusTypes.AlternativeAccepted
        ];
    }
    static getCancellationsStatusArray(): OrderStatusTypes[] {
        return [
            OrderStatusTypes.CANCELLATION_ACQUIRED,
            OrderStatusTypes.CANCELED,
            OrderStatusTypes.CANCELLATION_IN_VALIDATION,
            OrderStatusTypes.CANCELLATION_DECLINED
        ];
    }
    static getCancellationsStatus(): string {
        return this.getCancellationsStatusArray().join(',');
    }

    static getOrdersStatusArray(): OrderStatusTypes[] {
        return [
            OrderStatusTypes.ORDER_ACQUIRED,
            OrderStatusTypes.ORDER_IN_VALIDATION,
            OrderStatusTypes.ORDER_ACCEPTED,
            OrderStatusTypes.ORDER_DECLINED_WITH_ALTERNATIVE,
            OrderStatusTypes.ORDER_DECLINED,
            OrderStatusTypes.REDUCTION_ACCEPTED,
            OrderStatusTypes.PLANNING_OFFER_AVAILABLE,
            //OrderStatusTypes.AlternativeAccepted,
            //OrderStatusTypes.AlternativeDeclined
        ];
    }

    static getOrdersStatus(): string {
        return this.getOrdersStatusArray().join(',');
    }

    static orderStatusListString2RadioButtonString(orderStatusList: OrderStatusTypes[]): string {
        if (JSON.stringify(orderStatusList) == JSON.stringify(this.getCancellationsStatusArray().sort())) {
          return 'cancellations';
        } else if (JSON.stringify(orderStatusList) == JSON.stringify(this.getOrdersStatusArray().sort())) {
          return 'orders';
        }
        return 'all';
    }

}
