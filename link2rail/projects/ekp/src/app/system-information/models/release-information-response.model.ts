import { ApiError } from "@src/app/trainorder/models/ApiModels";
import { ReleaseInformation } from "./release-Information.model";

export interface ReleaseInformationResponse {
  releaseInformationList: ReleaseInformation[],
  offset: number,
  limit: number,
  total: number,
  errors: ApiError
}
