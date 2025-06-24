import {Component, OnInit} from '@angular/core';
import { Subject } from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {debounceTime, takeUntil} from "rxjs/operators";
import { CustomerSgvNamePipe } from '../../pipes/customer-sgv-name.pipe';
import { Authorization, AUTHORIZATIONS_TM, CustomerData, CustomerProfile } from '@src/app/trainorder/models/authorization';
import { Customer, CustomerResponse, Site, SiteResponse } from '@src/app/trainorder/models/ApiCustomers.model';
import { PermissionService } from '../../permission/PermissionService';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { AppService } from '@src/app/app.service';
export interface DropDownModel {
    idField: number;
    textField: string;
}

@Component({
    selector: 'app-customer-select',
    templateUrl: './customer-select.component.html',
    styleUrls: ['./customer-select.component.scss'],
    providers: [CustomerSgvNamePipe]
})
export class CustomerSelectComponent implements OnInit {
    protected customerSelectList: CustomerData[] = [];
    protected tmCustomerDataList: CustomerData[] = [];
    protected customers4Dropdown: DropDownModel[];
    protected activeCustomers: CustomerProfile[] = [];
    protected selectedItems = [];
    protected allProfiles = false;
    protected partnerIdList: Site[];
    protected sgvAutoComplete: Customer[] = [];
    protected authorization = Authorization;
    protected selectCustomerForm: FormGroup = new FormGroup({
        selectedCustomer: new FormControl(''),
        sgvId: new FormControl(''),
        partnerId: new FormControl({
            disabled: true,
            value: ''
        })
    });

    private sgvInputChange: Subject<string> = new Subject<string>();
    private _unsubscribePermissionLoad$: Subject<void> = new Subject<void>();

    constructor(
        protected permissionService: PermissionService,
        private trainorderService: TrainorderService,
        private storageService: LocalStorageService,
        private customerSgvNamePipe: CustomerSgvNamePipe,
        private appService: AppService
    ) {
        this.registerForPermissionChanges();
        this.registerForInputChanges();
    }

    ngOnInit(): void {
        this.loadCustomerProfiles();
    }

    private registerForInputChanges(): void {
        this.sgvInputChange.pipe(debounceTime(500)).subscribe((input) => {
            if (input.length === 0) {
                this.clearSearchInput();
            } else {
                this.getSgvAutocompleteSuggestions(input);
            }
        });
    }

    private registerForPermissionChanges(): void {
        this.permissionService.hasPermission(null, [Authorization.READ_ALL_PROFILES]).subscribe({
            next: (b: boolean) => {
                if(b) this.setFormFields4Admin();
            },
            error: error => console.error(error)
        });
    }

    private setFormFields4Admin() {
        const activeProfiles = this.storageService.getActiveProfiles();
        if(activeProfiles != null && activeProfiles.length > 0) {
            const activeProfile = activeProfiles[0];
            this.selectCustomerForm.get("sgvId")?.setValue(this.customerSgvNamePipe.transform({name: activeProfile.customerName, sgvNumber: activeProfile.sgvId}));
            this.selectCustomerForm.get('partnerId')?.enable();
            this.updateActiveProfiles(true, activeProfile);
        }
    }

    private loadCustomerProfiles() {
        if(this.getCustomerSelectList()) {
            return;
        }

        if(this.customerSelectList == null || this.customerSelectList.length < 1) {
            // no profile was set. wait for permissions to load
            this.permissionService.permissionLoad().pipe(takeUntil(this._unsubscribePermissionLoad$)).subscribe({
                next: (b: boolean) => {
                    if(b){
                        if(this.getCustomerSelectList()) {
                            this._unsubscribePermissionLoad$.next();
                        }
                    }
                },
                error: (error: any) => {
                    console.error(error);
                }
            });
        } else {
            this.setDefaultActiveProfile();
            this.setActiveProfilesInSelectField();
        }
    }

    private getCustomerSelectList(): boolean {
        this.customerSelectList = this.storageService.getCustomerProfiles();
        if(!this.customerSelectList || !this.customerSelectList.length) {
            return false;
        }

        const tmProfiles = this.findTMProfiles();

        this.tmCustomerDataList = tmProfiles;

        this.setDefaultActiveProfile();
        this.setActiveProfilesInSelectField();
        return true;
    }

    private setDefaultActiveProfile() {
        let activeProfiles = this.storageService.getActiveProfiles();
        if(!activeProfiles) {
            activeProfiles = [this.tmCustomerDataList[0]]
            this.permissionService.setActiveProfiles(activeProfiles);
        }
    }

    private setActiveProfilesInSelectField() {
        const activeProfiles = this.storageService.getActiveProfiles();

        if (activeProfiles) {
            this.activeCustomers = activeProfiles;
            const activeProfile: CustomerProfile = this.activeCustomers[0];
            const idx = this.findIndexOfCustomerProfile(activeProfile);
            if (idx >= 0)
                this.selectedCustomer.setValue(idx);
        }
    }

    private findIndexOfCustomerProfile(cp: CustomerProfile): number {
        return this.tmCustomerDataList.findIndex(cd => cd.sgvId == cp.sgvId && cd.partnerId == cp.partnerId);
    }

    private toDropdownModel() {
        this.customers4Dropdown = [];
        let counter = 0;
        this.customerSelectList.forEach((cp: CustomerData) => {
            this.customers4Dropdown.push({idField: counter, textField: cp.siteName});
            counter++;
        });
    }

    /**
     * returns an array of all profiles that contain permissions for TM
     */
    private findTMProfiles(): CustomerData[] {
        const arr: CustomerData[] = [];
        this.customerSelectList.forEach(cp => {
            if(cp.authorization.some(el => AUTHORIZATIONS_TM?.includes(el))) {
                arr.push(cp);
            }
        });
        return arr;
    }

    protected clearSearchInput(): void {
        this.selectCustomerForm.get('sgvId')?.setValue(null);
        this.customerSelectList = [];
        this.selectCustomerForm.get('partnerId')?.setValue(null);
        this.selectCustomerForm.get('partnerId')?.disable();
        this.partnerIdList = [];
        this.sgvAutoComplete = new Array();
        this.storageService.removeActiveProfiles();
        const cp: CustomerProfile = {
            sgvId: '', // TODO shouldn't it be null or undefined?
            partnerId: '' // TODO shouldn't it be null or undefined?
        }

        this.appService.customerSelection.next(cp);
    }

    protected selectCustomer(event: any): void {
        const customerData = this.tmCustomerDataList[event.target.value];
        // if(customerData) {
            this.permissionService.setActiveProfiles([customerData]);
            this.appService.customerSelection.next(customerData);
        // }
    }

    protected getSgvIdsList(event: any) {
        this.sgvInputChange.next(event.target.value);
    }

    protected selectSgvId(event: any) {
        if (!event.target.value || event.target.value == '' || event.target.value == null) return;
        this.selectCustomerForm.get("partnerId")?.setValue(null);
        this.sgvAutoComplete = new Array();
        this.updateActiveProfiles(true);
    }

    private updateActiveProfiles(updateSites = false, activeProfile: CustomerProfile | null = null) {
        const sgvAndName = this.customerSgvNamePipe.transform(this.selectCustomerForm.get('sgvId')?.value) as Customer;
        if (sgvAndName.sgvNumber) {
            if (updateSites) {
                this.trainorderService.getSites4Sgv(sgvAndName.sgvNumber).subscribe({
                    next: (result: SiteResponse) => { // FIXME: nicht in dieser Funktion
                        if(result && result.length) {
                            this.selectCustomerForm.get('partnerId')?.enable();
                        }
                        this.partnerIdList = result;

                        // if an activeProfile was selected previously, set form field-partnerid, if partnerid is in activeProfile
                        if(activeProfile != null && activeProfile.partnerId && activeProfile.partnerId.length > 0) {
                            this.selectCustomerForm.get("partnerId")?.setValue(activeProfile.partnerId);
                        }
                        // else: select first entry of list
                        else if(result.length > 0) {
                            this.selectCustomerForm.get("partnerId")?.setValue(result[0].partnerId);
                        }
                        this.setActiveProfile(sgvAndName, activeProfile);
                    },
                    error: (error: any) => {
                        console.error(error);
                    }
                });
            } else {
                this.setActiveProfile(sgvAndName, activeProfile);
            }
        } else {
            this.setActiveProfile(sgvAndName, activeProfile);
        }
    }

    private setActiveProfile(sgvAndName: Customer, activeProfile: CustomerProfile | null = null) {
        const partnerId = this.selectCustomerForm.get('partnerId')?.value ? this.selectCustomerForm.get('partnerId')?.value : activeProfile != null ? activeProfile.partnerId : '';
        const profile: CustomerData = {
            sgvId: sgvAndName.sgvNumber,
            partnerId: partnerId,
            customerName: sgvAndName.name,
            authorization: [],
            siteName: ''
        };

        this.permissionService.setActiveProfiles([profile]);
        this.appService.customerSelection.next(profile);
    }

    protected selectPartnerId(event: any) {
        if (!event.target.value || event.target.value == '' || event.target.value == null) {
            // remove partner id from active profile
            const aps = this.storageService.getActiveProfiles();
            if(aps && aps.length > 0) {
                const ap = aps[0];
                ap.partnerId = '';
                this.permissionService.setActiveProfiles([ap]);
            }
        }
        this.updateActiveProfiles();
    }

    protected getSgvAutocompleteSuggestions(input: string): void {
        let foundCustomer = this.sgvAutoComplete.find(el => input.indexOf(el.name) > 0);
        if (foundCustomer != null) {
            return;
        }

        if (input.length > 2) {
            this.sgvAutoComplete = [];
            this.trainorderService.getCustomers(input).subscribe((result: CustomerResponse) => {
                this.sgvAutoComplete = result;
                if(this.sgvAutoComplete) {
                    const tempList: Customer[] = [];
                    for (let customer of this.sgvAutoComplete) {
                        if(customer.sgvNumber.length > 0) {
                            const tempCustomer = tempList.find(c => {
                                return c.sgvNumber === customer.sgvNumber;
                            });
                            if (!tempCustomer) {
                                tempList.push(customer);
                            }
                        }
                    }
                    this.sgvAutoComplete = tempList;
                }
            }, (error: any) => {
                console.error(error);
            });
        }
    }

    protected get selectedCustomer() {
        return this.selectCustomerForm.get("selectedCustomer") as FormControl;
    }
}
