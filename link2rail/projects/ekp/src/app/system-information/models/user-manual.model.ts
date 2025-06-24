import { Data } from "@angular/router";

export interface UserManual {
  id: number;
  created: Date;
  name: string;
  version: string;
  pdf: string;
}