import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OverviewFilterControlPanelComponent} from './overview-filter-control-panel.component';
import {TranslateModule} from '@ngx-translate/core';
import {By} from '@angular/platform-browser';
import { ToasterService } from '@src/app/shared/services/toaster/toaster.service';

describe('OverviewFilterControlPanelComponent', () => {
    let component: OverviewFilterControlPanelComponent;
    let fixture: ComponentFixture<OverviewFilterControlPanelComponent>;
    let toasterService: jasmine.SpyObj<ToasterService>;

    beforeEach(async () => {
        const toastServiceSpy = jasmine.createSpyObj('ToasterService', ['addMessage']);
        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                OverviewFilterControlPanelComponent
            ],
            providers: [
                { provide: ToasterService, useValue: toastServiceSpy }
            ]
        }).compileComponents();

        toasterService = TestBed.inject(ToasterService) as jasmine.SpyObj<ToasterService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OverviewFilterControlPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit resetFilters event when onClickResetAllFilters is called', () => {
        spyOn(component.resetFilters, 'emit');

        component.onClickResetAllFilters();

        expect(component.resetFilters.emit).toHaveBeenCalled();
    });

    it('should emit downloadReport event when onClickDownloadReport is called', () => {
        spyOn(component.downloadReport, 'emit');

        component.onClickDownloadReport();

        expect(component.downloadReport.emit).toHaveBeenCalled();
    });

    it('should have default resultCount and activeFilterCount as 0', () => {
        expect(component.resultsCount).toBe(0);
        expect(component.activeFiltersCount).toBe(0);
    });

    // Example of testing template interaction
    it('should call onClickResetAllFilters when reset button is clicked', () => {
        spyOn(component, 'onClickResetAllFilters');

        component.activeFiltersCount = 1;
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('.filter-reset'));
        expect(button).not.toBeNull();
        button.triggerEventHandler('click', null);

        expect(component.onClickResetAllFilters).toHaveBeenCalled();
    });

    it('should call onClickDownloadReport when download button is clicked', () => {
        spyOn(component, 'onClickDownloadReport');

        const downloadBlock = fixture.debugElement.query(By.css('.download-block'));
        downloadBlock.triggerEventHandler('click', null);

        expect(component.onClickDownloadReport).toHaveBeenCalled();
    });
});
