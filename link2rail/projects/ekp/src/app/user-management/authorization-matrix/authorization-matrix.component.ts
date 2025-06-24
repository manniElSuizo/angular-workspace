import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthorizationMatrix, AuthorizationAppModule, AuthorizationMatrixService, AuthorizationInfo, AuthorizationGrantedRole } from './authorization-matrix.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerProfile, CustomerProfileSave, ProfileStatusType, TomGroup} from '../model/profile.model';
import { TrainorderService } from '../../trainorder/services/trainorder.service';
import { Customer, CustomerResponse } from '../../trainorder/models/ApiCustomers.model';
import { CustomerSgvNamePipe } from '../../shared/pipes/customer-sgv-name.pipe';
import * as _ from 'lodash';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RolesListResponse, UserListService } from '../user-list/user-list.service';
import { Role } from '../model/role.model';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { ErrorDialogComponent } from '@src/app/shared/components/api-error/api-error.component';

@Component({
  selector: 'app-authorization-matrix',
  templateUrl: './authorization-matrix.component.html',
  styleUrls: ['./authorization-matrix.component.scss'],
  providers: [CustomerSgvNamePipe]
})
export class AuthorizationMatrixComponent implements OnInit {

  loadingInProgress: boolean;
  tableHeaders: any[] = [];
  tableHeaderGroups: any[] = [];
  tableRows: any[] = [];
  appModules: AuthorizationAppModule[];
  authorizations: AuthorizationInfo[];
  authLength = 0;

  constructor(private dialog: MatDialog,
    private translate: TranslateService,
    private authorizationMatrixService: AuthorizationMatrixService,
    private fb: FormBuilder,
    private modalWindows: ModalWindows
  ) {

  }

  ngOnInit(): void {
    this.requestMatrix();
  }

  private createTableHeaders(): void {
    this.tableHeaders = [];
    this.tableHeaderGroups = [];

    this.tableHeaderGroups.push({ text: '', value: '', sortfield: false, colSpan: 1 });
    this.tableHeaderGroups.push({ text: '', value: '', sortfield: false, colSpan: 1 });
    this.tableHeaders.push({ text: 'Berechtigung \\ Rolle', value: '', sortfield: true, rightBorder: true , colSpan: 2});
    let that = this;

    this.appModules.sort((a, b) => {
      return a.appModule.localeCompare(b.appModule);
    });

    this.appModules.forEach(function(m: AuthorizationAppModule) {
      that.tableHeaderGroups.push({ text: m.appModule, value: '', sortfield: false, colSpan: m.authorizationRoles.length });
      m.authorizationRoles.forEach(function(a: string) {
        that.tableHeaders.push({ text: a, value: '', sortfield: true });
      });
      let end = that.tableHeaders.pop();
      end.rightBorder = true;
      that.tableHeaders.push(end);
    });

  }

  createTableRows(): void {
    this.tableRows = [];
    let that = this;

    this.authorizations.sort((a, b) => {
      let c = a.module.localeCompare(b.module);

      if(c == 0) {
        c = a.authorization.replace("READ", "").replace("UPDATE", "").replace("WRITE", "").replace("DELETE", "").replace("INSERT", "").localeCompare (
          b.authorization.replace("READ", "").replace("UPDATE", "").replace("WRITE", "").replace("DELETE", "").replace("INSERT", "")
        );

        if(c == 0) {
          c = a.authorization.localeCompare(b.authorization);
        }
      }

      return c;
    });

    let modules = new Map<string, number>();
    this.authorizations.forEach(function(a : AuthorizationInfo) {

      if(modules.has(a.module)) {
        modules.set(a.module, modules.get(a.module)+1);
      }else {
        modules.set(a.module, 1);
      }

    });

    let lastModule = undefined;
    this.authorizations.forEach(function(a: AuthorizationInfo) {
      let tableRow: any[] = [];

      if(lastModule == undefined || a.module != lastModule) {
        lastModule = a.module;
        tableRow.push({text: a.module, rowSpan: modules.get(a.module), class: 'module', customerRoles: ''});
      }

      tableRow.push({text: a.authorization, rightBorder: true, rowSpan: 1, customerRoles: ''});


      that.tableHeaders.slice(1).forEach(function(tableHeader: any) {
        let exists: boolean = false;
        let customerRoles: string = "";

        a.grantedRoles.forEach(function(r: AuthorizationGrantedRole) {
          if(tableHeader.text == r.authorizationRole) {
            exists = true;
            if(r.customerRoles) {
              customerRoles = r.customerRoles.join(", ");
            }
          }
        });

        if(exists) {
          tableRow.push({text: "X", customerRoles: customerRoles, rightBorder: tableHeader.rightBorder, rowSpan: 1});
        }else {
          tableRow.push({text: "", rightBorder: tableHeader.rightBorder, rowSpan: 1})
        }
      });

      that.tableRows.push(tableRow);
    });
  }

  private requestMatrix() {
    this.loadingInProgress = true;
    this.authorizationMatrixService.requestMatix().subscribe({
      next: (response) => {
        const authorizationMatrix: AuthorizationMatrix = response;
        this.appModules = response.appModules;
        this.authorizations = response.authorizations;
      },
      error: (err) => {
        this.modalWindows.openErrorDialog({ apiProblem: err.error });
        console.error(err);
      }
    }).add(() => {
      this.loadingInProgress = false;
      this.authLength = this.authorizations.length;
      this.createTableHeaders();
      this.createTableRows();
    });
  }
}
