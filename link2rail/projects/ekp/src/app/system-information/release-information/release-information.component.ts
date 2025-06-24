import { Component, OnInit } from "@angular/core";
import { ReleaseInformationService } from "./release-information.service";
import { ReleaseInformationResponse } from "../models/release-information-response.model";
import { ReleaseInformation } from "../models/release-Information.model";
import { TranslateService } from "@ngx-translate/core";
import { ModalWindows } from "@src/app/shared/components/modal-windows/modal-windows";
import { PermissionService } from "@src/app/shared/permission/PermissionService";

@Component({
  selector: 'app-release-information',
  templateUrl: './release-information.component.html',
  styleUrls: ['../system-information.component.scss', './release-information.component.scss']
})
export class ReleaseInformationComponent implements OnInit {

  protected releaseInformationList: ReleaseInformation[] = [];
  protected fileName: string;
  protected loadingInProgress: boolean;
  protected showPdf: boolean;
  protected selected: Uint8Array;
  protected selectedRi: ReleaseInformation;
  protected total: number;
  protected offset: number;
  protected initiated: boolean;
  protected loadingCompleted: boolean;

  private file: File;

  constructor(private releaseInformationService: ReleaseInformationService, private modalWindows: ModalWindows, private translate: TranslateService, public permissionService: PermissionService) {
    this.loadingInProgress = true;
    this.initiated = false;
    this.total = 0;
    this.offset = 0;
  }

  ngOnInit(): void {
    this.fetchReleaseInformationList();
  }

  protected showFileNameInfo(): void {
    this.handleInfo(this.translate.instant('Shared.Errors.Filename'));
  }

  private handleInfo(message: string): void {
    this.modalWindows.openInfoDialog({ text: message });
  }

  protected fetchReleaseInformationList(): void {
    this.releaseInformationService.fetchReleaseInformationList(this.offset).subscribe({
      next: (result: ReleaseInformationResponse) => {
        if (result) {
          this.total = result.total;
          this.offset = result.offset;
          for (const releaseInformation of result.releaseInformationList) {
            this.releaseInformationList.push(releaseInformation);
          }
          this.releaseInformationList = this.releaseInformationList.sort(value => { return value.created ? -1 : 1; });
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

  public init(): void {
    if (!this.initiated) {
      if (this.releaseInformationList.length > 0) {
        this.loadingInProgress = true;
        setTimeout( () => {
          this.selectRow(0);
          this.selectReleaseInformation(this.releaseInformationList[0]);
          this.initiated = true;
          this.loadingInProgress = false;
        }, 1000 );
      }
    }
  }

  private handleError(message: string): void {
    this.modalWindows.openErrorDialog({ text: message });
  }

  protected download(id: number): void {
    const ri = this.releaseInformationList.find(x => {return x.id === id; });
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

  protected unselectAllRows(): void {
    for (let i = 0; i < this.releaseInformationList.length; i++) {
      this.unselectRow(i);
    }
  }

  private unselectRow(idx: number): void {
    const el = document.getElementById('ri_row_' + idx);
    if (el) {
      el.style.backgroundColor = '#fff';
      el.style.color = '#000';
    }
  }

  protected selectRow(idx: number): void {
    this.unselectAllRows();
    const el = document.getElementById('ri_row_' + idx);
    if (el) {
      el.style.backgroundColor = '#EC0016';
      el.style.color = '#fff';
      el.style.borderTopLeftRadius = '5px';
      el.style.borderBottomLeftRadius = '5px';
      el.style.borderTopRightRadius = '5px';
      el.style.borderBottomRightRadius = '5px';
    } else {
      console.warn('ri_row_' + idx + ' can not be found');
    }
  }

  protected onFileSelected(event: any): void {
    let f = event.target.files[0];
    if (f) {
      if (this.validateFileName(f.name)) {
        this.fileName = f.name;
        this.file = f;
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

  private convertDataURIToBinary(dataURI: string) {
    var raw = window.atob(dataURI);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(var i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  protected selectReleaseInformation(ri: ReleaseInformation): void {
    this.selected = this.convertDataURIToBinary(ri.pdf);
    this.selectedRi = ri;
    this.showPdf = true;
  }

  protected loadMore(): void {
    this.fetchReleaseInformationList();
  }

  protected uploadReleaseInformation(): void {
    this.loadingInProgress = true;
    if (this.file) {
      this.releaseInformationService.uploadReleaseInformation(this.file).subscribe({
        next: (result => {
          this.offset = 0;
          this.releaseInformationList = [];
          this.fetchReleaseInformationList();
          this.fileName = '';
        }),
        error: (error => {
          console.error(error);
        })
      });
    }
  }

  protected uploadReleaseInformationDisabled(): boolean {
    if (this.file && this.fileName && this.fileName.length > 0) {
      return false;
    }
    return true;
  }

  protected deleteReleaseInformation(id: number): void {
    this.releaseInformationService.deleteReleaseInformation(id).subscribe({
      next: (result => {
        if (this.offset > 0) this.offset -= 1;
        if (this.total > 0) this.total -= 1;
        this.releaseInformationList = this.releaseInformationList.filter(x => { return x.id !== id; });
        if (this.releaseInformationList.length > 0) {
          this.selectRow(0);
          this.selectReleaseInformation(this.releaseInformationList[0]);
        } else {
          this.showPdf = false;
        }
      }),
      error: (error => {
        console.error(error);
      })
    })
  }
}
