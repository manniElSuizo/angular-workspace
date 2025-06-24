import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { User, AccUserTypeFilter} from '../model/user.model';
import { CustomerProfileListResponse, TMUserType, UserListRequest, UserListResponse, UserListService } from './user-list.service';
import { DeleteUserComponent } from '../delete-user/delete-user.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppService, ProgressState } from '@src/app/app.service';
import { debounceTime } from 'rxjs/operators';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { UserManagementService } from '../user-management.service';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { CustomerProfile } from '../model/profile.model';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})

export class UserListComponent implements OnInit {
  filterForm: FormGroup = new FormGroup({
    userSelectionType: new FormControl(AccUserTypeFilter.ALL),
    username: new FormControl(''),
    customerProfile: new FormControl('')
  });

  tableHeaders: any[] = [];
  userList: User[] = [];

  totalUsers: number;
  sortConditions: SortConditionsModel = {field: "userName", asc: true};
  userListRequest: UserListRequest = {
    limit: 25,
    offset: 0,
    type: undefined,
    userName: undefined,
    customerProfileId: undefined,
  }

  protected userListLength: number;
  AccUserTypeFilter = AccUserTypeFilter;
  ProgressState = ProgressState;
  loadingInProgressOverAll: boolean;

  customerProfileExists = true;
  availableCustomers: CustomerProfile[] = [];
  customerAutoComplete: CustomerProfile[] = [];
  selectedCustomer: CustomerProfile | undefined;

  private subscription: Subscription = new Subscription();
  private customerInputChange: Subject<string> = new Subject<string>();


  constructor(private modalWindows: ModalWindows, private translate: TranslateService, private userListService: UserListService, private dialog: MatDialog, private appService: AppService, protected userManagementService: UserManagementService, private permissionService: PermissionService) {
    this.createTableHeaders();
  }

  ngOnInit(): void {
    this.requestUserList();
    this.fetchCustomerProfiles();
    this.userSelectionType?.addValidators([Validators.required]);
    this.userSelectionType?.setValue(AccUserTypeFilter.ALL);
    const username = this.filterForm.get("username");
    if (username) {
      username.valueChanges.pipe(debounceTime(500)).subscribe(res => {
        this.filterUserName();
      });
    }

    this.subscription.add(
      this.customerInputChange.pipe(debounceTime(500)).subscribe((input) => {
          this.getCustomerAutocompleteSuggestions(input);
      })
    );
  }

  private createTableHeaders(): void {
      this.tableHeaders = [
        { text: this.translate.instant('User-management-component.AccUser.type'), value: 'type', width: '110px' },
        { text: this.translate.instant('User-management-component.AccUser.role'), value: 'roles', sortField: true, width: '250px' },
        { text: this.translate.instant('User-management-component.AccUser.name'), value: 'userName', sortField: true, width: '250px' },
        { text: this.translate.instant('User-management-component.AccUser.last-activity'), value: 'lastActivity', width: '150px' },
        { text: this.translate.instant('User-management-component.AccUser.active-usergroups'), value: 'activeUserGroups', width: '110px' },
        { text: this.translate.instant('User-management-component.AccUser.num-customergroups'), value: 'numCustomerGroups', width: '120px' },
        { text: this.translate.instant('User-management-component.AccUser.num-wagon-keepers'), value: 'numWagonKeepers', width: '120px' },
        { text: this.translate.instant('User-management-component.AccUser.num-accountsreceivablenumber'), value: 'numAccountsReveivableNumber', width: '120px' },
        { text: this.translate.instant('User-management-component.AccUser.market-area-client-number'), value: 'marketAreaClientNumber', width: '150px' },
        { text: this.translate.instant('User-management-component.AccUser.sgv'), value: 'sgv', width: '120px' },
        { text: this.translate.instant('User-management-component.AccUser.partnerId'), value: 'partnerId', width: '120px'},
        { text: this.translate.instant('User-management-component.AccUser.customer-name'), value: 'customerName' },
      ];
  }

  private requestUserList(): void {
    this.userListRequest.sort = (this.sortConditions.asc? "+" : "-") + this.sortConditions.field;
    this.appService.setProgressState(ProgressState.LOADING);
    this.userListService.requestAccUserList(this.userListRequest).subscribe({
      next: (response) => {
        const userListResponse: UserListResponse = response;
        if(this.userListRequest.offset == 0) {
          this.userList = [];
        }
        this.userList = this.userList.concat(userListResponse.users);
        this.totalUsers = userListResponse.total;

      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.userListLength = this.userList.length;
      this.appService.setProgressState(ProgressState.VOID);
      this.loadingInProgressOverAll = false;
    });
  }

  sortTable(value: string): void {
    this.loadingInProgressOverAll = true;
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
    this.doFilter();
  }

  filterUserName() {
    this.loadingInProgressOverAll = true;
    const filterValue = this.filterForm.get("username")?.value;
    const filterLength = filterValue?.length;
    if(filterLength > 2 && filterValue != this.userListRequest.userName) {
      setTimeout(() => this.doFilter(), 500);
    } else if(this.userListRequest.userName && this.userListRequest.userName?.length > filterLength && filterLength == 0) {
      this.doFilter();
    } else {
      this.loadingInProgressOverAll = false;
    }
  }

  doFilter() {
    this.loadingInProgressOverAll = true;
    this.userListRequest.type = this.getTMUserTypeFromAccUserType(this.filterForm.get("userSelectionType")?.value);
    this.userListRequest.userName = this.filterForm.get("username")?.value;
    this.userListRequest.customerProfileId = this.selectedCustomer?.customerProfileId;
    this.userListRequest.offset = 0;
    this.requestUserList();
  }

  private getTMUserTypeFromAccUserType(accType: AccUserTypeFilter | undefined): TMUserType | undefined {
    if(accType == AccUserTypeFilter.ALL) return undefined;
    if(accType == AccUserTypeFilter.INTERNAL) return TMUserType.INTERNAL;
    return TMUserType.EXTERNAL;
  }

  deleteUserData(userId: string,  deactivated: boolean) {
    this.openModalWindowChangeStateOfUser(userId, deactivated);
  }

  getRoles(user: User): string {
    if(user.roles && user.roles.length) {
      let roles = user.roles[0].description;
      if(user.roles.length > 1) {
        roles += '(+' + (user.roles.length -1) + ')';
      }
      return roles;
    } else {
      return "";
    }
  }

  openUserModal(userId?: string, copyUser?: boolean): void {
    let dialogRef: MatDialogRef<UserEditComponent>;
    dialogRef = this.dialog.open(UserEditComponent, { data: { userId: userId, copyUser: copyUser }, width: '1200px' });
    dialogRef.afterClosed().pipe().subscribe( { next: () => {
      this.requestUserList();
    }});
  }

  openModalWindowChangeStateOfUser(userId: string, userDeactivated: boolean): void {
    let dialogRef: MatDialogRef<DeleteUserComponent>;
    dialogRef = this.dialog.open(DeleteUserComponent, {data:{userDeactivated}});

    dialogRef.afterClosed().pipe().subscribe({
      next: (decision) => {
        if (decision == true) {
          this.loadingInProgressOverAll = true;
          this.appService.setProgressState(ProgressState.LOADING);
          this.userListService.deleteUser(userId).subscribe({
            next: (result) => {
              this.requestUserList();
            },
            error: (err) => {
              this.modalWindows.openErrorDialog({ apiProblem: err.error });
              console.error(err);
              this.appService.setProgressState(ProgressState.VOID);
            }
          })
        }
      }
    });
  }

  loadMore(): void {
    this.userListRequest.offset = this.userListRequest.offset != undefined ? this.userListRequest.offset + 1 : 0;
    this.requestUserList();
  }

  fetchCustomerProfiles() {
    this.loadingInProgressOverAll = true;
    this.userListService.requestAllCustomerProfiles().subscribe({
      next: (resp: CustomerProfileListResponse) => {
        this.availableCustomers = resp.customerProfiles.filter(el => el.customerProfileId);
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgressOverAll = false;
    });
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

  getCustomerList(event: any) {
    this.customerInputChange.next(event.target.value);
  }

  selectCustomer(event: any | null) {


    if (event === null) {
        this.customerProfileExists = true;
        return;
    }

    const input = event.target as HTMLInputElement;
    const selectedText = input.value;
    if(selectedText) {
      this.selectedCustomer = this.availableCustomers.find(el => this.getCustomer(el) == selectedText);
    }else {
      this.selectedCustomer = undefined;
    }

    if(!this.selectedCustomer && selectedText) {
      this.customerProfileExists = false;
    } else {
      this.customerProfileExists = true;
    }

    this.doFilter();

  }

  get username(): AbstractControl | null {
    return this.filterForm.get('username');
  }

  get userSelectionType(): AbstractControl | null {
    return this.filterForm.get('userSelectionType');
  }

  get progressState(): ProgressState {
    return this.appService.getProgressState();
  }

  public setCustomUser(userName: string) {
    sessionStorage.setItem("customUsername", userName);
    this.permissionService.resetPermissions4User();
  }

}
