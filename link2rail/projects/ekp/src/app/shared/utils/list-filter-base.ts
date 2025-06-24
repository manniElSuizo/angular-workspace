import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { BasicListRequestCustomerProfiles } from "../models/paging";
import { StorageKeys, StorageServiceBase } from "../services/storage/storage.service.base";
import { AppService } from "@src/app/app.service";
import { SessionStorageService } from "../services/storage/session-storage.service";
import { SortConditionsModel } from "../models/sort.models";

export abstract class ListFilterBase {
    protected static DEFAULT_LIMIT: number = 25;

    private subscriptions: Subscription = new Subscription();
    private ignoreProperties = ["offset", "limit", "sort", "customerProfiles"];
    protected appService: AppService;
    protected request4Storage: BasicListRequestCustomerProfiles;
    protected request: BasicListRequestCustomerProfiles;
    protected requestSubscription: Subscription = new Subscription();
    protected storageKey: StorageKeys;
    protected storage: StorageServiceBase = new SessionStorageService();
    protected activeFilterCount: number;
    protected downloadInProgress: boolean = false;

    public limit: number = ListFilterBase.DEFAULT_LIMIT;
    public offset: number = 0;
    public sortConditions: SortConditionsModel[] = [];
    public loadingInProgress$: Subject<boolean> = new BehaviorSubject(true);
    public showLoadMoreButton$: Subject<boolean> = new Subject();
    public totalNumberOfElements$: BehaviorSubject<number> = new BehaviorSubject(0);
    public scrollPosition: number = null;

    constructor(injectedAppService: AppService, storageKey?: StorageKeys) {
      this.appService = injectedAppService;
      this.storageKey = storageKey
    }

    public loadMore(limit: number = ListFilterBase.DEFAULT_LIMIT) {
      this.request.offset += limit;
      this.scrollPosition = null;
      this.fetchData();
    }

    protected destroy(): void {
      this.subscriptions.unsubscribe();
    }

    protected addFilterPropertiesToBeIgnored(ignoreProperties: string []): void {
      for (const prop of ignoreProperties) {
        this.ignoreProperties.push(prop);
      }
    }

    protected abstract createFilterForm(): void;

    protected abstract requestData(): void;

    protected abstract setStorageValuesInForm(): void;

    protected abstract filterFormToRequest4Storage(): void;

    protected afterStorageToRequest(): void {}

    protected afterRestoreFilterFromStorage(): void {}

    protected afterCountActiveFilter(): void {}

    protected fetchData(): void {
      this.filterFormToRequest4Storage();
      this.addSortConditions(this.request4Storage);
      this.writeFilterToStorage();
      this.storageToRequest();
      this.showLoadMoreButton$.next(false);
      if (this.requestSubscription) {
          this.requestSubscription.unsubscribe();
      }
      this.loadingInProgress$.next(true);
      this.countActiveFilter();
      this.requestData();
    }

    public sort(fieldName: string): void {
      this.resetRequest();
      this.updateSortConditions(fieldName);
      this.fetchData();
    }

    protected registerForCustomerProfileChanges() {
      this.subscriptions.add(this.appService.customerSelection.subscribe({
        next: cp => {
          this.storageToRequest();
          this.resetRequest();
          this.request.customerProfiles = this.appService.getSelectedCustomerProfiles();
          this.fetchData();
        }
      }));
    }

    protected setRequest4Storage(request4Storage: BasicListRequestCustomerProfiles) {
      this.request4Storage = request4Storage;
      this.request4Storage.limit = this.limit;
      this.request4Storage.offset = this.offset;
    }

    protected writeFilterToStorage(): void {
      this.storage.setItem(this.storageKey, JSON.stringify(this.request4Storage));
    }

    protected restoreFilterFromStorage() {
      const filter = this.storage.getItem(this.storageKey);
      if (!filter) {
        this.setEmptyRequest4Storage();
        return;
      }
      this.request4Storage = JSON.parse(filter);
      this.afterRestoreFilterFromStorage();
      this.setSortConditionsFromStorage();
    }

    protected resetRequest(limit: number = ListFilterBase.DEFAULT_LIMIT): void {
      this.offset = 0;
      this.limit = limit;
    }

    protected storageToRequest() {
        this.emptyRequest();
        if (this.request4Storage) {
          Object.keys(this.request4Storage).forEach(property => {
              if(this.request.hasOwnProperty(property)) {
                  this.request[property] = this.request4Storage[property];
              }
          });
        }
        if(this.scrollPosition) {
          this.request.limit = this.limit + this.offset;
          this.request.offset = 0;
        }
        this.afterStorageToRequest();
        this.countActiveFilter();
    }

    protected resetAllFilters() {
      this.resetRequest();
      this.setEmptyRequest4Storage();
      this.writeFilterToStorage();
      this.restoreFilterFromStorage();
      this.storageToRequest();
      this.setStorageValuesInForm();
      this.fetchData();
    }

    protected onChangeFilter(event: Event) {
      this.resetRequest();
      this.fetchData();
    }

    protected goToScrollPosition() {
      if(this.scrollPosition) window.scrollTo(0, -this.scrollPosition);
    }

    public reloadList() {
      this.fetchData();
    }

    private setSortConditionsFromStorage() {
      this.sortConditions = new Array();
      if(this.request4Storage.sort && this.request4Storage.sort.length > 1) {
        const allSortStrings = this.request4Storage.sort.split(',');
        allSortStrings.forEach(s => {
          const asc = s.substring(0,1) == '+' ? true : false;
          const fieldName = s.substring(1);
          this.sortConditions.push({field: fieldName, asc: asc});
        });
      }
    }

    private emptyRequest() {
      if (this.request) {
        Object.keys(this.request).forEach(k => this.request[k] = null);
      }
    }

    private countActiveFilter() {
      this.activeFilterCount = 0;
      if (this.request) {
        Object.keys(this.request).forEach(key => {
          if(!this.ignoreProperties.includes(key)) {
            if(this.request[key] instanceof Array) {
              if (this.request[key].length > 0) {
                this.activeFilterCount++;
              }
            } else {
              if(this.request[key] != null) {
                this.activeFilterCount++;
              }
            }
          }
        });
      }
      this.afterCountActiveFilter();
    }

    private setEmptyRequest4Storage() {
        this.request4Storage = {
          offset: this.request.offset,
          limit: this.request.limit,
          sort: this.request.sort
        };
    }

    private updateSortConditions(fieldName: string) {
      if(!this.sortConditions) {
        this.sortConditions = [];
      }
      const length = this.sortConditions.length;

      if(length == 0) {
        this.sortConditions.push({asc: true, field: fieldName});
        return;
      }

      const idx = this.sortConditions.findIndex(sc => sc.field == fieldName);

      if(idx == 0) {
        this.sortConditions[0].asc = !this.sortConditions[0].asc;
        return;
      }

      if(length > 1) {
        this.sortConditions.pop();
      }

      this.sortConditions.unshift({asc: true, field: fieldName});
    }

    private addSortConditions(request: BasicListRequestCustomerProfiles) {
      if (request) {
        request.sort = this.sortConditions.map(sc => (sc.asc ? '+' : '-') + sc.field).join(',');
      }
    }
}
