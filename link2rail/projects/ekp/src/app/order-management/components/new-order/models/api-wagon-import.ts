import { ValidationErrors } from "@angular/forms";
import { WagonInformation } from "@src/app/order-management/models/rail-order-api";

export interface ImportLine {
   rowId: number | null,
   wagon: WagonInformation | null;
   validationErrors?: ValidationErrors;
  }
