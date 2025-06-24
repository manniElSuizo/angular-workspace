import { Authorization, AuthorizationResponse } from "@src/app/trainorder/models/authorization";
import { Permission, PermissionType } from "@src/app/trainorder/models/permission";

export class PermissionsMock {
    static getDummyPermissions(): Permission[] {
        return [
            { object: 'trains-list', type: [PermissionType.READ] },
            { object: 'orders-list', type: [PermissionType.READ] },
            { object: 'order', type: [PermissionType.READ] },
            { object: 'home', type: [PermissionType.READ] },
            { object: 'trains-list-view', type: [PermissionType.READ] },
            { object: 'trains-calendar-view', type: [PermissionType.READ] },
            { object: 'order-templates', type: [PermissionType.READ] }
        ];
    }

    static getDummyAuthResponse(): AuthorizationResponse {
        return {
            authorization: [
                // Authorization.READ_ORDER_TEMPLATE,
                // Authorization.CREATE_ORDER_TEMPLATE,
                // Authorization.UPDATE_ORDER_TEMPLATE,
                // Authorization.DELETE_ORDER_TEMPLATE,
                // Authorization.READ_ORDER,
                // Authorization.CREATE_ORDER_FLEXTRAIN,
                // Authorization.READ_ORDER_DETAILS,
                Authorization.CANCEL_SPECIAL_TRAIN,
                Authorization.REDUCTION,
                Authorization.UPLOAD_PROGRAM,
                Authorization.READ_TRAIN,
                Authorization.READ_TRAIN_POSITION,
                Authorization.READ_TRACKING,
                Authorization.READ_TRAIN_DETAILS,
                Authorization.CANCEL_TRAIN
            ],
            profiles: [
                {
                    authorization: [
                        Authorization.READ_ORDER_TEMPLATE,
                        Authorization.CREATE_ORDER_TEMPLATE,
                        Authorization.UPDATE_ORDER_TEMPLATE,
                        Authorization.DELETE_ORDER_TEMPLATE,
                        Authorization.READ_ORDER,
                        Authorization.CREATE_ORDER_FLEXTRAIN,
                        Authorization.READ_ORDER_DETAILS,
                        Authorization.CANCEL_SPECIAL_TRAIN,
                        Authorization.REDUCTION,
                        Authorization.UPLOAD_PROGRAM,
                        Authorization.READ_TRAIN,
                        Authorization.READ_TRAIN_POSITION,
                        Authorization.READ_TRACKING,
                        Authorization.READ_TRAIN_DETAILS,
                        Authorization.CANCEL_TRAIN
                    ],
                    customerName: "Customer Name",
                    partnerId: "",
                    sgvId: "",
                    siteName: ""
                },

                {
                    authorization: [
                        Authorization.READ_ORDER_TEMPLATE,
                        Authorization.READ_ORDER,
                        Authorization.READ_ORDER_DETAILS,
                        Authorization.READ_TRAIN,
                        Authorization.READ_TRAIN_POSITION,
                        Authorization.READ_TRACKING,
                        Authorization.READ_TRAIN_DETAILS,
                    ],
                    customerName: "Read only Profile",
                    partnerId: "",
                    sgvId: "",
                    siteName: ""
                }
            ]
        }
    }
}
