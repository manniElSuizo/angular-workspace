import { Component, OnInit, Inject, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators, AbstractControl, FormGroup} from '@angular/forms';
import { CustomerGroupListResponse, RolesListResponse, UserListRequest, UserListResponse, UserListService } from '../user-list/user-list.service';
import { DialogPosition, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { empty, Subject, Subscription } from 'rxjs';
import { AccUserType, emptyUser, User, UserData, UserResponse } from '../model/user.model';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Role } from '../model/role.model';
import { SharedModule } from '@src/app/shared/shared.module';
import { PickListModule } from '@src/app/shared/components/pick-list/pick-list.module';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ConfirmationComponent } from '@src/app/shared/components/confirmations/confirmation.component';
import { ErrorDialogComponent } from '@src/app/shared/components/api-error/api-error.component';
import { WagonKeeperFormComponent } from './wagon-keeper/wagon-keeper-form.component';
import { ListKeyValue, MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { CustomerGroup } from '../model/customergroup.model';
import { UserGroup } from '../model/usergroup.model';
import { AccountsReceivableNumberComponent } from './accounts-receivable-number/accounts-receivable-number-form.component';
import { UserAuthorizationsFormComponent } from './user-authorizations/user-authorizations-form.component';
import { UserGroupComponent } from './user-group/user-group.component';
import { UserManagementService } from '../user-management.service';
import { ConfirmationDialogTemplateComponent } from '@src/app/shared/components/confirmations/confirmation-dialog-template/confirmation-dialog-template.component';
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
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    PickListModule,
    WagonKeeperFormComponent,
    AccountsReceivableNumberComponent,
    UserAuthorizationsFormComponent,
    FormDialogModule
  ]
})
export class UserEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(WagonKeeperFormComponent) wagonKeeperComponent!: WagonKeeperFormComponent;
  @ViewChild(AccountsReceivableNumberComponent) accountsReceivableNumberComponent!: AccountsReceivableNumberComponent;
  @ViewChild(UserAuthorizationsFormComponent) userAuthorizationsFormComponent!: UserAuthorizationsFormComponent;
  @ViewChild('mssr') multiselectRole: MultiselectAutocompleteComponent;
  @ViewChild('mssg') multiselectCustomerGroup: MultiselectAutocompleteComponent;

  formGroup: FormGroup;
  loadingInProgress: boolean;
  loadingSave: boolean;
  availableRoles: Role[];
  availableCustomerGroups: CustomerGroup[];
  isInternalUser: Boolean;
  userTypes = Object.values(AccUserType);

  userListRequest: UserListRequest = {
    limit: 1000,
    offset: 0,
    type: undefined,
    userName: undefined
  }

  protected multiselectAutocompleteParametersRole: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersCustomerGroup: MultiselectAutocompleteParameters;

  public userNameExists = false;
  public userId?: number;
  public copiedUserId?: number;
  user: User;
  copiedUser: User;
  private subject = new Subject<any>();
  private subscription: Subscription = new Subscription();

  groupTableHeaders: any[] = [];


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modalWindows: ModalWindows,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UserEditComponent>,
    private userListService: UserListService,
    protected userManagementService: UserManagementService) {
      if(data.copyUser) {
        this.copiedUserId = data.userId
      } else if(data.userId){
        this.userId = data.userId;
      } else {
        this.user = emptyUser();
      }

      this.createTableHeaders();
    }

  ngOnInit(): void {
    this.fetchExistingRoles();
    this.fetchCustomerGroups();


    if(this.userId) {
      this.fetchUser(this.userId);
    } else if(this.copiedUserId) {
      this.fetchUser(this.copiedUserId, true);
    }

    this.changeTab(0);
    this.changeTabTitle('1. ' + this.translate.instant('User-management-component.User-profile'));

    this.setMultiselectParamsRole();
    this.setMultiselectParamsCustomerGroup();
    this.prepareForm();
  }

  ngAfterViewInit(): void {
    this.formGroup.addControl('childFormWagonKeeper', this.wagonKeeperComponent.wagonKeeperForm);
    this.wagonKeeperComponent.wagonKeeperForm.setParent(this.formGroup);

    this.formGroup.addControl('childFormAccountsReceivableNumbers', this.accountsReceivableNumberComponent.accountsReceivableNumberForm);
    this.accountsReceivableNumberComponent.accountsReceivableNumberForm.setParent(this.formGroup);

    this.formGroup.addControl('childFormRole', this.multiselectRole.multiselectForm);
    this.multiselectRole.multiselectForm.setParent(this.formGroup);

    this.formGroup.addControl('childFormCustomerGroup', this.multiselectCustomerGroup.multiselectForm);
    this.multiselectCustomerGroup.multiselectForm.setParent(this.formGroup);

  }

  private createTableHeaders(): void {
    this.groupTableHeaders = [
      { text: this.translate.instant('User-management-component.UserGroup.customer'), value: 'customer', width: "450px"},
      { text: this.translate.instant('User-management-component.UserGroup.groupName'), value: 'groupName'},
    ];
  }


  private prepareForm() {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      salutation: new FormControl(''),
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      email: new FormControl('', [Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]),
      secondaryEmail: new FormControl('', [Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]),
      phone: new FormControl('', [Validators.pattern('[0-9]+')]),
      profileIds: new FormControl(),
      usertype: new FormControl(null, [Validators.required]),
      usertypeReadonly: new FormControl(''),
    });
    if(!this.userId) {
      this.usertype.valueChanges
      .pipe(
        debounceTime(100),   // dalay after every change to update your validations
        distinctUntilChanged(), // only update validators when value change
        tap(value => {

          if(value == AccUserType.INTERNAL) {
            this.isInternalUser = true;
          } else if(value == AccUserType.EXTERNAL) {
            this.isInternalUser = false;
          }else {
            this.isInternalUser = undefined;
          }
        })
      )
      .subscribe();
    }

  }

  private setMultiselectParamsRole() {

    this.multiselectAutocompleteParametersRole = {
      i18n: {
        fieldText: this.translate.instant('User-management-component.Role-label'),
        labelText: this.translate.instant('User-management-component.Role-label'),
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

  private setMultiselectParamsCustomerGroup() {

    this.multiselectAutocompleteParametersCustomerGroup = {
      i18n: {
        fieldText: this.translate.instant('User-management-component.Customergroup-label'),
        labelText: this.translate.instant('User-management-component.Customergroup-label'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('User-management-component.SearchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('User-management-component.NoDataAvailablePlaceholderText')
      },
      fieldName: "customergroup",
      fieldId: "customergroup",
      divId: "customergroupDiv",
      formControlName: "customergroup",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.getCustomerGroupSuggestions(searchInput, array);
      },
      selectedItems: [],
      minQueryLength: -1
    };
  }

  setRoleValues(): void {
    this.multiselectRole.selectedItems = this.user.roles && this.user.roles.length ? this.user.roles.map(r => {
      return {key: r.id.toString(), value: r.description};
    }) : [];
    this.multiselectRole.updateKeyValueList();
    this.role.setValue(this.user.roles && this.user.roles.length ? this.user.roles.map(r => {
      return {key: r.id.toString(), value: r.description};
    }) : null);
  }

  setCustomerGroupValues(): void {
    this.multiselectCustomerGroup.selectedItems = this.user.customerGroups && this.user.customerGroups.length ? this.user.customerGroups.map(r => {
      return {key: r.id.toString(), value: r.groupName};
    }) : [];
    this.multiselectCustomerGroup.updateKeyValueList();
    this.customergroup.setValue(this.user.customerGroups && this.user.customerGroups.length ? this.user.customerGroups.map(r => {
      return {key: r.id.toString(), value: r.groupName};
    }) : null);
  }

  setPrimaryGroup(group: UserGroup): void {
    this.user.primaryGroupId = group.groupId;
  }

  getGroupCustomer(group: UserGroup): string {
    if(!group.customerProfile.sgv.companyLocationNumber) {
      return group.customerProfile.sgv.sgvId + ' / *';
    } else {
      return '(' + group.customerProfile.sgv.sgvId + ' / ' + group.customerProfile.sgv.companyLocationNumber + ') ' + (group.customerProfile.sgv.customerName ?? "");
    }
  }

  getGroupInfo(group: UserGroup): string {
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

  private fetchExistingRoles(): void {
    let isInternal = true;
    this.userListService.fetchRoles(isInternal).subscribe({
      next: (result) => {
        const roleListResponse: RolesListResponse = result;
        this.availableRoles = roleListResponse.roles;
        this.getRoleSuggestions('', null);
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    });
  }

  private fetchCustomerGroups(): void {
    this.userListService.fetchCustomerGroups().subscribe({
      next: (result) => {
        const customerGroupListResponse: CustomerGroupListResponse = result;
        this.availableCustomerGroups = customerGroupListResponse.groups;
        this.getCustomerGroupSuggestions('', null);
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    });
  }

  checkUser(): void {
    const filterValue = this.formGroup.get("username")?.value.trim();
    const filterLength = filterValue?.length;
    if(filterLength > 2 && filterValue != this.userListRequest.userName) {
      setTimeout(() => this.doFilter(), 500);
    } else if(this.userListRequest.userName && this.userListRequest.userName?.length > filterLength && filterLength == 0) {
;      this.doFilter();
    }
  }

  doFilter() {
    this.userListRequest.userName = this.formGroup.get("username")?.value.trim();
    this.requestUserList();
  }

  private requestUserList() {
    this.loadingInProgress = true;
    this.userListService.requestAccUserList(this.userListRequest).subscribe({
      next: (response) => {
        const userListResponse: UserListResponse = response;
        const itemValue = this.formGroup.get("username")?.value.trim();

        this.userNameExists = false;

        userListResponse.users?.forEach(user => {
          if (user?.userName.toLocaleLowerCase() == itemValue.toLocaleLowerCase()) {
            this.userNameExists = true;
          }
        });

      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgress = false;
    });
  }
  ngOnDestroy(): void {
      this.subscription.unsubscribe();
  }

  openUserGroupModal() {
    let dialogRef: MatDialogRef<UserGroupComponent>;
    dialogRef = this.dialog.open(UserGroupComponent, { data: { user: this.user }, width: '1150px' });
    dialogRef.afterClosed().pipe().subscribe( { next: () => {
    }});
  }


  fetchUser(userId: number, copyUser?: boolean): void {
    this.loadingInProgress = true;
    this.userListService.fetchUser(userId).subscribe({
      next: (userResp: UserResponse) => {
        if(!copyUser) {
          this.user = userResp.user;
          this.username?.setValue(this.user.userName);
          document.getElementById('inputUserName')?.style.setProperty('opacity', '0.4');
          this.usertypeReadonly?.setValue(this.user.userType);
          this.usertype.setValue(this.user.userType);
          document.getElementById('inputUserType')?.style.setProperty('opacity', '0.4');
          this.salutation?.setValue(this.user.salutation);
          this.firstname?.setValue(this.user.firstname);
          this.lastname?.setValue(this.user.lastname);
          this.email?.setValue(this.user.email);
          this.secondaryEmail?.setValue(this.user.secondaryEmail);
          this.phone?.setValue(this.user.phone);
          this.isInternalUser = this.user.userType == AccUserType.INTERNAL;
        } else {
          this.copiedUser = userResp.user;
          this.user = emptyUser();
          this.user.groups = this.copiedUser.groups;
          this.user.wagonKeepers = this.copiedUser.wagonKeepers;
          this.user.accountsReceivableNumbers = this.copiedUser.accountsReceivableNumbers;
        }

        this.sortGroups(this.user.groups);

        this.setRoleValues();
        this.setCustomerGroupValues();
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgress = false;
    });
  }

  sortGroups(groups: UserGroup[]): void {
    groups.sort((a, b) => this.getGroupCustomer(a).localeCompare(this.getGroupCustomer(b)) ?? a.groupName.localeCompare(b.groupName));
  }

  public openConfirmationModal(): void {
    const data: DialogPosition = { top: '30vh' };
    let config: MatDialogConfig = { position: data, width: '400px', height: '250px' };
    this.openDialog(ConfirmationComponent, config);
    this.subject.subscribe(decision => {
      if (decision == true) {
        this.dialogRef.close();
      }
    });
  }

  public openDialog<T>(comp: new (...args: any[]) => T, config: any): void {
    let dialogRef: MatDialogRef<T>;
    dialogRef = this.dialog.open(comp, config);
    dialogRef.afterClosed().subscribe(decision => {
      this.subject.next(decision);
    });
  }

  doSaveUser(): void {
    if (!this.validateInput()) {
      return;
    }

    this.saveUser(this.userId,
                  this.usertype?.value,
                  this.username?.value.trim(),
                  this.salutation?.value,
                  this.firstname?.value,
                  this.lastname?.value,
                  this.email?.value,
                  this.secondaryEmail?.value,
                  this.phone?.value,
                  this.user.groups ? this.user.groups.map((g: UserGroup) => g.groupId) : [],
                  this.role?.value ? this.role?.value?.map((lkv: ListKeyValue) => parseInt(lkv.key)) : [],
                  this.customergroup?.value ? this.customergroup?.value?.map((lkv: ListKeyValue) => parseInt(lkv.key)) : [],
                  this.wagonKeeperComponent.getWagonKeeperCodes(),
                  this.accountsReceivableNumberComponent.getAccountsReceivableNumbers(),
                  this.user.primaryGroupId
                );
  }

  private validateInput(): boolean {

    if (!this.username?.value.trim()) {
      alert('Der Benutzername fehlt');
      return false;
    }
    if (!this.usertype?.value) {
      alert('Der Benutzer-Typ fehlt');
      return false;
    }
    if (this.isInternalUser && !this.multiselectRole.selectedItems?.length) {
      alert('Internen Benutzern muss mindestens eine Rolle zugeordnet werden');
      return false;
    }
    return true;
  }

  setAuthorizationsChanged(changed: boolean): void {
    this.user.authorizationsChanged = changed;
  }

  deleteUserGroups(): void {
    const dialogRef = this.openConfirmationDialogModal(
          ConfirmationDialogTemplateComponent,
          this.translate.instant('User-management-component.Confirmation.Delete-groups-confirmation-header'),
          this.translate.instant('User-management-component.Confirmation.Delete-groups-confirmation-body'));

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.user.groups = [];
            this.user.primaryGroupId = null;
          }
        });
  }

  public openConfirmationDialogModal<T>(comp: new (...args: any[]) => T, headerText: string, bodyText: string): MatDialogRef<T> {
    const data: any = { top: '30vh' };
    let config: MatDialogConfig = { position: data, width: '400px', height: '270px' };
    config.data = { headerText: headerText, bodyText: bodyText };

    let dialogRef: MatDialogRef<T>;
    dialogRef = this.dialog.open(comp, config);

    return dialogRef;
  }

  saveUser(userId: number | undefined,
            userType: AccUserType,
            username: string,
            salutation: string,
            firstname: string,
            lastname: string,
            email: string,
            secondaryEmail: string,
            phone: string,
            groupIds: number[],
            roleIds: number[],
            customerGroupIds: number[],
            wagonKeepers: string[],
            accountsReceivableNumbers: string[],
            primaryGoupId: number

  ): void {
    this.loadingSave = true;
    let user: UserData = new UserData();
    user.userId = userId;
    user.userName = username;
    user.salutation = salutation;
    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.secondaryEmail = secondaryEmail;
    user.phone = phone;
    user.userType = userType;
    user.groupIds = groupIds;
    user.roleIds = roleIds;
    user.customerGroupIds = customerGroupIds;
    user.wagonKeepers = wagonKeepers;
    user.accountsReceivableNumbers = accountsReceivableNumbers;
    user.primaryGroupId = primaryGoupId;

    if(user.groupIds?.length && !user.primaryGroupId) {
      user.primaryGroupId = user.groupIds.at(0);
    }


    if(user.userId) {
      this.userListService.modifyUser(user).subscribe({
        next: (result) => {
          if(!result.success) {
            console.log(result);
            this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} );
            this.loadingSave = false;
          } else {
            let confirmation = this.translate.instant('User-management-component.Confirmation.Save-confirmation');
            this.modalWindows.openConfirmationDialog(confirmation, 3);
            this.dialogRef.close();
          }
        },
        error: (err) => {
          this.modalWindows.openErrorDialog({ apiProblem: err.error });
          console.error(err);
        }
      });
    } else {
      this.userListService.createlUser(user).subscribe({
        next: (result) => {
          if(!result.success) {
            this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} );
            this.loadingSave = false;
          } else {
            let confirmation = this.translate.instant('User-management-component.Confirmation.Save-confirmation');
            this.modalWindows.openConfirmationDialog(confirmation, 3);
            this.dialogRef.close();
          }
        },
        error: (err) => {
          this.modalWindows.openErrorDialog({ apiProblem: err.error });
          console.error(err);
        }
      });
    }
  }

  private getRoleSuggestions(searchInput: string, selected: ListKeyValue[]) {

    let searchResult = this.availableRoles.filter(function(r) {
      return r.description.toLowerCase().startsWith(searchInput.toLocaleLowerCase());
    });
    searchResult = searchResult.sort((a, b) => a.description.localeCompare(b.description));

    const resultList: ListKeyValue[] = selected ? [...selected] : [];


    searchResult.forEach(r => {
      if(!resultList.find(kv => kv.key == r.id.toString()))
        resultList.push({key: r.id.toString(), value: r.description});
    });
    this.multiselectRole.dataList = resultList;

    return resultList;
  }

  private getCustomerGroupSuggestions(searchInput: string, selected: ListKeyValue[]) {

    let searchResult = this.availableCustomerGroups.filter(function(g) {
      return g.groupName.toLowerCase().startsWith(searchInput.toLocaleLowerCase());
    });
    searchResult = searchResult.sort((a, b) => a.groupName.localeCompare(b.groupName));

    const resultList: ListKeyValue[] = selected ? [...selected] : [];


    searchResult.forEach(g => {
      if(!resultList.find(kv => kv.key == g.id.toString()))
        resultList.push({key: g.id.toString(), value: g.groupName});
    });
    this.multiselectCustomerGroup.dataList = resultList;

    return resultList;
  }

  removeUserGroup(group: UserGroup): void {
    if(this.user.primaryGroupId == group.groupId) {
      this.user.primaryGroupId = null;
    }
    this.user.groups.splice(this.user.groups.indexOf(group), 1);
  }

  get role(): AbstractControl | null {
    return this.multiselectRole.multiselectForm.get(this.multiselectAutocompleteParametersRole.fieldId) as FormControl;
  }
  get customergroup(): AbstractControl | null {
    return this.multiselectCustomerGroup.multiselectForm.get(this.multiselectAutocompleteParametersCustomerGroup.fieldId) as FormControl;
  }
  get usertype(): AbstractControl | null {
    return this.formGroup.get('usertype');
  }
  get usertypeReadonly(): AbstractControl | null {
    return this.formGroup.get('usertypeReadonly');
  }
  get username(): AbstractControl | null {
    return this.formGroup.get('username');
  }
  get salutation(): AbstractControl | null {
    return this.formGroup.get('salutation');
  }
  get firstname(): AbstractControl | null {
    return this.formGroup.get('firstname');
  }
  get lastname(): AbstractControl | null {
    return this.formGroup.get('lastname');
  }
  get email(): AbstractControl | null {
    return this.formGroup.get('email');
  }
  get secondaryEmail(): AbstractControl | null {
    return this.formGroup.get('secondaryEmail');
  }
  get phone(): AbstractControl | null {
    return this.formGroup.get('phone');
  }

  // Logic for TAB changing
  protected currentTab = 0;
  private tabs = ['userData', 'wagonKeeper', "accountsReceivableNumber", "userAuthorizations"];
  nextTab() {
    if (this.currentTab < this.tabs.length - 1) {
        this.currentTab++;
    }

    this.changeTab(this.currentTab);
  }

  prevTab() {
      if (this.currentTab >= 1) {
          this.currentTab--;
      }

      this.changeTab(this.currentTab);
  }

  protected changeTab(tabNumber: number) {
      const tabName = this.tabs[tabNumber];
      this.currentTab = tabNumber;
      document.querySelectorAll<HTMLElement>('.input-block-complete').forEach(el => {
          if (el.id == tabName) el.style.display = 'grid';
          else el.style.display = 'none';
      });

      let tabTitle = '';
      let counter = 1;
      document.querySelectorAll<HTMLElement>('.tabs-item').forEach(el => {
          if (el.id == tabName + 'Head') {
              el.classList.add('tabs-item-selected');
              tabTitle = counter + '. ' + el.getElementsByTagName('a')[0].innerText;
          } else {
              el.classList.remove('tabs-item-selected');
          }

          counter++;
      });
      this.changeTabTitle(tabTitle);

      if(tabName == "userAuthorizations" && ! this.userAuthorizationsFormComponent.loaded && !this.loadingInProgress) {
        this.userAuthorizationsFormComponent.fetchAuth();
      }
  }

  private changeTabTitle(text: string) {
      document.querySelectorAll<HTMLElement>('.tab-title').forEach(el => el.innerText = text);
  }
}
