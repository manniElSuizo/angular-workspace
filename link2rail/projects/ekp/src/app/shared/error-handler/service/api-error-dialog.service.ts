import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GenericErrorComponent } from '../generic-error/generic-error.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {

  constructor(private dialog: MatDialog) { }

  public openApiErrorDialog(error: any, afterClose: () => void = null): MatDialogRef<GenericErrorComponent> {
    const config = { data: (error), width: 700 + 'px' };
    const dialogRef = this.dialog.open(GenericErrorComponent, config);
    if(afterClose) {
      dialogRef.afterClosed().subscribe({
        next: () => afterClose()
      });
    }
    return dialogRef;
  }
}
