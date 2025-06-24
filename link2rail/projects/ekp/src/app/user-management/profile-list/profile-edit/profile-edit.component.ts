import { Component, OnInit, Inject, OnDestroy, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators, FormGroup, AbstractControl} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, DialogPosition, MatDialogConfig } from '@angular/material/dialog';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SharedModule } from '@src/app/shared/shared.module';
import { PickListModule } from '@src/app/shared/components/pick-list/pick-list.module';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ErrorDialogComponent } from '@src/app/shared/components/api-error/api-error.component';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { CustomerProfile, CustomerProfileData, CustomerProfileDetails, CustomerRelation, CustomerRelationData, CustomerRelationType, TomGroup } from '../../model/profile.model';
import { CompletionStatus, CustomerProfileListResponse, CustomerProfileResponse, ProfileListService, TomGroupListResponse } from '../profile-list.service';
import { ConfirmationComponent } from '@src/app/shared/components/confirmations/confirmation.component';
import { UserManagementService } from '../../user-management.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    PickListModule,
    FormDialogModule
  ]
})
export class ProfileEditComponent implements OnInit, AfterViewInit, OnDestroy {
  formGroup: FormGroup;
  loadingInProgress: boolean;
  loadingSave: boolean;

  private subject = new Subject<any>();
  profile: CustomerProfileDetails;

  tomGroups: TomGroup[] = [];

  grantorTableHeaders: any[] = [];
  granteeTableHeaders: any[] = [];

  availableCustomers: CustomerProfile[] = [];
  relationTypes: CustomerRelationType[] = [];
  customerAutoComplete: CustomerProfile[] = [];
  customerProfileExists: boolean = true;

  private subscription: Subscription = new Subscription();
  private customerInputChange: Subject<string> = new Subject<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: CustomerProfile,
    private modalWindows: ModalWindows,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ProfileEditComponent>,
    private profileListService: ProfileListService,
    protected userManagementService: UserManagementService) {
      this.createGrantorTableHeaders();
      this.createGranteeTableHeaders();
    }

  ngOnInit(): void {
    if(!this.data?.sgv?.sgvId || !this.data?.sgv?.companyLocationNumber) {
      this.modalWindows.openErrorDialog({ text: 'Ungültiges Kundenprofil' });
    } else {
      this.prepareForm();

      if(this.data.customerProfileId) {
        this.fetchCustomerProfile(this.data.sgv.sgvId, this.data.sgv.companyLocationNumber);
      } else {
        this.profile = {
          sgv: this.data.sgv,
          tomGroup: this.data.tomGroup,
          granteeRelations: [],
          grantorRelations: []
        }
        this.setFormValues();
      }
    }

    this.fetchTomGroups();
    this.fetchCustomerProfiles();
    this.fetchCustomerRelationTypes();

    this.subscription.add(
      this.customerInputChange.pipe(debounceTime(500)).subscribe((input) => {
          this.getCustomerAutocompleteSuggestions(input);
      })
    );

  }

  ngAfterViewInit(): void {
  }

  private prepareForm() {
    this.formGroup = new FormGroup({
      customer: new FormControl('', [Validators.required]),
      sgv: new FormControl('', [Validators.required]),
      site: new FormControl('', [Validators.required]),
      tomgroup: new FormControl(''),
      customerProfile: new FormControl(''),
      relationtype: new FormControl(''),
    });

  }

  ngOnDestroy(): void {

  }

  private createGrantorTableHeaders(): void {
    this.grantorTableHeaders = [
      { text: this.translate.instant('User-management-component.Profile.relation-grantee'), value: 'grantor', width: "400px"},
      { text: this.translate.instant('User-management-component.Profile.relation-name'), value: 'relationName', width: "400px"},
    ];
  }

  private createGranteeTableHeaders(): void {
    this.granteeTableHeaders = [
      { text: this.translate.instant('User-management-component.Profile.relation-grantor'), value: 'grantee', width: "400px"},
      { text: this.translate.instant('User-management-component.Profile.relation-name'), value: 'relationName', width: "440px"},
    ];
  }

  setFormValues(): void {
    this.customer?.setValue(this.profile.sgv.customerName + " (" + this.profile.sgv.marketAreaCustomerNumber + ")");
    this.sgv?.setValue(this.profile.sgv.sgvId);
    this.site?.setValue(this.profile.sgv.companyLocationNumber + " (" + this.profile.sgv.siteName + ")");
    this.tomgroup?.setValue(this.profile.tomGroup?.id);
  }

  fetchCustomerProfile(sgvId: string, companyLocationNumber: string): void {
    this.loadingInProgress = true;
    this.profileListService.fetchCustomerProfile(sgvId, companyLocationNumber).subscribe({
      next: (resp: CustomerProfileResponse) => {
        this.profile = resp.profile;
        this.setFormValues();
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgress = false;
    });
  }

  private fetchTomGroups(): void {
    this.profileListService.getTomGroups().subscribe({
      next: (result: TomGroupListResponse) => {
        const tomGroupListResponse: TomGroupListResponse = result;
        this.tomGroups = tomGroupListResponse.tomgroups;
        this.tomgroup.setValue(this.profile?.tomGroup?.id);
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
    }
    });
  }

  fetchCustomerProfiles() {
    this.loadingInProgress = true;
    this.profileListService.requestAllCustomerProfiles().subscribe({
      next: (resp: CustomerProfileListResponse) => {
        this.availableCustomers = resp.customerProfiles.filter(p => p.customerProfileId);
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgress = false;
    });
  }

  fetchCustomerRelationTypes() {
    this.profileListService.getRelationTypes().subscribe({
      next: (result) => {
        this.relationTypes = result.relationTypes;
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    });
  }

  getCustomerList(event: any) {
    this.customerInputChange.next(event.target.value);
  }

  getCustomerAutocompleteSuggestions(input: string): void {
    this.customerAutoComplete = this.availableCustomers.filter(el => this.getCustomer(el).toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) >= 0).slice(0, 15);
  }

  selectCustomer(event: any | null) {
    if (event === null || !event.target.value || event.target.value == '' || event.target.value == null) {
        this.customerProfileExists = true;
        return;
    }

    const input = event.target as HTMLInputElement;
    const selectedText = input.value;

    this.customerProfileExists = this.availableCustomers.find(el => this.getCustomer(el) == selectedText) ? true : false;
  }

  removeRelation(relation: CustomerRelation): void {
    this.profile.grantorRelations = this.profile.grantorRelations.filter(r => r != relation);
  }

  getCustomer(profile: CustomerProfile): string {
    if(!profile.sgv.companyLocationNumber) {
      return profile.sgv.sgvId + ' / *';
    } else {
      return '(' + profile.sgv.sgvId + ' / ' + profile.sgv.companyLocationNumber + ') ' + (profile.sgv.customerName ?? "");
    }
  }

  addCustomerRelation(): void {
    let relationTypeId = this.relationtype.value;
    let granteeProfile = this.customerProfile.value;

    let grantorRelation: CustomerRelation = {
      relationType: this.relationTypes.find(r => r.id == relationTypeId),
      granteeCustomer: this.availableCustomers.find(el => this.getCustomer(el) == granteeProfile),
      grantorCustomer: {

        customerProfileId: this.profile.customerProfileId,
        sgv: {
          marketAreaCustomerNumber: this.profile.sgv.marketAreaCustomerNumber,
          customerName: this.profile.sgv.customerName,
          sgvId: this.profile.sgv.sgvId,
          companyLocationNumber: this.profile.sgv.companyLocationNumber,
          siteName: this.profile.sgv.siteName
        },
        tomGroup: this.profile.tomGroup
      }
    };

    this.profile.grantorRelations.push(grantorRelation);

    this.customerProfile.setValue('');
    this.relationtype.setValue('');
  }

  public openDialog<T>(comp: new (...args: any[]) => T, config: any): void {
    let dialogRef: MatDialogRef<T>;
    dialogRef = this.dialog.open(comp, config);
    dialogRef.afterClosed().subscribe(decision => {
      this.subject.next(decision);
    });
  }

  doSaveCustomerProfile(): void {
    if (!this.validateInput()) {
      return;
    }

    this.saveCustomerProfile(
      this.profile.customerProfileId,
      this.profile.sgv.sgvId,
      this.profile.sgv.companyLocationNumber,
      this.tomgroup.value,
      [...new Set(this.profile.grantorRelations.map(r => { return { relationId: r.relationType.id, granteeCustomerProfileId: r.granteeCustomer.customerProfileId }}))]
    );
  }

  private validateInput(): boolean {
    return true;
  }

  saveCustomerProfile(
    customerProfileId: number | undefined,
    sgvId: string,
    companyLocationNumber: string,
    tomGroupId: number,
    grantorRelations: CustomerRelationData[]): void {

    this.loadingSave = true;

    let profile: CustomerProfileData = new CustomerProfileData();
    profile.customerProfileId = customerProfileId;
    profile.sgvId = sgvId;
    profile.companyLocationNumber = companyLocationNumber;
    profile.tomGroupId = tomGroupId;
    profile.grantorRelations = grantorRelations;


    this.profileListService.modifyCustomerProfile(profile).subscribe({
      next: (result) => {
        if(!result.success) {
          console.log(result);
          this.dialog.open(ErrorDialogComponent, {data: { text: result.errors[0].message, errors: [] }} )
          this.loadingSave = false;
        } else {
          let confirmation = this.translate.instant('User-management-component.Profile.Confirmation.Save-confirmation');
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

  get customer(): AbstractControl | null {
    return this.formGroup.get('customer');
  }

  get sgv(): AbstractControl | null {
    return this.formGroup.get('sgv');
  }

  get site(): AbstractControl | null {
    return this.formGroup.get('site');
  }

  get tomgroup(): AbstractControl | null {
    return this.formGroup.get('tomgroup');
  }

  get customerProfile(): AbstractControl | null {
    return this.formGroup.get('customerProfile');
  }

  get relationtype(): AbstractControl | null {
    return this.formGroup.get('relationtype');
  }

}
