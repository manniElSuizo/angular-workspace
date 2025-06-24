import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@src/app/shared/shared.module';
import { UserListService } from '../../user-list/user-list.service';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { TranslateService } from '@ngx-translate/core';
import { User, UserAuthorizationInfo, UserAuthorizationMatrix } from '../../model/user.model';


@Component({
  selector: 'app-user-authorizations-form',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule,
    FormDialogModule
],
  templateUrl: './user-authorizations-form.component.html',
  styleUrl: './user-authorizations-form.component.scss'
})
export class UserAuthorizationsFormComponent implements OnInit {
  @Input() user: User;

  tableHeaders: any[];
  loaded: boolean = false;
  loadingInProgress: boolean = false;

  userAuth: UserAuthorizationMatrix;


  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private userListService: UserListService,
    private cd: ChangeDetectorRef) {
      this.createTableHeaders();
    }

  ngOnInit(): void {

  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      { text: this.translate.instant('User-management-component.Auth.Customer'), value: 'customer' },
      { text: this.translate.instant('User-management-component.Auth.CustomerGroup'), value: 'CustomerGroup' },
      { text: this.translate.instant('User-management-component.Auth.UserGroup'), value: 'UserGroup' },
      { text: this.translate.instant('User-management-component.Auth.Role'), value: 'role' },
      { text: this.translate.instant('User-management-component.Auth.Authorization'), value: 'authorization' },
      { text: this.translate.instant('User-management-component.Auth.CustomerRoles'), value: 'customerRoles' },
      { text: this.translate.instant('User-management-component.Auth.RelatedCustomer'), value: 'relatedCustomer' },
    ];
  }

  fetchAuth(): void {
    this.loadingInProgress = true;
    this.userListService.getUserAuthorizations(this.user.userId).subscribe({
      next: (userAuth: UserAuthorizationMatrix) => {
        this.userAuth = userAuth;
        this.userAuth.authorizations.sort((a, b) =>
          a.customer.localeCompare(b.customer) ??
          (a.customerGroup ?? "").localeCompare(b.customerGroup ?? "") ??
          (a.userGroup ?? "").localeCompare(b.userGroup ?? "") ??
          (a.module ?? "").localeCompare(b.module ?? "") ??
          (a.authorizationRole ?? "").localeCompare(b.authorizationRole ?? "") ??
          (a.authorization ?? "").localeCompare(b.authorization ?? "") ??
          (a.relatedCustomer ?? "").localeCompare(b.relatedCustomer ?? "")
          );
        this.loaded = true;
      }
    }).add(() => {
      this.loadingInProgress = false;
    });;
  }

  getCustomerRoles(auth: UserAuthorizationInfo): string {
    return auth.customerRoles ? auth.customerRoles.join(", ") : "";
  }
}

