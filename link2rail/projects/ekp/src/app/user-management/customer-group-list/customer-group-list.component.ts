import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {  MatDialog, MatDialogRef} from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { CustomerGroupListResponse, CustomerGroupListService } from './customer-group-list.service';
import { CustomerGroup } from '../model/customergroup.model';
import { CustomerGroupEditComponent } from './customer-group-edit/customer-group-edit.component';
import { UserGroup } from '../model/usergroup.model';
import { UserManagementService } from '../user-management.service';

@Component({
  selector: 'app-customer-group-list',
  templateUrl: './customer-group-list.component.html',
  styleUrls: ['./customer-group-list.component.scss']
})

export class CustomerGroupListComponent implements OnInit {
    filterForm: FormGroup;
    loadingInProgress: boolean;

    tableHeaders: any[] = [];
    availableGroups: CustomerGroup[];
    filteredGroups: CustomerGroup[] = [];
    displayGroups: CustomerGroup[] = [];
    limit: number = 25;

    sortConditions: SortConditionsModel = {field: "groupName", asc: true};

    constructor(
      private modalWindows: ModalWindows,
      private translate: TranslateService,
      private customerGroupListService: CustomerGroupListService,
      private dialog: MatDialog,
      protected userManagementService: UserManagementService) {
      this.createTableHeaders();
    }

    ngAfterViewInit(): void {
    }

    ngOnInit(): void {
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

    private createTableHeaders(): void {
      this.tableHeaders = [
        { text: this.translate.instant('User-management-component.CustomerGroup.groupName'), value: 'groupName', sortField: true, width: "700px"},
        { text: this.translate.instant('User-management-component.CustomerGroup.userGroups'), value: 'userGroups'},
      ];
    }

    sortTable(value: string): void {
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

      this.sortGroups(this.filteredGroups);
      this.displayGroups = this.filteredGroups.slice(0, this.limit);
    }

    sortGroups(groups: CustomerGroup[]): void {
      groups.sort((a, b) => {
        const valueA = this.getNestedValue(a, this.sortConditions.field)?.toLocaleLowerCase() ?? '';
        const valueB = this.getNestedValue(b, this.sortConditions.field)?.toLocaleLowerCase() ?? '';
        if (valueA < valueB) {
          return this.sortConditions.asc ? -1 : 1;
        } else if (valueA > valueB) {
          return this.sortConditions.asc ? 1 : -1;
        } else {
          return 0;
        }
      });
    }

    private getNestedValue(obj: any, path: string): any {
      return path.split('.').reduce((acc, part) => {
        return acc && acc[part];
      }, obj);
    }

    loadMore(): void {
      this.filterGroups(this.limit + 25);
    }

    get groupname(): AbstractControl | null {
      return this.filterForm.get('groupname');
    }


    filterGroups(limit?: number) {
      this.loadingInProgress = true;

      if(limit) {
        this.limit = limit;
      } else {
        this.limit = 25;
      }

      const groupName = this.groupname.value.toLowerCase();
      this.filteredGroups =
        this.availableGroups
          .filter((g) => g.groupName.toLowerCase().indexOf(groupName) >= 0 || g.groupName.toLowerCase().indexOf(groupName) >= 0);


      this.sortGroups(this.filteredGroups);

      this.displayGroups = this.filteredGroups.slice(0, this.limit);
      this.loadingInProgress = false;
    }

    fetchAllGroups() {
      this.loadingInProgress = true;
      this.customerGroupListService.fetchCustomerGroups().subscribe({
        next: (result) => {
          const customerGroupListResponse: CustomerGroupListResponse = result;
          this.availableGroups = customerGroupListResponse.groups;
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

    openGroupModal(groupId?: string) {
      let dialogRef: MatDialogRef<CustomerGroupEditComponent>;
      dialogRef = this.dialog.open(CustomerGroupEditComponent, { data: { groupId: groupId }, width: '1200px' });
      dialogRef.afterClosed().pipe().subscribe( { next: () => {
        this.fetchAllGroups();
      }});
    }
}
