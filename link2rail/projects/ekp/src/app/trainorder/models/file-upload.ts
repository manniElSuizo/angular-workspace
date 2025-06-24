import { ApiError } from "./ApiModels";

export interface OrderProgramUploadResponse {
    orders?: IndexedOrderResponse[];
    errors?: ProgramError[];
}

export interface IndexedOrderResponse {
    programIndex: number;
    type: string;
    orderId: string;
}

export interface ProgramError extends ApiError {
    index: number;
}