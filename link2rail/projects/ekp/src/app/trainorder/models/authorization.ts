export enum Authorization {
    READ_ORDER_TEMPLATE = "READ_ORDER_TEMPLATE",
    CREATE_ORDER_TEMPLATE = "CREATE_ORDER_TEMPLATE",
    UPDATE_ORDER_TEMPLATE = "UPDATE_ORDER_TEMPLATE",
    DELETE_ORDER_TEMPLATE = "DELETE_ORDER_TEMPLATE",
    READ_ORDER = "READ_ORDER",
    CREATE_ORDER_FLEXTRAIN = "CREATE_ORDER_FLEXTRAIN",
    READ_ORDER_DETAILS = "READ_ORDER_DETAILS",
    CANCEL_SPECIAL_TRAIN = "CANCEL_SPECIAL_TRAIN",
    REDUCTION = "REDUCTION",
    UPLOAD_PROGRAM = "UPLOAD_PROGRAM",
    READ_TRAIN = "READ_TRAIN",
    READ_TRAIN_POSITION = "READ_TRAIN_POSITION",
    READ_TRACKING = "READ_TRACKING",
    READ_TRAIN_DETAILS = "READ_TRAIN_DETAILS",
    CANCEL_TRAIN = "CANCEL_TRAIN",
    READ_ALL_PROFILES = "READ_ALL_PROFILES",
    READ_USERMANAGEMENT = "READ_USERMANAGEMENT",
    CREATE_USERMANAGEMENT = "CREATE_USERMANAGEMENT",
    UPDATE_USERMANAGEMENT = "UPDATE_USERMANAGEMENT",
    DELETE_USERMANAGEMENT = "DELETE_USERMANAGEMENT",
    READ_TNT = "READ_TNT",
    READ_OM = "READ_OM",
    WRITE_OM = "WRITE_OM",
    READ_EWD = "READ_EWD",
    WRITE_EWD = "WRITE_EWD",
    READ_WAGONHOLDER = "READ_WAGONHOLDER",
    READ_ALL_WAGONHOLDER = "READ_ALL_WAGONHOLDER",
    READ_INVOICE = "READ_INVOICE",
    READ_ALL_INVOICE = "READ_ALL_INVOICE",
    WRITE_SHIPPING_NUMBER = "WRITE_SHIPPING_NUMBER",
    CHANGE_USER_AUTH = "CHANGE_USER_AUTH"
}

export const AUTHORIZATIONS_TM: Authorization[] = [
    Authorization.CANCEL_SPECIAL_TRAIN,
    Authorization.CANCEL_TRAIN,
    Authorization.CREATE_ORDER_FLEXTRAIN,
    Authorization.CREATE_ORDER_TEMPLATE,
    Authorization.DELETE_ORDER_TEMPLATE,
    Authorization.READ_ORDER,
    Authorization.READ_ORDER_DETAILS,
    Authorization.READ_ORDER_TEMPLATE,
    Authorization.READ_TRAIN,
    Authorization.READ_TRAIN_DETAILS,
    Authorization.READ_TRAIN_POSITION,
    Authorization.UPDATE_ORDER_TEMPLATE,
    Authorization.REDUCTION,
    Authorization.UPLOAD_PROGRAM,
    Authorization.READ_TRACKING
];

export interface CustomerProfile {
    sgvId: string,
    partnerId: string
}

export interface CustomerData {
    sgvId: string,
    partnerId: string,
    authorization: Authorization[],
    customerName: string,
    siteName: string
}

export interface AuthorizationResponse {
    profiles: CustomerData[],
    authorization: Authorization[],
    username?: string
}

export class AuthorizationResponseClass {
    profiles: CustomerProfile[];
    authorization: Authorization[];
}

export class AuthorizationMapping {
    static mapFEUrl2AuthorizationFunction(feUrl: string): Authorization[] {
        switch (feUrl) {
            case 'trains-month-view':
                return this.train();
            case 'trains-week-view':
                return this.train();
            case 'trains-list-view':
                return this.train();
            case 'order':
                return this.order();
            case 'order-templates':
                return this.orderTemplate();
            case 'user-management':
                return this.userManagement();
            case 'user-list':
                return this.userManagement();
            case 'profile-list':
                return this.userManagement();
            case 'user-group-list':
                return this.userManagement();
            case 'customer-group-list':
                return this.userManagement();
            case 'authorization-matrix':
                return this.userManagement();
            case 'empty-wagon-view':
                return this.emptyWagonView();
            case 'empty-wagon-order-list':
                return this.emptyWagonView();
            case 'empty-wagon-template-list':
                return this.emptyWagonView();
            case 'order-management-view':
                return this.orderManagementView();
            case 'order-management-order-list':
                return this.orderManagementView();
            case 'order-management-order-code-list':
                return this.orderManagementView();
            case 'tracktrace':
                return this.tracktraceView();
            case 'wagon-view-list':
                return [Authorization.READ_TNT];
            case 'wagonholder':
                return [Authorization.READ_WAGONHOLDER];
            case 'invoice':
                return [Authorization.READ_INVOICE]
        }

        return [];
    }

    static train(): Authorization[] {
        return [
            Authorization.READ_TRAIN,
            Authorization.READ_TRAIN_POSITION,
            Authorization.READ_TRACKING,
            Authorization.READ_TRAIN_DETAILS,
            Authorization.CANCEL_TRAIN
        ];
    }

    static emptyWagonView(): Authorization[] {
        return [
            Authorization.WRITE_EWD,
            Authorization.READ_EWD,
        ];
    }

    static orderManagementView(): Authorization[] {
        return [
            Authorization.WRITE_OM,
            Authorization.READ_OM,
        ];
    }

    static tracktraceView(): Authorization[] {
        return [
            Authorization.READ_TNT,
            Authorization.READ_WAGONHOLDER,
        ];
    }

    static orderTemplate(): Authorization[] {
        return [
            Authorization.READ_ORDER_TEMPLATE,
            Authorization.CREATE_ORDER_TEMPLATE,
            Authorization.UPDATE_ORDER_TEMPLATE,
            Authorization.DELETE_ORDER_TEMPLATE
        ];
    }

    static order(): Authorization[] {
        return [
            Authorization.READ_ORDER_DETAILS,
            Authorization.READ_ORDER,
            Authorization.CREATE_ORDER_FLEXTRAIN,
            Authorization.CANCEL_SPECIAL_TRAIN,
            Authorization.REDUCTION,
            Authorization.UPLOAD_PROGRAM
        ];
    }

    static userManagement(): Authorization[] {
        return [
            Authorization.READ_USERMANAGEMENT,
            Authorization.CREATE_USERMANAGEMENT,
            Authorization.UPDATE_USERMANAGEMENT,
            Authorization.DELETE_USERMANAGEMENT,
        ]
    }
}