import { AfterViewInit, ChangeDetectorRef, Component, inject, Injector, Input } from '@angular/core';
import { PartyType, SectionName } from '../../enums/order-enums';
import { initialParty, initialPartyAdress, RailOrder } from '../../../../models/rail-order-api';
import { SectionBase } from "../section.base";
import { FormControl, FormGroup } from '@angular/forms';
import { Customer, Site, SiteAddress } from '@src/app/trainorder/models/ApiCustomers.model';
import { debounceTime, Observable, of } from 'rxjs';
import { CustomerSgvNamePipe } from '@src/app/shared/pipes/customer-sgv-name.pipe';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';
import { Country, RailAuthority } from '@src/app/order-management/models/general-order';
import { FormFieldService } from '../../service/form-field.service';
import { CountryPipe } from '@src/app/shared/pipes/country.pipe';
import { RailAuthorityPipe } from '@src/app/shared/pipes/rail-authority.pipe';
import { SgvSites, TokInternalApiService } from '@src/app/trainorder/services/tok-internal-api.service';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { SgvPipe } from '@src/app/shared/pipes/sgv-sites.pipe';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-order-consignor-consignee',
  templateUrl: './new-order-consignor-consignee.component.html',
  styleUrls: ['../../new-order-main/new-order-main.component.scss',
    './new-order-consignor-consignee.component.scss']
})
export class NewOrderConsignorConsigneeComponent extends SectionBase implements AfterViewInit {
  @Input() currentSectionName: SectionName;
  @Input() editMode: boolean;

  public railOrder: RailOrder;

  protected SectionName = SectionName;
  public formGroup: FormGroup;
  protected enumPartyTypeConsignor: PartyType;
  protected enumPartyTypeConsignee: PartyType;
  protected enumPartTypeFreightPayerConsignor: PartyType.PARTY_TYPE_FREIGHT_PAYER_CONSIGNOR;
  protected enumPartTypeFreightPayerConsignee: PartyType.PARTY_TYPE_FREIGHT_PAYER_CONSIGNEE;
  protected isPartyInfoConsignorVisible = false; // To track visibility
  protected isPartyInfoConsigneeVisible = false; // To track visibility
  protected authorityList$: Observable<RailAuthority[]> = of([]);
  protected countries$: Observable<Country[]> = of([]) ;

  // Current section name
  protected currentLocalSectionName = this.SectionName.SECTION_CONSIGNEE_CONSIGNOR;

  protected consignorCustomerSuggestions: SgvSites[] = [];
  protected consignorCustomerSuggestions4Internal: Customer[] = [];

  protected railAuthority: RailAuthorityPipe = inject(RailAuthorityPipe);
  // protected customerSgvPartnerIdPipe: CustomerSgvPartnerIdPipe = inject(CustomerSgvPartnerIdPipe);
  protected permissionService: PermissionService = inject(PermissionService);
  protected trainOrderService: TrainorderService = inject(TrainorderService);

  private formFieldService: FormFieldService = inject(FormFieldService);
  private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
  private tokInternalService = inject(TokInternalApiService);

  constructor(private translate: TranslateService, private cd: ChangeDetectorRef, protected customerSgvNamePipe: CustomerSgvNamePipe, protected countryPipe: CountryPipe, protected sgvPipe: SgvPipe) {
    super();
    this.loadLists();
    this.enumPartyTypeConsignor = PartyType.PARTY_TYPE_CONSIGNOR;
    this.createForm();
  }

  ngAfterViewInit() {
    this.tokInternalService.getSgvsWithSites().subscribe({
      next: cds => this.consignorCustomerSuggestions = cds
    });
    if(!this.editMode) {
      this.formGroup.disable();
    }
  }

  public updateRailOrder(ro: RailOrder) {
    this.railOrder = ro;
    this.setFormValues(this.railOrder);
    this.disableFields();
    this.cd.detectChanges();
  }

  private disableFields() {
    this.formFieldService.disableFields(this.formGroup, 'consignorConsignee', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  }

  private loadLists(): void {
    this.authorityList$ = this.railOrderInternalService.getRailAuthorities();
    this.countries$ = this.railOrderInternalService.getCountries();
  }

  private setFormValues(railOrder: RailOrder): void {
    this.setFormValuesConsignor();
    this.setFormValuesFreightPayerConsignor(railOrder);
    this.setFormValuesLoadingParty(railOrder);
    this.setFormValuesConsignee(railOrder);
    this.setFormValuesFreightPayerConsignee(railOrder);
    this.setFormValuesUnloadingParty(railOrder)
  }

  private setFormValuesConsignor(): void {
    if(this.railOrder?.consignor?.customerId?.sgv) {
      this.consignorCustomerSuggestions4Internal.push({name: this.railOrder?.consignor?.name, sgvNumber: this.railOrder?.consignor?.customerId.sgv});
      this.consignorCustomerSuggestions.push({customerName: this.railOrder?.consignor?.name, sgvId: this.railOrder?.consignor?.customerId.sgv, sites: []});

      this.trainOrderService.getCustomers(this.railOrder?.consignor?.customerId?.sgv).subscribe({
        next: cs => {
          this.consignorCustomerSuggestions4Internal = cs;

          if(this.railOrder?.consignor?.partnerId?.site) {
            this.trainOrderService.getPartner(this.railOrder?.consignor?.customerId?.sgv, this.railOrder?.consignor?.partnerId?.site).subscribe(s => {
              if(s) {
                this.sites.push({partnerId: s.partnerId, siteName: s.name});
                this.consignorPartnerId.setValue(s.partnerId, {emitEvent: false});
                this.permissionService.isInternalUser().subscribe({
                  next: isInt => {
                    if (isInt) {
                      this.consignorCustomerId.setValue(this.customerSgvNamePipe.transform({ name: this.railOrder?.consignor?.name, sgvNumber: this.railOrder?.consignor?.customerId.sgv }), { emitEvent: false });
                    } else {
                      this.consignorCustomerId.setValue(this.railOrder?.consignor?.customerId?.sgv, { emitEvent: false });
                    }
                  }
                });
              }
            });
          }
        }
      });
    }

    this.consignorAddressStreet.setValue(this.railOrder?.consignor?.address?.street);
    // this.consignorAddressCity.setValue(this.railOrder?.consignor?.address?.city);
    this.consignorAddressCountry.setValue(this.railOrder?.consignor?.address?.country);
    this.consignorComment.setValue(this.railOrder?.consignor?.comment);
    this.consignorContactPersonName.setValue(this.railOrder?.consignor?.contactPerson?.name);
    this.consignorContactPersonTel.setValue(this.railOrder?.consignor?.contactPerson?.tel);
    this.consignorContactPersonFax.setValue(this.railOrder?.consignor?.contactPerson?.fax);
    this.consignorContactPersonEmail.setValue(this.railOrder?.consignor?.contactPerson?.email);
  }

  private setFormValuesFreightPayerConsignor(railOrder: RailOrder): void {
    this.freightPayerConsignorCustomerIdSgv?.setValue(railOrder?.freightpayerConsignor?.customerId?.sgv);
    this.freightPayerConsignorCustomerIdAuthorityOfCustomerId?.setValue(railOrder?.freightpayerConsignor?.customerId?.authorityOfCustomerId);
    this.freightPayerConsignorAddressZipCode?.setValue(railOrder?.freightpayerConsignor?.address?.zipCode);
    this.freightPayerConsignorVatId?.setValue(railOrder?.freightpayerConsignor?.vatId);
  }

  private setFormValuesConsignee(railOrder: RailOrder): void {
    this.consigneeAuthorityOfCustomerIdCustomerId.setValue(railOrder?.consignee?.customerId?.authorityOfCustomerId);
    this.consigneeCustomerId?.setValue(railOrder?.consignee?.customerId?.sgv);
    this.consigneeName?.setValue(railOrder?.consignee?.name);
    this.consigneeAddressStreet?.setValue(railOrder?.consignee?.address?.street);
    this.consigneeAddressCity?.setValue(railOrder?.consignee?.address?.city);
    this.consigneeAddressZipCode?.setValue(railOrder?.consignee?.address?.zipCode);
    this.consigneeAddressCountry?.setValue(railOrder?.consignee?.address?.country);
    this.consigneeComment?.setValue(railOrder?.consignee?.comment);
    this.consigneeContactPersonName?.setValue(railOrder?.consignee?.contactPerson?.name);
    this.consigneeContactPersonTel?.setValue(railOrder?.consignee?.contactPerson?.tel);
    this.consigneeContactPersonFax?.setValue(railOrder?.consignee?.contactPerson?.fax);
    this.consigneeContactPersonEmail?.setValue(railOrder?.consignee?.contactPerson?.email);
  }

  private setFormValuesLoadingParty(railOrder: RailOrder): void {
    this.loadingPartyCustomerIdSgv?.setValue(railOrder?.loadingParty?.customerId?.sgv);
    this.loadingPartyCustomerIdAuthorityOfCustomerId?.setValue(railOrder?.loadingParty?.customerId?.authorityOfCustomerId);
    this.loadingPartyName?.setValue(railOrder?.loadingParty?.name)
    this.loadingPartyAddressZipCode?.setValue(railOrder?.loadingParty?.address?.zipCode);
  }

  private setFormValuesFreightPayerConsignee(railOrder: RailOrder): void {
    this.freightPayerConsigneeCustomerIdSgv?.setValue(railOrder?.freightpayerConsignee?.customerId?.sgv);
    this.freightPayerConsigneeCustomerIdAuthorityOfCustomerId?.setValue(railOrder?.freightpayerConsignee?.customerId?.authorityOfCustomerId);
    this.freightPayerConsigneeAddressZipCode?.setValue(railOrder?.freightpayerConsignee?.address?.zipCode);
    this.freightPayerConsigneeVatId?.setValue(railOrder?.freightpayerConsignee?.vatId);
  }

  private setFormValuesUnloadingParty(railOrder: RailOrder): void {
    this.unloadingPartyCustomerIdSgv?.setValue(railOrder?.unloadingParty?.customerId?.sgv);
    this.unloadingPartyCustomerIdAuthorityOfCustomerId?.setValue(railOrder?.unloadingParty?.customerId?.authorityOfCustomerId);
    this.unloadingPartyName?.setValue(railOrder?.unloadingParty?.name)
    this.unloadingPartyAddressZipCode?.setValue(railOrder?.unloadingParty?.address?.zipCode);
  }

  private createForm(): void {
    this.formGroup = new FormGroup({
      consignor: new FormGroup({
        customerId: new FormControl(),
        partnerId: new FormControl(),
        // city: new FormControl(),
        street: new FormControl(),
        country: new FormControl(),
        comment: new FormControl(),
        name: new FormControl(),
        tel: new FormControl(),
        fax: new FormControl(),
        email: new FormControl()
      }),
      freightpayerConsignor: new FormGroup({
        sgv: new FormControl(),
        authorityOfCustomerId: new FormControl(),
        zipCode: new FormControl(),
        vatId: new FormControl()
      }),
      loadingParty: new FormGroup({
        sgv: new FormControl(),
        authorityOfCustomerId: new FormControl(),
        name : new FormControl(),
        zipCode: new FormControl()
      }),
      // Consignee
      consignee: new FormGroup({
        authorityOfCustomerId: new FormControl(),
        customerId: new FormControl(),
        name: new FormControl(),
        zipCode: new FormControl(),
        city: new FormControl(),
        street: new FormControl(),
        country: new FormControl(),
        contactPersonName: new FormControl(),
        comment: new FormControl(),
        tel: new FormControl(),
        fax: new FormControl(),
        email: new FormControl(),
      }),
      freightPayerConsignee: new FormGroup({
        sgv: new FormControl(),
        authorityOfCustomerId: new FormControl(),
        zipCode: new FormControl(),
        vatId: new FormControl()
      }),
      unloadingParty: new FormGroup({
        sgv: new FormControl(),
        authorityOfCustomerId: new FormControl(),
        name : new FormControl(),
        zipCode: new FormControl()
      })
    }, { updateOn: 'blur' });

    this.subscribeToFormChanges();
  }

  private subscribeToFormChanges(): void {
    // Subscribe to form changes only triggered by user input
    this.formGroup.valueChanges.subscribe((changes) => {
      // Check if the form is touched or dirty to ensure that only user input triggers the update
      if (this.formGroup.dirty || this.formGroup.touched) {
        this.updateRailOrderFromForm(changes);
      }
    });
  }

  private updateRailOrderFromForm(changes: any): void {
    // Update consignor fields
      this.railOrder.consignor = {
        ...this.railOrder.consignor,
        address: {
          ...this.railOrder.consignor?.address,
          street: this.consignorAddressStreet.value,
          // city: this.consignorAddressCity.value,
          country: this.consignorAddressCountry.value
        },
        comment: this.consignorComment.value,
        contactPerson: {
          ...this.railOrder.consignor?.contactPerson,
          name: this.consignorContactPersonName.value,
          tel: this.consignorContactPersonTel.value,
          fax: this.consignorContactPersonFax.value,
          email: this.consignorContactPersonEmail.value
        }
      };

      this.railOrder.freightpayerConsignor = {
        ...this.railOrder.freightpayerConsignor,
        customerId: {
          ...this.railOrder.freightpayerConsignor?.customerId,
          sgv: this.freightPayerConsignorCustomerIdSgv.value,
          authorityOfCustomerId: this.freightPayerConsignorCustomerIdAuthorityOfCustomerId.value
        },
        address: {
          ...this.railOrder.freightpayerConsignor?.address,
          zipCode: this.freightPayerConsignorAddressZipCode.value
        },
        vatId: this.freightPayerConsignorVatId.value
      };

      this.railOrder.loadingParty = {
        ...this.railOrder.loadingParty,
        customerId: {
          ...this.railOrder.loadingParty?.customerId,
          sgv: this.loadingPartyCustomerIdSgv.value,
          authorityOfCustomerId: this.loadingPartyCustomerIdAuthorityOfCustomerId.value
        },
        address: {
          ...this.railOrder.loadingParty?.address,
          zipCode: this.loadingPartyAddressZipCode.value
        },
        name:  this.loadingPartyName.value
      };

      this.railOrder.consignee = {
        ...this.railOrder.consignee,
        name: this.consigneeName.value,
        customerId: {
          ...this.railOrder.consignee?.customerId,
          sgv: this.consigneeCustomerId.value,
          authorityOfCustomerId: this.consigneeAuthorityOfCustomerIdCustomerId.value
        },
        address: {
          ...this.railOrder.consignee?.address,
          street: this.consigneeAddressStreet.value,
          city: this.consigneeAddressCity.value,
          country: this.consigneeAddressCountry.value,
          zipCode: this.consigneeAddressZipCode.value
        },
        comment: this.consigneeComment.value,
        contactPerson: {
          ...this.railOrder.consignee?.contactPerson,
          name: this.consigneeContactPersonName.value,
          tel: this.consigneeContactPersonTel.value,
          fax: this.consigneeContactPersonFax.value,
          email: this.consigneeContactPersonEmail.value
        }
      };

      this.railOrder.freightpayerConsignee = {
        ...this.railOrder.freightpayerConsignee,
        customerId: {
          ...this.railOrder.freightpayerConsignee?.customerId,
          sgv: this.freightPayerConsigneeCustomerIdSgv.value,
          authorityOfCustomerId: this.freightPayerConsigneeCustomerIdAuthorityOfCustomerId.value
        },
        address: {
          ...this.railOrder.freightpayerConsignee?.address,
          zipCode: this.freightPayerConsigneeAddressZipCode.value
        },
        vatId: this.freightPayerConsigneeVatId.value
      };

      this.railOrder.unloadingParty = {
        ...this.railOrder.unloadingParty,
        customerId: {
          ...this.railOrder.unloadingParty?.customerId,
          sgv: this.unloadingPartyCustomerIdSgv.value,
          authorityOfCustomerId: this.unloadingPartyCustomerIdAuthorityOfCustomerId.value
        },
        address: {
          ...this.railOrder.unloadingParty?.address,
          zipCode: this.unloadingPartyAddressZipCode.value
        },
        name:  this.unloadingPartyName.value
      };

    // console.log('Consignee / Consignor: Updated RailOrder:', this.railOrder);
  }


  protected togglePartyInfoConsignorVisibility() {
    this.isPartyInfoConsignorVisible = !this.isPartyInfoConsignorVisible;
  }

  protected togglePartyInfoConsigneeVisibility() {
    this.isPartyInfoConsigneeVisible = !this.isPartyInfoConsigneeVisible;
  }

  public validate(): string[] {
    //console.log('validate NewOrderConsignorConsigneeComponent');
    return [];
  }

  protected get consignor(): FormGroup {
    return this.formGroup.get('consignor') as FormGroup;
  }

  protected get consignorCustomerId(): FormControl {
    return this.formGroup.get('consignor').get('customerId') as FormControl;
  }

  protected get consignorPartnerId(): FormControl {
    return this.formGroup.get('consignor').get('partnerId') as FormControl;
  }

  protected get consignorAddressStreet(): FormControl {
    return this.formGroup.get('consignor').get('street') as FormControl;
  }

  protected get consignorAddressCountry(): FormControl {
    return this.formGroup.get('consignor').get('country') as FormControl;
  }

  // protected get consignorAddressCity() : FormControl {
  //   return this.formGroup.get('consignor').get('city') as FormControl;
  // }

  protected get consignorComment(): FormControl {
    return this.formGroup.get('consignor').get('comment') as FormControl;
  }

  protected get consignorContactPersonName(): FormControl {
    return this.formGroup.get('consignor').get('name') as FormControl;
  }

  protected get consignorContactPersonTel(): FormControl {
    return this.formGroup.get('consignor').get('tel') as FormControl;
  }

  protected get consignorContactPersonFax(): FormControl {
    return this.formGroup.get('consignor').get('fax') as FormControl;
  }

  protected get consignorContactPersonEmail(): FormControl {
    return this.formGroup.get('consignor').get('email') as FormControl;
  }

  protected get freightpayerConsignor(): FormGroup {
    return this.formGroup.get('freightpayerConsignor') as FormGroup;
  }
  protected get freightPayerConsignorCustomerIdSgv(): FormControl {
    return this.formGroup.get('freightpayerConsignor').get('sgv') as FormControl;
  }

  protected get freightPayerConsignorCustomerIdAuthorityOfCustomerId(): FormControl {
    return this.formGroup.get('freightpayerConsignor').get('authorityOfCustomerId') as FormControl;
  }

  protected get freightPayerConsignorAddressZipCode(): FormControl {
    return this.formGroup.get('freightpayerConsignor').get('zipCode') as FormControl;
  }

  protected get freightPayerConsignorVatId(): FormControl {
    return this.formGroup.get('freightpayerConsignor').get('vatId') as FormControl;
  }

  protected get loadingParty(): FormGroup {
    return this.formGroup.get('loadingParty') as FormGroup;
  }

  protected get loadingPartyCustomerIdSgv(): FormControl {
    return this.formGroup.get('loadingParty').get('sgv') as FormControl;
  }

  protected get loadingPartyCustomerIdAuthorityOfCustomerId(): FormControl {
    return this.formGroup.get('loadingParty').get('authorityOfCustomerId') as FormControl;
  }
  protected get loadingPartyName(): FormControl {
    return this.formGroup.get('loadingParty').get('name') as FormControl;
  }

  protected get loadingPartyAddressZipCode(): FormControl {
    return this.formGroup.get('loadingParty').get('zipCode') as FormControl;
  }

  protected get consignee(): FormGroup {
    return this.formGroup.get('consignee') as FormGroup;
  }

  protected get consigneeAuthorityOfCustomerIdCustomerId(): FormControl {
    return this.formGroup.get('consignee').get('authorityOfCustomerId') as FormControl;
  }

  protected get consigneeCustomerId(): FormControl {
    return this.formGroup.get('consignee').get('customerId') as FormControl;
  }

  protected get consigneeName(): FormControl {
    return this.formGroup.get('consignee').get('name') as FormControl;
  }

  protected get consigneeAddressStreet(): FormControl {
    return this.formGroup.get('consignee').get('street') as FormControl;
  }

  protected get consigneeAddressCity(): FormControl {
    return this.formGroup.get('consignee').get('city') as FormControl;
  }

  protected get consigneeAddressCountry(): FormControl {
    return this.formGroup.get('consignee').get('country') as FormControl;
  }

  protected get consigneeAddressZipCode(): FormControl {
    return this.formGroup.get('consignee').get('zipCode') as FormControl;
  }

  protected get consigneeComment(): FormControl {
    return this.formGroup.get('consignee').get('comment') as FormControl;
  }

  protected get consigneeContactPersonName(): FormControl {
    return this.formGroup.get('consignee').get('contactPersonName') as FormControl;
  }

  protected get consigneeContactPersonTel(): FormControl {
    return this.formGroup.get('consignee').get('tel') as FormControl;
  }

  protected get consigneeContactPersonFax(): FormControl {
    return this.formGroup.get('consignee').get('fax') as FormControl;
  }

  protected get consigneeContactPersonEmail(): FormControl {
    return this.formGroup.get('consignee').get('email') as FormControl;
  }

  protected get freightPayerConsigneeCustomerIdSgv(): FormControl {
    return this.formGroup.get('freightPayerConsignee').get('sgv') as FormControl;
  }

  protected get freightPayerConsigneeCustomerIdAuthorityOfCustomerId(): FormControl {
    return this.formGroup.get('freightPayerConsignee').get('authorityOfCustomerId') as FormControl;
  }

  protected get freightPayerConsigneeAddressZipCode(): FormControl {
    return this.formGroup.get('freightPayerConsignee').get('zipCode') as FormControl;
  }

  protected get freightPayerConsigneeVatId(): FormControl {
    return this.formGroup.get('freightPayerConsignee').get('vatId') as FormControl;
  }

  protected get unloadingPartyCustomerIdSgv(): FormControl {
    return this.formGroup.get('unloadingParty').get('sgv') as FormControl;
  }

  protected get unloadingPartyCustomerIdAuthorityOfCustomerId(): FormControl {
    return this.formGroup.get('unloadingParty').get('authorityOfCustomerId') as FormControl;
  }


  protected get unloadingParty(): FormGroup {
    return this.formGroup.get('unloadingParty') as FormGroup;
  }

  protected get unloadingPartyName(): FormControl {
    return this.formGroup.get('unloadingParty').get('name') as FormControl;
  }

  protected get unloadingPartyAddressZipCode(): FormControl {
    return this.formGroup.get('unloadingParty').get('zipCode') as FormControl;
  }

  protected onChangeConsignorPartnerId($event) {
    if(!$event.target.value) {
      this.consignorAddressStreet.setValue(null);
      this.consignorAddressStreet.enable({emitEvent: false});
      this.consignorAddressCountry.setValue(null);
      this.consignorAddressCountry.enable({emitEvent: false});
      return;
    }
    if(!this.railOrder.consignor) {
      this.railOrder.consignor = {};
    }
    if(!this.railOrder.consignor.partnerId) {
      this.railOrder.consignor.partnerId = {site: null};
    }

    this.railOrder.consignor.partnerId.site = $event.target.value;

    this.setAddress4SgvPartnerId();
  }

  private setAddress4SgvPartnerId() {
    this.trainOrderService.getCustomersAddress(this.railOrder.consignor.customerId.sgv, this.railOrder.consignor.partnerId.site).subscribe({
      next: (address: SiteAddress) => {
        if(!this.railOrder.consignor) {
          this.railOrder.consignor = initialParty();
        }
        if(!this.railOrder.consignor.address) {
          this.railOrder.consignor.address = initialPartyAdress();
        }
        this.railOrder.consignor.address.zipCode = address.postalCode;
        this.railOrder.consignor.address.street = address.street;
        this.railOrder.consignor.address.country = address.country;
        this.railOrder.consignor.address.city = address.city;
        this.consignorAddressStreet.setValue(address.street);
        this.consignorAddressStreet.disable({emitEvent: false});
        this.consignorAddressCountry.setValue(address.country);
        this.consignorAddressCountry.disable({emitEvent: false});
      }
    });
  }

  private updateConsignorCustomerId(event) {
    if(!event.target.value) {
      return;
    }

    this.addEmptyCustomer();
    this.railOrder.consignor.customerId.sgv = this.customerSgvNamePipe.reverse(event.target.value)?.sgvNumber;
    this.railOrder.consignor.name = this.customerSgvNamePipe.reverse(event.target.value)?.name;
  }

  protected sites: {partnerId: string; siteName: string;}[] = [];

  private addEmptyCustomer() {
    if (!this.railOrder.consignor) {
      this.railOrder.consignor = {};
    }
    if (!this.railOrder.consignor.customerId) {
      this.railOrder.consignor.customerId = { sgv: null };
    }
  }

  protected onChangeCustomerIdExternalUser(event: any) {
    this.sites = new Array();

    if(event.target.value) {
      const found = this.consignorCustomerSuggestions.find(ss => ss.sgvId == event.target.value);
      if(found) {
        this.sites = found.sites;
      }
    }

    this.addEmptyCustomer();
    this.consignorPartnerId.setValue(null);

    if(this.railOrder.consignor.partnerId) {
      this.railOrder.consignor.partnerId.site = null;
    }
    this.railOrder.consignor.customerId.sgv = event.target.value || null;
  }

  blur() {
    //console.log('blur');
  }

  protected getConsignorCustomersList($event) {
    //console.log('getConsignorCustomersList (input)');
    if ($event.target.value && $event.target.value.length > 2) {
      // TODO check first, if element is in list this.consignorCustomerSuggestions4Internal
      this.getCustomersByQuery($event.target.value);
    }
  }

  private getCustomersByQuery(query: string) {
    this.trainOrderService.getCustomers(query).pipe(debounceTime(500)).subscribe({
      next: (result: Customer[]) => {
        this.consignorCustomerSuggestions4Internal = result;
      }
    });
  }

  protected getPartners(event: any) {
    //console.log('getPartners (change)');
    this.sites = new Array();
    if(event.target.value) {
      const customerProfile = this.customerSgvNamePipe.reverse(event.target.value);

      this.trainOrderService.getSites4Sgv(customerProfile.sgvNumber).subscribe({
        next: (sites: Site[]) => {
          sites.forEach(s => {
            this.sites.push({partnerId: s.partnerId, siteName: s.name});
          });
        }
      });
      this.updateConsignorCustomerId(event);
    }
  }

  protected customerSgvNameDisplay(value: Customer) {
    // console.log("customerSgvNameDisplay", this.consignorCustomerId.value);
    const customerSgvNamePipe: CustomerSgvNamePipe = new CustomerSgvNamePipe();
    return customerSgvNamePipe.transform(value) as string;
  }

  protected clearInput(arg: string) {
    switch(arg) {
      case 'consignorCustomerId': {
        this.consignorCustomerId.setValue(null);
        this.consignorPartnerId.setValue(null);
        this.consignorAddressStreet.setValue(null);
        this.consignorAddressStreet.enable();
        this.consignorAddressCountry.setValue(null);
        this.consignorAddressCountry.enable();
        if(this.railOrder.consignor && this.railOrder.consignor.customerId && this.railOrder.consignor.customerId.sgv) {
          this.railOrder.consignor.customerId.sgv = null;
        }
        if(this.railOrder.consignor && this.railOrder.consignor.partnerId && this.railOrder.consignor.partnerId.site) {
          this.railOrder.consignor.partnerId.site = null;
        }
        if(this.railOrder.consignor?.address) {
          this.railOrder.consignor.address.street = null;
          this.railOrder.consignor.address.country = null;
          this.railOrder.consignor.address.zipCode = null;
          this.railOrder.consignor.address.city = null;
        }
      }
    }
  }

  protected getErrorMessage(): string {
    const control = this.formGroup.get('loadingParty');
    const controlFreightPayerConsignorSgv = this.formGroup.get('freightpayerConsignor').get('sgv');

    if (control.hasError('loadingPartyCustomerIdInvalidCombinationSgvZip')) {
        return this.translate.instant('New-order.Errors.Loading-party-customerno-missing');
    }

    if (control.hasError('loadingPartyCustomerIdMustBeNumeric')) {
        return this.translate.instant('Shared.Errors.Invalid-number');
    }

    if (controlFreightPayerConsignorSgv.hasError('freightpayerConsignorSgvNotNumeric')) {
      return this.translate.instant('Shared.Errors.Invalid-number');
    }

    if (controlFreightPayerConsignorSgv.hasError('freightpayerConsignorInvalidCombinationSgvZip')) {
      return this.translate.instant('New-order.Errors.Freightpayer-dispatch-customerno-missing');
    }








    return this.translate.instant('New-order.Errors.Unknown-error'); // Default error message
}
}
