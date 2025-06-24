import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CustomerProfileListRequest, CustomerProfileListResponse, ProfileListService, CompletionStatus, CustomerProfilesSaveRequest, TomGroupListResponse } from './profile-list.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerProfile, CustomerProfileSave, ProfileStatusType, TomGroup} from '../model/profile.model';
import { TrainorderService } from '../../trainorder/services/trainorder.service';
import { Customer, CustomerResponse } from '../../trainorder/models/ApiCustomers.model';
import { CustomerSgvNamePipe } from '../../shared/pipes/customer-sgv-name.pipe';
import * as _ from 'lodash';
import { ProfileListUpdateComponent } from '@src/app/user-management/profile-list/profile-list-update/profile-list-update.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RolesListResponse, UserListService } from '../user-list/user-list.service';
import { Role } from '../model/role.model';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ErrorDialogComponent } from '@src/app/shared/components/api-error/api-error.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { UserManagementService } from '../user-management.service';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.scss'],
  providers: [CustomerSgvNamePipe]
})
export class ProfileListComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();
  private sgvInputChange: Subject<string> = new Subject<string>();

  sgvAutoComplete: Customer[] = [];
  profileFormGroup: FormGroup;
  customerProfileList: CustomerProfile[] = [];
  customerProfileSaved: boolean;
  originals: CustomerProfile[];
  loadingInProgress: boolean;
  profilesToSave: CustomerProfile[] = [];
  filterForm: FormGroup = new FormGroup({
    profileStatusType: new FormControl(ProfileStatusType.ALL),
    customerName: new FormControl('')
  });

  availableRoles: Role[];
  totalProfiles: number;
  profilesLength: number;
  activeChanges: number;
  tomGroups: TomGroup[];

  customerProfileListRequest: CustomerProfileListRequest = {
    limit: 25,
    offset: 0,
  }

  tableHeaders: any[] = [];
  profilesList$: Observable<CustomerProfile[]>;
  sortConditions: SortConditionsModel = {field: "sgvId", asc: true};
  ProfileStatusType = ProfileStatusType;

  constructor(private dialog: MatDialog,
    private trainorderService: TrainorderService,
    private translate: TranslateService,
    private profileListService: ProfileListService,
    private customerSgvNamePipe: CustomerSgvNamePipe,
    private fb: FormBuilder,
    private modalWindows: ModalWindows ,
    protected userManagementService: UserManagementService
  ) {
    this.createTableHeaders();
  }

  ngOnInit(): void {
    this.requestCustomerProfileList();
    this.subscription.add(
      this.sgvInputChange.pipe(debounceTime(500)).subscribe((input) => {
          this.getSgvAutocompleteSuggestions(input);
      })
    );
    this.profileStatusType?.addValidators([Validators.required]);
    this.profileStatusType?.setValue(ProfileStatusType.ALL);
    this.activeChanges = 0;
    this.fetchTomGroups();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      { text: '', value: '', sortfield: false, width: "30px" },
      //{ text: '', value: '', sortfield: false },
      { text: this.translate.instant('Profile-list-component.CustProfile.customerName'), value: 'customerName', sortField: true },
      { text: this.translate.instant('Profile-list-component.CustProfile.custNo'), value: 'custNo', sortField: true, width: "300px" },
      { text: this.translate.instant('Profile-list-component.CustProfile.sgvNo'), value: 'sgvId', sortField: true, width: "200px" },
      { text: this.translate.instant('Profile-list-component.CustProfile.partnerId'), value: 'partnerId', sortField: true , width: "200px"},
      { text: this.translate.instant('Profile-list-component.CustProfile.tomGroup'), value: 'tomGroup', sortField: true, width: "400px" },
    ];
  }


  private fetchTomGroups(): void {
    this.profileListService.getTomGroups().subscribe({
      next: (result: TomGroupListResponse) => {
        const tomGroupListResponse: TomGroupListResponse = result;
        this.tomGroups = tomGroupListResponse.tomgroups;
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
    }
    })
  }

  private createProfileForm(): void {
    this.profileFormGroup = this.fb.group({});
    for (let profile of this.customerProfileList) {
      this.profileFormGroup.addControl(profile.id + '_tomGroup', new FormControl(profile?.tomGroup?.id));
      this.profileFormGroup.get(profile.id + '_tomGroup')?.valueChanges.subscribe((value) => { profile.tomGroup = this.findTomGroupById(value); this.detectChanges(profile); });
    }
  }

  isComplete(profile: CustomerProfile): boolean {
    if (profile.tomGroup && profile.tomGroup.id > 0 || (profile && profile.sgv.companyLocationNumber === undefined)) {
      return true;
    }
    return false;
  }

  private findTomGroupById(id: number): TomGroup | undefined {
    return this.tomGroups.find(tomGroup => {
      return tomGroup.id === id;
    });
  }

  detectChanges(profile: CustomerProfile): boolean {
    if (!profile) { console.error('Profile must not be null'); return false; }
    profile.changeAmount = 0;
    profile.changed = false;
    const original = this.originals.find(x => profile.id === x.id);
    if (!original) { console.error('Failed to find original'); return false; }

    if (original.tomGroup?.id !== profile.tomGroup?.id) {
      profile.changeAmount++;
      profile.changed = true;
    }

    if (!profile.changed) {
      const tmp: CustomerProfile[] = [];
      for (let p of this.profilesToSave) {
        if (p.id !== profile.id) {
          tmp.push(p);
        }
      }
      this.profilesToSave = tmp;
    } else {
      let result = this.profilesToSave.find(p => p.id === profile.id);
      if (result) {
        result = profile;
      } else {
        this.profilesToSave.push(profile);
      }
    }

    this.activeChanges = this.calculateChanges();
    return profile.changed;
  }

  private calculateChanges(): number {
    let result = 0;
    for (let profile of this.customerProfileList) {
      result += profile.changeAmount;
    }
    return result;
  }

  clearSearchInput(): void {
    this.loadingInProgress = true;
    this.customerName?.setValue(null);
    this.customerProfileListRequest.sgv = undefined
    this.requestCustomerProfileList();
  }

  private requestCustomerProfileList() {
    this.customerProfileListRequest.sort = (this.sortConditions.asc? "+" : "-") + this.sortConditions.field;
    this.loadingInProgress = true;
    this.profileListService.requestCustomerProfileList(this.customerProfileListRequest).subscribe({
      next: (response) => {
        const customerProfileListResponse: CustomerProfileListResponse = response;
        if(this.customerProfileListRequest.offset == 0) {
          this.customerProfileList = [];
        }

        this.customerProfileList = this.customerProfileList.concat(customerProfileListResponse.customerProfiles);

        this.totalProfiles = customerProfileListResponse.total;
        this.activeChanges = 0;
        this.profilesToSave = [];
        this.init();
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgress = false;
      this.profilesLength = this.customerProfileList.length;
    });
  }

  validateChanges(): boolean {
    for (let p of this.profilesToSave) {
      if (!p.tomGroup) {
        this.dialog.open(ErrorDialogComponent, {data: { text: this.translate.instant('fields-required'), errors: [] }});
        return false;
      }
    }
    return true;
  }

  sortTable(value: string): void {
    this.loadingInProgress = true;
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

  sendSavedCustomerProfiles(): void {
    this.loadingInProgress = true;
    const profiles: CustomerProfileSave[] = [];
    for (let p of this.profilesToSave) {
      const profileSave: CustomerProfileSave = {
        customerProfileId: p.customerProfileId,
        sgvId: p.sgv?.sgvId,
        companyLocationNumber: p.sgv?.companyLocationNumber,
        tomGroupId: p.tomGroup?.id
      }
      profiles.push(profileSave);
    }
    const newCustomerProfileSaveRequestValue: CustomerProfilesSaveRequest = {
      profiles: profiles,
    }
    this.saveCustomerProfiles(newCustomerProfileSaveRequestValue);
  }

  private saveCustomerProfiles(newCustomerProfileSaveRequestValue: CustomerProfilesSaveRequest) {
    this.profileListService.changeCustomerProfileList(newCustomerProfileSaveRequestValue).subscribe({
      next: (result) => {
        this.requestCustomerProfileList();
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      let confirmation = this.translate.instant('Profile-list-component.Save-confirmation');
      this.loadingInProgress = false;
      this.modalWindows.openConfirmationDialog(confirmation, 3);
    });
  }

  init(): void {
    const temp: CustomerProfile[] = [];
    let idx = 0;
    for (let profile of this.customerProfileList) {
      profile.changeAmount = 0;

      if (!profile.tomGroup) {
        profile.tomGroup = undefined;
      }
      temp.push(profile);
      this.customerProfileList = temp;
    }
    this.originals = _.cloneDeep(this.customerProfileList);
    this.createProfileForm();
  }

  getSgvIdsList(event: any) {
    this.sgvInputChange.next(event.target.value);
  }

  getSgvAutocompleteSuggestions(input: string): void {
    let foundCustomer: any = null;

    foundCustomer = this.sgvAutoComplete.find(el => input.indexOf(el.name) > 0);

    if (foundCustomer != null) {
      return;
    }

    if (input.length > 2) {
      this.trainorderService.getCustomers(input).subscribe((result: CustomerResponse) => {
        this.sgvAutoComplete = result;
      })
    }
  }

  selectSgvId(event: any | null, sgv: string | null = null) {
    this.loadingInProgress = true;
    let selectedValue: string | null = null;
    if (!sgv) {
        if (event === null || !event.target.value || event.target.value == '' || event.target.value == null) {
            return;
        }

        const sgvAndName = this.customerSgvNamePipe.transform(event.target.value) as Customer;

        if (!sgvAndName.name) {
            return;
        }

        selectedValue = sgvAndName.sgvNumber;

        this.customerProfileListRequest.sgv = selectedValue;
        this.doFilter();
    } else {
        if (!sgv) return;
        selectedValue = sgv;
    }

    if (!selectedValue) return;

  }

  loadMore(): void {
    this.customerProfileListRequest.offset = this.customerProfileListRequest.offset != undefined ? this.customerProfileListRequest.offset + 1 : 0;
    this.requestCustomerProfileList();
  }

  reload(): void {
    this.doFilter();
  }

  doFilter() {
    this.loadingInProgress = true;
    this.customerProfileListRequest.completionStatus = this.getCompletionStatusFromCompletionStatus(this.filterForm.get('profileStatusType')?.value);
    this.customerProfileListRequest.offset = 0;
    this.requestCustomerProfileList();
  }

  openChangedProfilesModal(): void {
    const profilesArray: CustomerProfileSave[] = [];

    if (this.validateChanges() === false) {
      return;
    }

    for (let p of this.profilesToSave) {
      const profileSave: CustomerProfileSave = {
        customerProfileId: p.customerProfileId,
        sgvId: p.sgv?.sgvId,
        companyLocationNumber: p.sgv?.companyLocationNumber,
        tomGroupId: p.tomGroup?.id
      };
      profilesArray.push(profileSave);
    }
    const newCustomerProfileSaveRequestValue: CustomerProfilesSaveRequest = {
      profiles: profilesArray
    }

    let dialogRef: MatDialogRef<ProfileListUpdateComponent>;
    dialogRef = this.dialog.open(ProfileListUpdateComponent, {data: { current: newCustomerProfileSaveRequestValue, availableRoles: this.availableRoles, tomGroups: this.tomGroups }, width: 1000 + 'px'});
    dialogRef.afterClosed().pipe().subscribe({
      next: (decision) => {
        if (decision == true) {
          this.sendSavedCustomerProfiles();
        }
      }
    });
  }

  private getCompletionStatusFromCompletionStatus(comStatus: ProfileStatusType | undefined): CompletionStatus | undefined {
    if(comStatus == ProfileStatusType.ALL) return undefined;
    if(comStatus == ProfileStatusType.INCOMPLETE) return CompletionStatus.INCOMPLETE;
    if(comStatus == ProfileStatusType.NOT_CREATED) return CompletionStatus.NOT_CREATED;
    return CompletionStatus.COMPLETE;
  }
  get profileStatusType(): AbstractControl | null {
    return this.filterForm.get('profileStatusType');
  }
  get customerName(): AbstractControl | null {
    return this.filterForm.get('customerName');
  }

  openProfileModal(profile: CustomerProfile) {
    let dialogRef: MatDialogRef<ProfileEditComponent>;
    dialogRef = this.dialog.open(ProfileEditComponent, { data: profile, width: '1200px' });
    dialogRef.afterClosed().pipe().subscribe( { next: () => {
      this.requestCustomerProfileList();
    }});
  }
}
