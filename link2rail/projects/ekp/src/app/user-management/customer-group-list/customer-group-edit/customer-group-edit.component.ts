import { Component, OnInit, Inject, OnDestroy, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators, AbstractControl, FormGroup} from '@angular/forms';
import { DialogPosition, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Role } from '../../model/role.model';
import { SharedModule } from '@src/app/shared/shared.module';
import { PickListModule } from '@src/app/shared/components/pick-list/pick-list.module';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ConfirmationComponent } from '@src/app/shared/components/confirmations/confirmation.component';
import { ErrorDialogComponent } from '@src/app/shared/components/api-error/api-error.component';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { ConfirmationDialogTemplateComponent } from '@src/app/shared/components/confirmations/confirmation-dialog-template/confirmation-dialog-template.component';
import { CustomerGroupListRequest, CustomerGroupListResponse, CustomerGroupListService } from '../customer-group-list.service';
import { CustomerGroup, CustomerGroupData, CustomerGroupResponse, emptyGroup } from '../../model/customergroup.model';
import { UserGroup } from '../../model/usergroup.model';
import { UserGroupComponent } from './user-group/user-group.component';
import { UserManagementService } from '../../user-management.service';

@Component({
  selector: 'app-customer-group-edit',
  templateUrl: './customer-group-edit.component.html',
  styleUrls: ['./customer-group-edit.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    PickListModule,
    FormDialogModule
  ]
})
export class CustomerGroupEditComponent implements OnInit, AfterViewInit, OnDestroy {
  formGroup: FormGroup;
  loadingInProgress: boolean;
  loadingSave: boolean;
  availableRoles: Role[];
  availableModules: Map<String, Role[]> = new Map<String, Role[]>();

  customerGroupListRequest: CustomerGroupListRequest = {
    limit: 25,
    offset: 0,
    groupName: undefined
  }
  private subject = new Subject<any>();
  public customerGroupNameExists = false;
  public groupId?: number;
  group: CustomerGroup;

  groupTableHeaders: any[] = [];


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modalWindows: ModalWindows,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CustomerGroupEditComponent>,
    private customerGroupListService: CustomerGroupListService,
    protected userManagementService: UserManagementService) {
      this.groupId = data.groupId;
      if(!this.groupId) {
        this.group = emptyGroup();
      }

      this.createTableHeaders();
     }

  ngOnInit(): void {

    if(this.groupId) {
      this.fetchCustomerGroup(this.groupId);
    }

    this.prepareForm();
  }

  ngAfterViewInit(): void {
  }

  private prepareForm() {
    this.formGroup = new FormGroup({
      groupname: new FormControl('', [Validators.required])
    });

  }

  private createTableHeaders(): void {
    this.groupTableHeaders = [
      { text: this.translate.instant('User-management-component.UserGroup.customer'), value: 'customer', width: "600px"},
      { text: this.translate.instant('User-management-component.UserGroup.groupName'), value: 'groupName'},
    ];
  }

  checkCustomerGroup(): void {
    const filterValue = this.groupname?.value;
    const filterLength = filterValue?.length;
    console.log("test");
    if(filterLength > 2 && filterValue != this.customerGroupListRequest.groupName) {
      setTimeout(() => this.doFilter(), 500);
    } else if(this.customerGroupListRequest.groupName && this.customerGroupListRequest.groupName?.length > filterLength && filterLength == 0) {
      this.doFilter();
    }

  }

  doFilter() {
    this.customerGroupListRequest.groupName = this.groupname?.value;
    this.requestCustomerGroupList();
  }

  private requestCustomerGroupList() {
    this.loadingInProgress = true;
    this.customerGroupListService.searchCustomerGroup(this.customerGroupListRequest).subscribe({
      next: (response) => {
        const customerGroupListResponse: CustomerGroupListResponse = response;
        const itemValue = this.groupname?.value;

        let exists = false;
        if(customerGroupListResponse.groups?.length > 0) {
          customerGroupListResponse.groups.find(el => el.groupName == itemValue && el.id != this.groupId) ? exists = true : exists = false;
        }

        this.customerGroupNameExists = exists;
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

  }

  fetchCustomerGroup(groupId: number) {
    this.loadingInProgress = true;
    this.customerGroupListService.fetchCustomerGroup(groupId).subscribe({
      next: (groupResp: CustomerGroupResponse) => {
        this.group = groupResp.group;
        this.groupname?.setValue(this.group.groupName);
        this.sortGroups(this.group.userGroups);
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

  doSaveCustomerGroup(): void {
    if (!this.validateInput()) {
      return;
    }

    this.saveCustomerGroup(
      this.group.id,
      this.groupname?.value,
      [],
      this.group.userGroups.map(ug => ug.groupId)
    );
  }

  private validateInput(): boolean {

    if (!this.groupname?.value) {
      alert('Der Gruppenname fehlt');
      return false;
    }

    return true;
  }

  saveCustomerGroup(groupId: number | undefined,
            groupName: string,
            roleIds: number[],
            userGroupIds: number[]
  ): void {
    this.loadingSave = true;

    let group: CustomerGroupData = new CustomerGroupData();
    group.groupId = groupId;
    group.groupName = groupName;
    group.roleIds = roleIds;
    group.userGroupIds = userGroupIds;

    if(group.groupId) {
      this.customerGroupListService.modifyCustomerGroup(group).subscribe({
        next: (result) => {
          if(!result.success) {
            console.log(result);
            this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} )
            this.loadingSave = false;
          } else {
            let confirmation = this.translate.instant('User-management-component.CustomerGroup.Confirmation.Save-confirmation');
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
      this.customerGroupListService.createCustomerGroup(group).subscribe({
        next: (result) => {
          if(!result.success) {
            this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} );
            this.loadingSave = false;
          } else {
            let confirmation = this.translate.instant('User-management-component.CustomerGroup.Confirmation.Save-confirmation');
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

  deleteUserGroup(): void {

    const dialogRef = this.openConfirmationDialogModal(
      ConfirmationDialogTemplateComponent,
      this.translate.instant('User-management-component.CustomerGroup.Confirmation.Delete-confirmation-header'),
      this.translate.instant('User-management-component.CustomerGroup.Confirmation.Delete-confirmation-body'));

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingSave = true;
        this.customerGroupListService.deleteCustomerGroup(this.group.id.toString()).subscribe({

          next: (result) => {
            if(!result.success) {
              this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} );
              this.loadingSave = false;
            } else {
              let confirmation = this.translate.instant('User-management-component.CustomerGroup.Confirmation.Delete-confirmation');
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

  removeUserGroup(group: UserGroup): void {
    this.group.userGroups.splice(this.group.userGroups.indexOf(group), 1);
  }

  openUserGroupModal() {
    let dialogRef: MatDialogRef<UserGroupComponent>;
    dialogRef = this.dialog.open(UserGroupComponent, { data: { group: this.group }, width: '1150px' });
    dialogRef.afterClosed().pipe().subscribe( { next: () => {
    }});
  }

}
