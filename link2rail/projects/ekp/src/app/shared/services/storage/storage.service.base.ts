export class StorageServiceBase {
    protected storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    /**
     * getItem
     * @param key: string
     * @returns string | null
     */
    public getItem(key: string): string | null {
        return this.storage.getItem(key);
    }

    /**
     * setItem
     * @param key: string
     * @param value: string
     */
    public setItem(key: string, value: string | null) {
        this.storage.setItem(key, value);
    }

    public setObject<T>(key: StorageKeys, obj: T) {
        this.storage.setItem(key, JSON.stringify(obj));
    }

    public getObject<T>(key: StorageKeys): T {
        return JSON.parse(this.storage.getItem(key)) as T;
    }

    /**
     * removeItem
     */
    public removeItem(key: string) {
        this.storage.removeItem(key);
    }
}

export enum StorageKeys {
    WAGON_VIEW_FILTER_STORAGE_KEY = "WAGON_VIEW_FILTER_STORAGE_KEY",
    WAGON_HOLDER_LIST_FILTER_STORAGE_KEY = "WAGON_HOLDER_LIST_FILTER_STORAGE_KEY",
    ORDER_VIEW_FILTER_STORAGE_KEY = "ORDER_VIEW_FILTER_STORAGE_KEY",
    ORDER_CODE_VIEW_FILTER_STORAGE_KEY = "ORDER_CODE_VIEW_FILTER_STORAGE_KEY",
    EMPTY_WAGON_ORDER_OVERVIEW_FILTER_STORAGE_KEY = "EMPTY_WAGON_ORDER_OVERVIEW_FILTER_STORAGE_KEY",
    EMPTY_WAGON_TEMPLATE_OVERVIEW_FILTER_STORAGE_KEY = "EMPTY_WAGON_TEMPLATE_OVERVIEW_FILTER_STORAGE_KEY",
    MD_RAIL_AUTHORITIES_KEY = "MD_RAIL_AUTHORITIES_KEY",
    MD_COUNTRY_KEY = "MD_COUNTRY_KEY",
    INVOICE_OVERVIEW_FILTER_STORAGE_KEY = "INVOICE_OVERVIEW_FILTER_STORAGE_KEY",

}