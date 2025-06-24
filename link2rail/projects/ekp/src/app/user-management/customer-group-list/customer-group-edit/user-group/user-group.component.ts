import { Component, OnInit, Inject, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl,  AbstractControl, FormGroup} from '@angular/forms';
import { debounceTime} from 'rxjs/operators';
import { MarketareaCustomerNamePipe } from '@src/app/trainorder/pipes/marketarea-customer-name.pipe';
import { SharedModule } from '@src/app/shared/shared.module';
import { PickListModule } from '@src/app/shared/components/pick-list/pick-list.module';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ListKeyValue, MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Role } from '@src/app/user-management/model/role.model';
import { UserGroup } from '@src/app/user-management/model/usergroup.model';
import { UserListService, RolesListResponse } from '@src/app/user-management/user-list/user-list.service';
import { UserGroupListResponse } from '../../customer-group-list.service';
import { CustomerGroup } from '@src/app/user-management/model/customergroup.model';
import { CustomerProfile } from '@src/app/user-management/model/profile.model';
export interface FormItem {
  name: string,
  selected: boolean,
  roleId: number
}
export interface ViewItem {
  roles: Role[],
  profileId: number,
  sgvId: string,
  companyLocationNumber: string,
  formItems: FormItem[]
}
@Component({
  selector: 'app-user-group-edit',
  templateUrl: './user-group.component.html',
  styleUrls: ['./user-group.component.scss'],
  providers: [MarketareaCustomerNamePipe],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    PickListModule,
    FormDialogModule
  ]
})
export class UserGroupComponent implements AfterViewInit, OnInit {
  @ViewChild('mssc') multiselectCustomer: MultiselectAutocompleteComponent;
  @ViewChild('mssr') multiselectRole: MultiselectAutocompleteComponent;

  filterForm: FormGroup;
  loadingInProgress: boolean;

  protected multiselectAutocompleteParametersCustomer: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersRole: MultiselectAutocompleteParameters;

  group: CustomerGroup;
  tableHeaders: any[] = [];
  availableGroups: UserGroup[];
  availableCustomers: CustomerProfile[];
  availableRoles: Role[];
  filteredGroups: UserGroup[];
  displayGroups: UserGroup[];
  addedGroups: UserGroup[] = [];
  limit: number = 10;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private userListService: UserListService,
    private modalWindows: ModalWindows,
    private dialogRef: MatDialogRef<UserGroupComponent>,
    private translate: TranslateService) {
      this.group = data.group;
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
      { text: this.translate.instant('User-management-component.UserGroup.customer'), value: 'customer'},
      { text: this.translate.instant('User-management-component.UserGroup.groupName'), value: 'groupName'},
      { text: this.translate.instant('User-management-component.UserGroup.roles'), value: 'roles'},
    ];
  }

  clearSearchInput() {
    this.groupname.setValue("");
  }

  loadMore(): void {
    this.filterGroups(this.limit + 10);
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
      this.limit = 10;
    }

    let assingedGroupIds = this.group.userGroups.map((g) => g.groupId);
    assingedGroupIds = assingedGroupIds.concat(this.addedGroups.map((g) => g.groupId));

    const groupName = this.groupname.value.toLowerCase();
    this.filteredGroups =
      this.availableGroups
        .filter((g) => !assingedGroupIds.includes(g.groupId))
        .filter((g) => g.groupName.toLowerCase().indexOf(groupName) >= 0 || this.getGroupCustomer(g).toLowerCase().indexOf(groupName) >= 0);

    if(this.multiselectCustomer.selectedItems?.length > 0) {
      this.filteredGroups = this.filteredGroups.filter((g) => this.multiselectCustomer.selectedItems.find(c => c.key == g.customerProfile.customerProfileId.toString()));
    }

    if(this.multiselectRole.selectedItems?.length > 0) {
      this.filteredGroups = this.filteredGroups.filter((g) => g.roles?.find(r => this.multiselectRole.selectedItems.find(c => c.key == r.id.toString())));
    }

    this.filteredGroups.sort((a, b) => this.getCustomer(a.customerProfile).localeCompare(this.getCustomer(b.customerProfile)) ?? a.groupName.localeCompare(b.groupName));

    this.displayGroups = this.filteredGroups.slice(0, this.limit);
    this.loadingInProgress = false;
  }

  protected multiselectChangeEventListener($event: any) {
    this.filterGroups();  }

  fetchAllGroups() {
    this.loadingInProgress = true;
    this.userListService.fetchUserGroups().subscribe({
      next: (result) => {
        const userGroupListResponse: UserGroupListResponse = result;
        this.availableGroups = userGroupListResponse.usergroups;

        this.availableCustomers = Array.from(new Set(this.availableGroups.filter(group => group.customerProfile?.sgv).map(group => group.customerProfile)));
        this.availableCustomers.sort((a, b) => this.getCustomer(a).localeCompare(this.getCustomer(b)));
        this.fetchAllRoles();
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
    this.userListService.fetchRoles(false).subscribe({
          next: (result) => {
            const roleListResponse: RolesListResponse = result;
            this.availableRoles = roleListResponse.roles;
            this.availableRoles.sort((a, b) => a.role.localeCompare(b.role));
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

  addUserGroup(group: UserGroup) {
    this.addedGroups.push(group);
    let index = this.filteredGroups.indexOf(group);
    if(index >= 0)
      this.filteredGroups.splice(index, 1);

    this.displayGroups = this.filteredGroups.slice(0, this.limit);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  updateGroupList() {
    this.closeDialog();
    this.addedGroups.forEach((g) => this.group.userGroups.push(g));
    this.group.userGroups.sort((a, b) => this.getCustomer(a.customerProfile).localeCompare(this.getCustomer(b.customerProfile)) ?? a.groupName.localeCompare(b.groupName));
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

}
