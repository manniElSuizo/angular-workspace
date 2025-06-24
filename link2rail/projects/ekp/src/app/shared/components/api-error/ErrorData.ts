import { ApiError, ApiProblem } from "@src/app/trainorder/models/ApiModels";

export interface ErrorData {
    text?: string;
    apiProblem?: ApiProblem;
    errors?: ApiError[];
}
