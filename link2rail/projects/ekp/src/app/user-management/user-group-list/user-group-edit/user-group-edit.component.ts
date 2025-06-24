import { Component, OnInit, Inject, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators, AbstractControl, FormGroup} from '@angular/forms';
import { DialogPosition, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Role } from '../../model/role.model';
import { SharedModule } from '@src/app/shared/shared.module';
import { PickListModule } from '@src/app/shared/components/pick-list/pick-list.module';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ConfirmationComponent } from '@src/app/shared/components/confirmations/confirmation.component';
import { ErrorDialogComponent } from '@src/app/shared/components/api-error/api-error.component';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { emptyGroup, UserGroup, UserGroupData, UserGroupResponse } from '../../model/usergroup.model';
import { CustomerProfileListRequest, CustomerProfileListResponse, RolesListResponse, UserGroupListRequest, UserGroupListResponse, UserGroupListService } from '../user-group-list.service';
import { CustomerProfile, CustomerProfileData } from '../../model/profile.model';
import { ConfirmationDialogTemplateComponent } from '@src/app/shared/components/confirmations/confirmation-dialog-template/confirmation-dialog-template.component';
import { UserManagementService } from '../../user-management.service';

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
  templateUrl: './user-group-edit.component.html',
  styleUrls: ['./user-group-edit.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    PickListModule,
    FormDialogModule
  ]
})
export class UserGroupEditComponent implements OnInit, AfterViewInit, OnDestroy {
  formGroup: FormGroup;
  loadingInProgress: boolean;
  loadingSave: boolean;
  availableRoles: Role[];
  availableModules: Map<String, Role[]> = new Map<String, Role[]>();

  userGroupListRequest: UserGroupListRequest = {
    limit: 25,
    offset: 0,
    profileId: undefined,
    groupName: undefined
  };

  public userGroupNameExists = false;
  customerProfileExists = true;
  public groupId?: number;
  group: UserGroup;
  private subject = new Subject<any>();
  private subscription: Subscription = new Subscription();
  private customerInputChange: Subject<string> = new Subject<string>();
  availableCustomers: CustomerProfile[] = [];

  tableHeaders: any[] = [];
  customerAutoComplete: CustomerProfile[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modalWindows: ModalWindows,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UserGroupEditComponent>,
    private userGroupListService: UserGroupListService,
    protected userManagementService: UserManagementService) {
      this.groupId = data.groupId;
      if(!this.groupId) {
        this.group = emptyGroup();
      }

      this.createTableHeaders();
     }

  ngOnInit(): void {
    this.fetchExistingRoles();

    if(this.groupId) {
      this.fetchUserGroup(this.groupId);
    } else {
      this.fetchCustomerProfiles();
    }
    this.changeTab(0);
    this.changeTabTitle('1. ' + this.translate.instant('User-management-component.Usergroup-edit-header'));

    this.prepareForm();

    this.subscription.add(
      this.customerInputChange.pipe(debounceTime(500)).subscribe((input) => {
          this.getCustomerAutocompleteSuggestions(input);
      })
    );
  }

  ngAfterViewInit(): void {
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      { text: this.translate.instant('User-management-component.UserGroup.role'), value: 'role'},
      { text: this.translate.instant('User-management-component.UserGroup.profileRole'), value: 'profileRole', width: "100px"},
      { text: this.translate.instant('User-management-component.UserGroup.relationRole'), value: 'relationRole', width: "135px"}
    ];
  }

  private prepareForm() {
    this.formGroup = new FormGroup({
      groupname: new FormControl('', [Validators.required]),
      customerProfile: new FormControl('', [Validators.required])
    });

  }

  private fetchExistingRoles(): void {
    let isInternal = false;
    this.userGroupListService.fetchRoles(isInternal).subscribe({
      next: (result) => {
        const roleListResponse: RolesListResponse = result;
        this.availableRoles = roleListResponse.roles.sort((a, b) => a.module.localeCompare(b.module));

        this.availableModules.clear();
        this.availableRoles.forEach(role => {
          if (!this.availableModules.has(role.module)) {
            this.availableModules.set(role.module, []);
          }
          this.availableModules.get(role.module)?.push(role);
        });

      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    });
  }

  isRoleAssigned(role: Role, relation: boolean): boolean {
      let assigned = false;
      if(relation) {
        assigned = this.group?.relationRoles?.find(el => el.id == role.id) != undefined;
      }else {
        assigned = this.group?.roles?.find(el => el.id == role.id) != undefined;
      }
      return assigned;
  }

  onRoleChange(event: any, role: Role, relation: boolean) {
    if(relation) {
      if(event.target?.checked) {
        this.group.relationRoles.push(role);
        if(role.isExclusiveForModule) {
          this.group.relationRoles = this.group.relationRoles.filter(el => el.module != role.module || el.id == role.id);
        }
      } else {
        this.group.relationRoles = this.group.relationRoles.filter(el => el.id != role.id);
      }



    } else {
      if(event.target?.checked) {
        this.group.roles.push(role);
        if(role.isExclusiveForModule) {
          this.group.roles = this.group.roles.filter(el => el.module != role.module || el.id == role.id);
        }
      } else {
        this.group.roles = this.group.roles.filter(el => el.id != role.id);
      }


    }
  }

  listModules(): String[] {
    return Array.from(this.availableModules.keys());
  }

  getModuleRoles(module: String): Role[] {
    return (this.availableModules.get(module) ?? []).sort((a, b) => a.description.localeCompare(b.description));
  }

  checkUserGroup(): void {
    const filterValue = this.groupname?.value;
    const filterLength = filterValue?.length;

    if(this.group?.customerProfile?.customerProfileId) {
      if(filterLength > 2 && filterValue != this.userGroupListRequest.groupName) {
        setTimeout(() => this.doFilter(), 500);
      } else if(this.userGroupListRequest.groupName && this.userGroupListRequest.groupName?.length > filterLength && filterLength == 0) {
        this.doFilter();
      }
    }
  }

  doFilter() {
    this.userGroupListRequest.groupName = this.groupname?.value;
    this.userGroupListRequest.profileId = this.group?.customerProfile?.customerProfileId;
    this.requestUserGroupList();
  }

  private requestUserGroupList() {
    this.loadingInProgress = true;
    this.userGroupListService.searchUserGroup(this.userGroupListRequest).subscribe({
      next: (response) => {
        const userGroupListResponse: UserGroupListResponse = response;
        const itemValue = this.groupname?.value;

        let exists = false;
        if(userGroupListResponse.usergroups?.length > 0) {
          userGroupListResponse.usergroups.find(el => el.groupName == itemValue && el.groupId != this.groupId) ? exists = true : exists = false;
        }

        this.userGroupNameExists = exists;
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


  fetchUserGroup(groupId: number) {
    this.loadingInProgress = true;
    this.userGroupListService.fetchUserGroup(groupId).subscribe({
      next: (groupResp: UserGroupResponse) => {
        this.group = groupResp.group;
        this.groupname?.setValue(this.group.groupName);
        this.customerprofile.setValue(this.getCustomer(this.group.customerProfile));
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgress = false;
    });
  }

  fetchCustomerProfiles() {
    this.loadingInProgress = true;
    this.userGroupListService.requestAllCustomerProfiles().subscribe({
      next: (resp: CustomerProfileListResponse) => {
        this.availableCustomers = resp.customerProfiles;
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgress = false;
    });
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

  public openConfirmationDialogModal<T>(comp: new (...args: any[]) => T, headerText: string, bodyText: string): MatDialogRef<T> {
    const data: any = { top: '30vh' };
    let config: MatDialogConfig = { position: data, width: '400px', height: '300px' };
    config.data = { headerText: headerText, bodyText: bodyText };

    let dialogRef: MatDialogRef<T>;
    dialogRef = this.dialog.open(comp, config);

    return dialogRef;
  }


  public openDialog<T>(comp: new (...args: any[]) => T, config: any): void {
    let dialogRef: MatDialogRef<T>;
    dialogRef = this.dialog.open(comp, config);
    dialogRef.afterClosed().subscribe(decision => {
      this.subject.next(decision);
    });
  }

  doSaveUserGroup(): void {
    if (!this.validateInput()) {
      return;
    }

    this.saveUserGroup(
      this.group.groupId,
      this.groupname?.value,
      this.group.customerProfile?.customerProfileId,
      this.group.customerProfile?.sgv?.sgvId,
      this.group.customerProfile?.sgv?.companyLocationNumber,
      this.group.roles.map(role => role.id),
      this.group.relationRoles.map(role => role.id)
    );
  }

  private validateInput(): boolean {

    if (!this.groupname?.value) {
      alert('Der Gruppenname fehlt');
      return false;
    }
    if(!this.group.customerProfile || (!this.group.customerProfile.customerProfileId && !this.group.customerProfile.sgv.sgvId)) {
      alert("Das Kundenprofil fehlt");
      return false;
    }
    return true;
  }

  getCustomerList(event: any) {
      this.customerInputChange.next(event.target.value);
  }

  getCustomerAutocompleteSuggestions(input: string): void {
    this.customerAutoComplete = this.availableCustomers.filter(el => this.getCustomer(el).toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) >= 0).slice(0, 15);
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

  selectCustomer(event: any | null) {
    if (event === null || !event.target.value || event.target.value == '' || event.target.value == null) {
        this.customerProfileExists = true;
        return;
    }

    const input = event.target as HTMLInputElement;
    const selectedText = input.value;

    this.group.customerProfile = this.availableCustomers.find(el => this.getCustomer(el) == selectedText);

    if(this.group.customerProfile) {
      this.customerProfileExists = true;
      this.checkUserGroup();
    } else {
      this.customerProfileExists = false;
      this.userGroupNameExists = false;
    }
  }

  saveCustomerProfileAndUserGroup(
    sgvId: string | undefined,
    companyLocationNumber: string | undefined) {

    let profile: CustomerProfileData = new CustomerProfileData();
    profile.sgvId = sgvId;
    profile.companyLocationNumber = companyLocationNumber;

    this.userGroupListService.createCustomerProfile(profile).subscribe({
      next: (result) => {
        if(!result.success) {
          this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} )
        } else {
          this.group.customerProfile.customerProfileId = result.profileId;
          this.saveUserGroup(
            this.group.groupId,
            this.groupname?.value,
            this.group.customerProfile?.customerProfileId,
            this.group.customerProfile?.sgv?.sgvId,
            this.group.customerProfile?.sgv?.companyLocationNumber,
            this.group.roles.map(role => role.id),
            this.group.relationRoles.map(role => role.id)
          );
        }
      }, error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    });

  }

  saveUserGroup(groupId: number | undefined,
            groupName: string,
            profileId: number | undefined,
            sgvId: string | undefined,
            companyLocationNumber: string | undefined,
            roleIds: number[],
            relationRoleIds: number[]
  ): void {
    this.loadingSave = true;
    if(!profileId) {
      this.saveCustomerProfileAndUserGroup(sgvId, companyLocationNumber);
    } else {

      let group: UserGroupData = new UserGroupData();
      group.groupId = groupId;
      group.groupName = groupName;
      group.profileId = profileId;
      group.roleIds = roleIds;
      group.relationRoleIds = relationRoleIds;

      if(group.groupId) {
        this.userGroupListService.modifyUserGroup(group).subscribe({
          next: (result) => {
            if(!result.success) {
              console.log(result);
              this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} )
              this.loadingSave = false;
            } else {
              let confirmation = this.translate.instant('User-management-component.UserGroup.Confirmation.Save-confirmation');
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
        this.userGroupListService.createUserGroup(group).subscribe({
          next: (result) => {
            if(!result.success) {
              this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} );
              this.loadingSave = false;
            } else {
              let confirmation = this.translate.instant('User-management-component.UserGroup.Confirmation.Save-confirmation');
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
  }

  deleteUserGroup(): void {

    const dialogRef = this.openConfirmationDialogModal(
      ConfirmationDialogTemplateComponent,
      this.translate.instant('User-management-component.UserGroup.Confirmation.Delete-confirmation-header'),
      this.translate.instant('User-management-component.UserGroup.Confirmation.Delete-confirmation-body'));

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingSave = true;
        this.userGroupListService.deleteUserGroup(this.group.groupId.toString()).subscribe({

          next: (result) => {
            if(!result.success) {
              this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} );
              this.loadingSave = false;
            } else {
              let confirmation = this.translate.instant('User-management-component.UserGroup.Confirmation.Delete-confirmation');
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
    });
  }

  get groupname(): AbstractControl | null {
    return this.formGroup.get('groupname');
  }

  get customerprofile(): AbstractControl | null {
    return this.formGroup.get('customerProfile');
  }


  // Logic for TAB changing
  protected currentTab = 0;
  private tabs = ['groupData', 'userReferences'];
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

  }

  private changeTabTitle(text: string) {
      document.querySelectorAll<HTMLElement>('.tab-title').forEach(el => el.innerText = text);
  }
}
