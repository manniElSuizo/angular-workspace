import { Error } from "../user-list/user-list.service";

export interface AccountsReceivableNumber {
    accountsReceivableNumber: string;
    customerName?: string
}

export interface AccountsReceivableNumberResponse {
    accountsReceivableNumbers: AccountsReceivableNumber[];
    errors: Error;
}
