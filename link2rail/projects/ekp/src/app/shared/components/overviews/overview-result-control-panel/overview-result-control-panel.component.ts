import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {AsyncPipe, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {Subject} from "rxjs";

@Component({
    selector: 'app-overview-result-control-panel',
    standalone: true,
    imports: [
        TranslateModule,
        NgIf,
        AsyncPipe
    ],
    templateUrl: './overview-result-control-panel.component.html',
    styleUrl: './overview-result-control-panel.component.scss'
})
export class OverviewResultControlPanelComponent {
    @Input() totalNumberOfResult: number = 0;
    @Input() numberOfResults: number = 0;
    @Output() loadMoreClicked = new EventEmitter<void>();
    public showLoadMoreButton$: Subject<boolean> = new Subject();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['totalNumberOfResult'] || changes['numberOfResults']) {
            this.updateShowLoadMoreButton();
        }
    }

    loadMore() {
        this.loadMoreClicked.emit();
    }

    private updateShowLoadMoreButton(): void {
        const shouldShow = this.totalNumberOfResult > 0 && this.numberOfResults < this.totalNumberOfResult;
        this.showLoadMoreButton$.next(shouldShow);
    }
}
