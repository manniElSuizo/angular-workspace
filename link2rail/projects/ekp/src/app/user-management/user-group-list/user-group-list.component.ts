import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RolesListResponse, UserGroupListResponse, UserGroupListService } from './user-group-list.service';
import { CustomerProfile } from '../model/profile.model';
import { Role } from '../model/role.model';
import {  MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AppService, } from '@src/app/app.service';
import { debounceTime } from 'rxjs/operators';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { UserGroup } from '../model/usergroup.model';
import { MultiselectAutocompleteComponent, MultiselectAutocompleteParameters, ListKeyValue } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import { UserGroupEditComponent } from './user-group-edit/user-group-edit.component';
import { UserManagementService } from '../user-management.service';

@Component({
  selector: 'app-user-group-list',
  templateUrl: './user-group-list.component.html',
  styleUrls: ['./user-group-list.component.scss']
})

export class UserGroupListComponent implements OnInit {
    @ViewChild('mssc') multiselectCustomer: MultiselectAutocompleteComponent;
    @ViewChild('mssr') multiselectRole: MultiselectAutocompleteComponent;

    filterForm: FormGroup;
    loadingInProgress: boolean;

    protected multiselectAutocompleteParametersCustomer: MultiselectAutocompleteParameters;
    protected multiselectAutocompleteParametersRole: MultiselectAutocompleteParameters;

    tableHeaders: any[] = [];
    availableGroups: UserGroup[];
    availableCustomers: CustomerProfile[];
    availableRoles: Role[];
    filteredGroups: UserGroup[] = [];
    displayGroups: UserGroup[] = [];
    limit: number = 25;

    sortConditions: SortConditionsModel = {field: "groupName", asc: true};

    constructor(
      private modalWindows: ModalWindows,
      private translate: TranslateService,
      private userGroupListService: UserGroupListService,
      private dialog: MatDialog,
      protected userManagementService: UserManagementService) {
      this.createTableHeaders();
    }

    ngAfterViewInit(): void {
      this.filterForm.addControl('childFormCustomer', this.multiselectCustomer.multiselectForm);
      this.multiselectCustomer.multiselectForm.setParent(this.filterForm);

      this.filterForm.addControl('childFormRole', this.multiselectRole.multiselectForm);
      this.multiselectRole.multiselectForm.setParent(this.filterForm);
    }

    ngOnInit(): void {
      this.setMultiselectParamsCustomer();
      this.setMultiselectParamsRole();

      this.prepareForm();
      this.fetchAllGroups();
      this.fetchAllRoles();
    }

    private prepareForm() {
      this.filterForm = new FormGroup({
        groupname: new FormControl(''),
      });

      const groupname = this.filterForm.get("groupname");
      if (groupname) {
        groupname.valueChanges.pipe(debounceTime(500)).subscribe(res => {
          this.filterGroups();
        });
      }
    }

    private setMultiselectParamsCustomer() {
      this.multiselectAutocompleteParametersCustomer = {
        i18n: {
          fieldText: this.translate.instant('User-management-component.UserGroup.customer'),
          labelText: this.translate.instant('User-management-component.UserGroup.customer'),
          errorText: this.translate.instant('error text'),
          searchPlaceholderText: this.translate.instant('User-management-component.SearchPlaceholderText'),
          noDataAvailablePlaceholderText: this.translate.instant('User-management-component.NoDataAvailablePlaceholderText')
        },
        fieldName: "customer",
        fieldId: "customer",
        divId: "customerDiv",
        formControlName: "customer",

        dataCallback: (searchInput: string, array: ListKeyValue[]) => {
          this.getCustomerSuggestions(searchInput, array);
        },
        selectedItems: [],
        minQueryLength: 1
      };
    }

    private setMultiselectParamsRole() {
      this.multiselectAutocompleteParametersRole = {
        i18n: {
          fieldText: this.translate.instant('User-management-component.UserGroup.roles'),
          labelText: this.translate.instant('User-management-component.UserGroup.roles'),
          errorText: this.translate.instant('error text'),
          searchPlaceholderText: this.translate.instant('User-management-component.SearchPlaceholderText'),
          noDataAvailablePlaceholderText: this.translate.instant('User-management-component.NoDataAvailablePlaceholderText')
        },
        fieldName: "role",
        fieldId: "role",
        divId: "roleDiv",
        formControlName: "role",

        dataCallback: (searchInput: string, array: ListKeyValue[]) => {
          this.getRoleSuggestions(searchInput, array);
        },
        selectedItems: [],
        minQueryLength: -1
      };
    }

    private createTableHeaders(): void {
      this.tableHeaders = [
        { text: this.translate.instant('User-management-component.UserGroup.customerName'), value: 'customerProfile.sgv.customerName', sortField: true, width: '500px'},
        { text: this.translate.instant('User-management-component.UserGroup.custNo'), value: 'customerProfile.sgv.marketAreaCustomerNumber', sortField: true, width: '200px' },
        { text: this.translate.instant('User-management-component.UserGroup.sgvNo'), value: 'customerProfile.sgv.sgvId', sortField: true, width: '120px' },
        { text: this.translate.instant('User-management-component.UserGroup.partnerId'), value: 'customerProfile.sgv.companyLocationNumber', sortField: true, width: '120px' },
        { text: this.translate.instant('User-management-component.UserGroup.groupName'), value: 'groupName', sortField: true, width: '300px' },
        { text: this.translate.instant('User-management-component.UserGroup.roles'), value: 'roles'},
      ];
    }

    sortTable(value: string): void {
      if (this.sortConditions.field === value) {
        if (this.sortConditions.asc) {
          this.sortConditions.asc = false;
        } else {
          this.sortConditions.asc = true;
        }
      } else {
        this.sortConditions.asc = true;
        this.sortConditions.field = value;
      }

      this.sortGroups(this.filteredGroups);
      this.displayGroups = this.filteredGroups.slice(0, this.limit);
    }

    sortGroups(groups: UserGroup[]): void {
      groups.sort((a, b) => {
        const valueA = this.getNestedValue(a, this.sortConditions.field)?.toLocaleLowerCase() ?? '';
        const valueB = this.getNestedValue(b, this.sortConditions.field)?.toLocaleLowerCase() ?? '';
        if (valueA < valueB) {
          return this.sortConditions.asc ? -1 : 1;
        } else if (valueA > valueB) {
          return this.sortConditions.asc ? 1 : -1;
        } else {
          return 0;
        }
      });
    }

    private getNestedValue(obj: any, path: string): any {
      return path.split('.').reduce((acc, part) => {
        return acc && acc[part];
      }, obj);
    }

    loadMore(): void {
      this.filterGroups(this.limit + 25);
    }

    get groupname(): AbstractControl | null {
      return this.filterForm.get('groupname');
    }

    get customer(): AbstractControl | null {
      return this.multiselectCustomer.multiselectForm.get(this.multiselectAutocompleteParametersCustomer.fieldId) as FormControl;
    }

    get role(): AbstractControl | null {
      return this.multiselectRole.multiselectForm.get(this.multiselectAutocompleteParametersRole.fieldId) as FormControl;
    }

    filterGroups(limit?: number) {
      this.loadingInProgress = true;

      if(limit) {
        this.limit = limit;
      } else {
        this.limit = 25;
      }

      const groupName = this.groupname.value.toLowerCase();
      this.filteredGroups =
        this.availableGroups
          .filter((g) => g.groupName.toLowerCase().indexOf(groupName) >= 0 || this.getGroupCustomer(g).toLowerCase().indexOf(groupName) >= 0);

      if(this.multiselectCustomer.selectedItems?.length > 0) {
        this.filteredGroups = this.filteredGroups.filter((g) => this.multiselectCustomer.selectedItems.find(c => c.key == g.customerProfile.customerProfileId.toString()));
      }

      if(this.multiselectRole.selectedItems?.length > 0) {
        this.filteredGroups = this.filteredGroups.filter((g) => g.roles?.find(r => this.multiselectRole.selectedItems.find(c => c.key == r.id.toString())));
      }

      this.sortGroups(this.filteredGroups);

      this.displayGroups = this.filteredGroups.slice(0, this.limit);
      this.loadingInProgress = false;
    }

    protected multiselectChangeEventListener($event: any) {
      this.filterGroups();  }

    fetchAllGroups() {
      this.loadingInProgress = true;
      this.userGroupListService.fetchUserGroups().subscribe({
        next: (result) => {
          const userGroupListResponse: UserGroupListResponse = result;
          this.availableGroups = userGroupListResponse.usergroups;

          this.availableCustomers = Array.from(new Set(this.availableGroups.filter(group => group.customerProfile?.sgv).map(group => group.customerProfile)));
          this.filterGroups();
        },
        error: (err) => {
          this.modalWindows.openErrorDialog({ apiProblem: err.error });
          console.error(err);
        }
      }).add(() => {
        this.loadingInProgress = false;
      });;
    }

    fetchAllRoles() {
      this.userGroupListService.fetchRoles(false).subscribe({
            next: (result) => {
              const roleListResponse: RolesListResponse = result;
              this.availableRoles = roleListResponse.roles;
              this.availableRoles = this.availableRoles.sort((a, b) => a.module?.localeCompare(b.module) ?? a.description.localeCompare(b.description));
              this.getRoleSuggestions('', null);
            },
            error: (err) => {
              this.modalWindows.openErrorDialog({ apiProblem: err.error });
              console.error(err);
            }
          });
    }

    getGroupCustomer(group: UserGroup): string {

      if(!group.customerProfile) {
        return '';
      }
      return this.getCustomer(group.customerProfile);
    }

    getCustomer(customerProfile: CustomerProfile) {
      if(!customerProfile.sgv) {
        return '';
      }
      if(!customerProfile.sgv.companyLocationNumber) {
        return customerProfile.sgv.sgvId + ' / *';
      } else {
        return '(' + customerProfile.sgv.sgvId + ' / ' + customerProfile.sgv.companyLocationNumber + ') ' + (customerProfile.sgv.customerName ?? "");
      }
    }

    getGroupRoles(group: UserGroup): string {
      let info = "";

      let moduleRoles = new Map<string, string[]>();

      group.roles?.sort((a, b) => a.description.localeCompare(b.description)).forEach(function (r) {
        let moduleRole = moduleRoles.get(r.module ?? "") ?? [];
        moduleRole.push(r.description);

        moduleRoles.set(r.module ?? "", moduleRole);
      });

      group.relationRoles?.sort((a, b) => a.description.localeCompare(b.description)).forEach(function (r) {
        let moduleRole = moduleRoles.get(r.module ?? "") ?? [];
        moduleRole.push(r.description + " [Beziehung]");

        moduleRoles.set(r.module ?? "", moduleRole);
      });

      const sorted = Array.from(moduleRoles.keys()).sort();

      sorted.forEach((k) => {
        info += k + ": " + moduleRoles.get(k)?.join(' | ') + "\n";
      });

      return info;
    }

    getCustomerSuggestions(searchInput: string, selected: ListKeyValue[]) {
      const searchResult: CustomerProfile[] = [];

      for (let i = 0; i < this.availableCustomers.length && searchResult.length < 20; i++) {
        const customer = this.availableCustomers[i];
        if (customer.sgv?.customerName?.toLowerCase().startsWith(searchInput.toLocaleLowerCase())
          || customer.sgv?.sgvId?.startsWith(searchInput.toLocaleLowerCase())
          || customer.sgv?.companyLocationNumber?.startsWith(searchInput.toLocaleLowerCase())) {
          searchResult.push(customer);
        }
      }

      const resultList: ListKeyValue[] = selected ? [...selected] : [];

      searchResult.forEach(c => {
        if(!resultList.find(kv => kv.key == c.customerProfileId.toString())) {
          if(!c.customerProfileId) console.log(c);
          resultList.push({key: c.customerProfileId.toString(), value: this.getCustomer(c)});
        }
      });
      this.multiselectCustomer.dataList = resultList;
    }

    private getRoleSuggestions(searchInput: string, selected: ListKeyValue[]) {
      let searchResult = this.availableRoles.filter(r => {
        return r.description.toLowerCase().indexOf(searchInput.toLocaleLowerCase()) >= 0;
      });

      searchResult = searchResult.sort((a, b) => a.module?.localeCompare(b.module) ?? a.description.localeCompare(b.description));

      const resultList: ListKeyValue[] = selected ? [...selected] : [];

      searchResult.forEach(r => {
        if(!resultList.find(kv => kv.key == r.id.toString()))
          resultList.push({key: r.id.toString(), value: (r.module ? r.module + " - " : "") + r.description});
      });
      this.multiselectRole.dataList = resultList;

    }

    openGroupModal(groupId?: string) {
      let dialogRef: MatDialogRef<UserGroupEditComponent>;
      dialogRef = this.dialog.open(UserGroupEditComponent, { data: { groupId: groupId }, width: '1200px' });
      dialogRef.afterClosed().pipe().subscribe( { next: () => {
        this.fetchAllGroups();
      }});
    }

}
