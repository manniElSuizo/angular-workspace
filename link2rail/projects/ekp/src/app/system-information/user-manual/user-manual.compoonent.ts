import { Component, OnInit } from "@angular/core";
import { UserManualService } from "./user-manual.service";
import { UserManual } from "../models/user-manual.model";
import { UserManualResponse } from "../models/user-manual-response.model";
import { TranslateService } from "@ngx-translate/core";
import { ModalWindows } from "@src/app/shared/components/modal-windows/modal-windows";
import { PermissionService } from "@src/app/shared/permission/PermissionService";

@Component({
  selector: 'app-user-manual',
  templateUrl: './user-manual.component.html',
  styleUrls: ['../system-information.component.scss', './user-manual.component.scss']
})
export class UserManualComponent implements OnInit {

  protected userManuals: UserManual[] = [];
  protected userManualFileName: string;
  protected loadingInProgress: boolean;
  protected showPdf: boolean;
  protected selected: any;
  protected total: number;
  protected offset: number;
  protected loadingCompleted: boolean;

  private initiated: boolean;
  private userManualFile: File;

  constructor(private userManualService: UserManualService, private modalWindows: ModalWindows, private translate: TranslateService, public permissionService: PermissionService) {
    this.loadingInProgress = true;
    this.initiated = false;
    this.total = 0;
    this.offset = 0;
  }

  ngOnInit(): void {
    this.fetchUserManualList();
  }

  public init(): void {
    if (!this.initiated) {
      if (this.userManuals.length > 0) {
        this.loadingInProgress = true;
        setTimeout( () => {
          this.selectRow(0);
          this.selectUserManual(this.userManuals[0]);
          this.initiated = true;
          this.loadingInProgress = false;
        }, 1000 );
      }
    }
  }

  protected fetchUserManualList(): void {
    this.userManualService.fetchUserManualList(this.offset).subscribe({
      next: (result: UserManualResponse) => {
        if (result) {
          this.total = result.total;
          this.offset = result.offset;
          for (const userManual of result.usermanuals) {
            this.userManuals.push(userManual);
          }
          this.userManuals = this.userManuals.sort(value => { return value.created ? 1 : -1; });
        }
      },
      error: (error) => {
        console.error(error);
      }
    }).add(() => {
      this.loadingInProgress = false;
      this.loadingCompleted = true;
    });
  }

  protected unselectAllRows(): void {
    for (let i = 0; i < this.userManuals.length; i++) {
      this.unselectRow(i);
    }
  }

  private unselectRow(idx: number): void {
    const el = document.getElementById('um_row_' + idx);
    if (el) {
      el.style.backgroundColor = '#fff';
      el.style.color = '#000';
    }
  }

  protected selectRow(idx: number): void {
    this.unselectAllRows();
    const el = document.getElementById('um_row_' + idx);
    if (el) {
      el.style.backgroundColor = '#EC0016';
      el.style.color = '#fff';
      el.style.borderTopLeftRadius = '5px';
      el.style.borderBottomLeftRadius = '5px';
      el.style.borderTopRightRadius = '5px';
      el.style.borderBottomRightRadius = '5px';
    } else {
      console.warn('um_row_' + idx + ' can not be found');
    }
  }

  protected onFileSelected(event: any): void {
    let f = event.target.files[0];
    if (f) {
      if (this.validateFileName(f.name)) {
        this.userManualFileName = f.name;
        this.userManualFile = f;
      } else {
        this.showFileNameInfo();
      }
    }
  }

  private validateFileName(filename: string): boolean {
    filename = filename.toLocaleUpperCase();
    const a = filename.split("_");
    console.log(a);
    if (a.length === 2) {
      if(a[1].includes(".PDF")) {
        return true;
      }
    }
    return false;
  }

  private handleError(message: string): void {
    this.modalWindows.openErrorDialog({ text: message });
  }

  protected download(id: number): void {
    const ri = this.userManuals.find(x => {return x.id === id; });
    if (ri) {
      const linkSource = 'data:application/pdf;base64,' + ri.pdf;
      const downloadLink = document.createElement("a");
      const fileName = ri.name + ' ' + ri.version + '.pdf';
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    } else {
      this.handleError(this.translate.instant('Shared.Errors.download-file'));
    }
  }

  private convertDataURIToBinary(dataURI: string) {
    var raw = window.atob(dataURI);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(var i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  protected selectUserManual(um: UserManual): void {
    this.selected = this.convertDataURIToBinary(um.pdf);
    this.showPdf = true;
  }

  protected loadMore(): void {
    this.fetchUserManualList();
  }

  protected uploadUserManual(): void {
    this.loadingInProgress = true;
    if (this.userManualFile) {
      this.userManualService.uploadUserManual(this.userManualFile).subscribe({
        next: (result => {
          this.offset = 0;
          this.userManuals = [];
          this.initiated = false;
          this.fetchUserManualList();
          this.userManualFileName = '';
        }),
        error: (error => {
          console.error(error);
        })
      });
    }
  }

  protected showFileNameInfo(): void {
    this.handleInfo(this.translate.instant('Shared.Errors.Filename'));
  }

  private handleInfo(message: string): void {
    this.modalWindows.openInfoDialog({ text: message });
  }

  protected uploadUserManualDisabled(): boolean {
    if (this.userManualFile && this.userManualFileName && this.userManualFileName.length > 0) {
      return false;
    }
    return true;
  }

  protected deleteUserManual(id: number): void {
    this.loadingInProgress = true;
    this.userManualService.deleteManual(id).subscribe({
      next: (result => {
        if (this.offset > 0) this.offset -= 1;
        if (this.total > 0) this.total -= 1;
        this.userManuals = this.userManuals.filter(x => { return x.id !== id; });
        if (this.userManuals.length > 0) {
          this.initiated = false;
        } else {
          this.showPdf = false;
        }
        this.fetchUserManualList();
      }),
      error: (error => {
        console.error(error);
      })
    })
  }
}
