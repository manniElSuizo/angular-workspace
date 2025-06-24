import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss']
})
export class DeleteUserComponent {

  constructor(
      private dialogRef: MatDialogRef<DeleteUserComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    console.log('data aus DeleteUserComponent', this.data);
  }

  delete() {
    this.dialogRef.close(true);
  }
  cancel() {
    this.dialogRef.close(false);
  }
}
