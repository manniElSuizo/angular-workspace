import { Error } from "../user-list/user-list.service";

export interface WagonKeeper {
    shortName: string;
    LongName?: string;
    longName?: string;
}

export interface WagonKeeperResponse {
    carKeepers: WagonKeeper[];
    errors: Error;
}
