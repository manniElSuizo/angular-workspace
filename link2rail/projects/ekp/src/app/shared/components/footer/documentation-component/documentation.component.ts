import { Component, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ReleaseInformationComponent } from "@src/app/system-information/release-information/release-information.component";
import { UserManualComponent } from "@src/app/system-information/user-manual/user-manual.compoonent";
import { Subject } from "rxjs/internal/Subject";
import { SystemInformationComponent } from "@src/app/system-information/system-information.component";
@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss'],
})
export class DocumentationComponent {

  @ViewChild('release', { static: false}) releaseInformation!: ReleaseInformationComponent;
  @ViewChild('manual', { static: false}) userManual!: UserManualComponent;

  private subject = new Subject<any>();

  constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<SystemInformationComponent>) {

  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected openDialog<T>(comp: new (...args: any[]) => T, config: any): void {
    let dialogRef: MatDialogRef<T>;
    dialogRef = this.dialog.open(comp, config);
    dialogRef.afterClosed().subscribe(decision => {
        this.subject.next(decision);
    });
  }

  protected openConfirmationModal(): void {
    this.openDialog(SystemInformationComponent, { maxWidth: '70vw', maxHeight: '80vh', height: '100%', width: '90%', panelClass: 'full-screen-modal' });
    this.subject.subscribe(decision => {
      if (decision == true) {
        this.dialogRef.close();
      }
    });
  }

  protected manualInfoSelected(): void {
    if (this.userManual) {
      this.userManual.init();
    }
  }

  protected releaseInfoSelected(): void {
    if (this.releaseInformation) {
      this.releaseInformation.init();
    }
  }
}
