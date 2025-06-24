import { ApiError } from "@src/app/trainorder/models/ApiModels";
import { UserManual } from "./user-manual.model";

export interface UserManualResponse {
  usermanuals: UserManual[],
  offset: number,
  limit: number,
  total: number,
  errors: ApiError
}

