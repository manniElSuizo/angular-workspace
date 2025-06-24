import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {Subject} from "rxjs";
import { CommonModule } from '@angular/common';
import { ToasterDataType, ToasterService } from '@src/app/shared/services/toaster/toaster.service';
import { AppService } from '@src/app/app.service';
@Component({
    selector: 'app-overview-filter-control-panel',
    standalone: true,
    imports: [
        CommonModule,
        NgIf,
        TranslateModule
    ],
    templateUrl: './overview-filter-control-panel.component.html',
    styleUrl: './overview-filter-control-panel.component.scss'
})
export class OverviewFilterControlPanelComponent {
    @Input() isTM: boolean = false;
    @Input() resultsCount: number = 0;
    @Input() activeFiltersCount: number = 0;
    @Input() isLoading: Subject<boolean> = new Subject<boolean>();
    @Input() downloadInProgress: boolean = false;
    @Output() resetFilters = new EventEmitter<void>();
    @Output() downloadReport = new EventEmitter<void>();

    readonly MAX_FILTER_COUNT = 10000;
    loadingInProgress: boolean = false;
    private appService: AppService = inject(AppService);
    private toasterService: ToasterService = inject(ToasterService);
    private translate: TranslateService = inject(TranslateService);

    ngOnInit() {
        this.isLoading.subscribe((loading: boolean) => {
            this.loadingInProgress = loading;
        });
        console.log("Current Language: ", this.appService.language);
        this.appService.language
    }

    onClickResetAllFilters() {
        this.resetFilters.emit();
    }

    onClickDownloadReport() {
        if(!this.downloadInProgress) {
            this.downloadReport.emit();
            if(this.resultsCount > 1000) {
                this.toasterService.addMessage(this.translate.instant('common.components.overview.downloadHint'));
            }
        }
    }
}
