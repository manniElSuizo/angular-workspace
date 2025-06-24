
export interface Holiday {
    date: string;
    name: string;
}

export interface ApiHolidayResponse extends Array<Holiday> {}
