import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '@src/app/shared/shared.module';
import { CustomerProfileSave, TomGroup } from '@src/app/user-management/model/profile.model';
import { Role } from '@src/app/user-management/model/role.model';

@Component({
  selector: 'app-profile-list-update',
  templateUrl: './profile-list-update.component.html',
  styleUrls: ['./profile-list-update.component.scss'],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class ProfileListUpdateComponent {

  profiles: CustomerProfileSave[] = [];
  availableRoles: Role[];
  tomGroups: TomGroup[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ProfileListUpdateComponent>) {
    this.profiles = data.current.profiles;
    this.availableRoles = data.availableRoles;
    this.tomGroups = data.tomGroups;

  }

  getGroupName(id: number | null | undefined): string {
    if (id === null || id === undefined) {
      console.error('Failed to find group name: Invalid group id' + id);
      return '';
    }
    let group = this.tomGroups.find(group => { return group.id === id; });
    if (group) {
      return group.groupName;
    }
    console.error('Failed to find group name [id: ' + id + ']');
    return '';
  }

  close(decision: boolean){
    this.dialogRef.close(decision);
  }
}
