import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CustomerProfile } from '@src/app/user-management/model/profile.model';

@Component({
    selector: 'app-pick-list',
    templateUrl: './pick-list.component.html',
    styleUrls: ['./pick-list.component.scss'],
})

export class PickListComponent implements OnInit {

    @Output() assigned = new EventEmitter<CustomerProfile[]>();
    @Output() unassigned = new EventEmitter<CustomerProfile[]>();

    @Input() unassignedProfiles: CustomerProfile[] = [];
    @Input() assignedProfiles: CustomerProfile[] = [];
    @Input() primaryProfileId: number | null;

    selectedUnassignedListItem: HTMLElement | null;
    selectedAssignedListItem: HTMLElement | null;
    constructor(private translate: TranslateService) {
      // NOOP
    }

    ngOnInit(): void {
      // NOOP
    }

    assignAll(): void {
      if (this.unassignedProfiles?.length > 0) {
        this.assignedProfiles.push(...this.unassignedProfiles);
        this.assignedProfiles = this.sortList(this.assignedProfiles);
        this.unassignedProfiles = [];
      }
      this.selectedAssignedListItem = null;
      this.selectedUnassignedListItem = null;
      this.assigned.emit(this.assignedProfiles);
      this.unassigned.emit(this.unassignedProfiles);
    }

    assignSelectedItem(): void {
      const selectedListItem = this.findUnassignedSelectedListItem();
      if (selectedListItem) {
        this.unassignedProfiles = this.unassignedProfiles.filter(item => { return String(item.id) !== this.selectedUnassignedListItem?.id } );
        this.assignedProfiles.push(selectedListItem);
        this.assignedProfiles = this.sortList(this.assignedProfiles);
      }
      this.selectedAssignedListItem = null;
      this.selectedUnassignedListItem = null;
      this.assigned.emit(this.assignedProfiles);
      this.unassigned.emit(this.unassignedProfiles);
    }

    unselectAllItems(): void {
      if (this.selectedUnassignedListItem) {
        this.selectedUnassignedListItem.style.background = '#FFF';
        this.selectedUnassignedListItem.style.color = '#3c414b';
      }
      if (this.selectedAssignedListItem) {
        this.selectedAssignedListItem.style.background = '#FFF';
        this.selectedAssignedListItem.style.color = '#3c414b';
      }
    }

    selectUnassignedListItem(id: number) {
      this.unselectAllItems();
      const sid = String(id);
      let el = document.getElementById(sid);
      if (el) {
        el.style.background = '#c8cdd2';
        el.style.color = '#000';
        this.selectedUnassignedListItem = el;
      }
    }

    selectAssignedListItem(id: number) {
      this.unselectAllItems();
      const sid = String(id);
      let el = document.getElementById(sid);
      if (el && id != this.primaryProfileId) {
        el.style.background = '#c8cdd2';
        el.style.color = '#000';
        this.selectedAssignedListItem = el;
      }
    }

    unassignAll(): void {
      let primaryProfile;

      this.assignedProfiles.forEach(p => {
        if(p.id != this.primaryProfileId) {
          this.unassignedProfiles.push(p);
        } else {
          primaryProfile = p
        }
      })

      this.assignedProfiles = [];
      if(primaryProfile) this.assignedProfiles.push(primaryProfile);

      this.selectedAssignedListItem = null;
      this.selectedUnassignedListItem = null;
      this.assigned.emit(this.assignedProfiles);
      this.unassigned.emit(this.unassignedProfiles);
    }

    unassignSelectedItem(): void {
      const selectedListItem = this.findAssignedSelectedListItem();
      if (selectedListItem) {
        this.assignedProfiles = this.assignedProfiles.filter(item => { return String(item.id) !== this.selectedAssignedListItem?.id } );
        this.unassignedProfiles.push(selectedListItem);
        this.unassignedProfiles = this.sortList(this.unassignedProfiles);
      }
      this.selectedAssignedListItem = null;
      this.selectedUnassignedListItem = null;
      this.assigned.emit(this.assignedProfiles);
      this.unassigned.emit(this.unassignedProfiles);
    }

    private sortList(list: CustomerProfile[]): CustomerProfile[] {
      return list.sort((a, b) => {
        if(b.id == this.primaryProfileId) return 1;
        return (a.sgv?.companyLocationNumber < b.sgv?.companyLocationNumber ? -1 : 1);
      });
    }

    private findAssignedSelectedListItem(): CustomerProfile | undefined {
      if (this.selectedAssignedListItem) {
        return this.assignedProfiles.find(item => String(item.id) === this.selectedAssignedListItem?.id)
      }
      return undefined;
    }

    private findUnassignedSelectedListItem(): CustomerProfile | undefined {
      if (this.selectedUnassignedListItem) {
        return this.unassignedProfiles.find(item => String(item.id) === this.selectedUnassignedListItem?.id)
      }
      return undefined;
    }
}
