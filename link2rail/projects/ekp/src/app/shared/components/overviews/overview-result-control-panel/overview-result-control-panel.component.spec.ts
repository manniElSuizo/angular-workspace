import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OverviewResultControlPanelComponent} from './overview-result-control-panel.component';
import {TranslateModule} from '@ngx-translate/core';
import {AsyncPipe, NgIf} from '@angular/common';

describe('OverviewResultControlPanelComponent', () => {
    let component: OverviewResultControlPanelComponent;
    let fixture: ComponentFixture<OverviewResultControlPanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), NgIf, AsyncPipe, OverviewResultControlPanelComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(OverviewResultControlPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit loadMoreClicked event when loadMore is called', () => {
        spyOn(component.loadMoreClicked, 'emit');
        component.loadMore();
        expect(component.loadMoreClicked.emit).toHaveBeenCalled();
    });

    it('should update showLoadMoreButton$ when inputs change', () => {
        const showLoadMoreButtonSpy = spyOn(component.showLoadMoreButton$, 'next');
        component.totalNumberOfResult = 10;
        component.numberOfResults = 5;
        component.ngOnChanges({
            totalNumberOfResult: {currentValue: 10, previousValue: 0, firstChange: false, isFirstChange: () => false},
            numberOfResults: {currentValue: 5, previousValue: 0, firstChange: false, isFirstChange: () => false}
        });
        expect(showLoadMoreButtonSpy).toHaveBeenCalledWith(true);
    });

    it('should not show load more button if numberOfResults equals totalNumberOfResult', () => {
        const showLoadMoreButtonSpy = spyOn(component.showLoadMoreButton$, 'next');
        component.totalNumberOfResult = 10;
        component.numberOfResults = 10;
        component.ngOnChanges({
            totalNumberOfResult: {currentValue: 10, previousValue: 0, firstChange: false, isFirstChange: () => false},
            numberOfResults: {currentValue: 10, previousValue: 0, firstChange: false, isFirstChange: () => false}
        });
        expect(showLoadMoreButtonSpy).toHaveBeenCalledWith(false);
    });
});