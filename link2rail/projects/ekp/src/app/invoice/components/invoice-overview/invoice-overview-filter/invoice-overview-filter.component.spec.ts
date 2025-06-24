import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {InvoiceOverviewFilterComponent} from './invoice-overview-filter.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ChangeDetectorRef} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';

// A stub for ChangeDetectorRef may be defined if needed for testing.
class MockChangeDetectorRef {
    detectChanges(): void {}
}

describe('InvoiceOverviewFilterComponent', () => {
    let component: InvoiceOverviewFilterComponent;
    let fixture: ComponentFixture<InvoiceOverviewFilterComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                InvoiceOverviewFilterComponent,
                ReactiveFormsModule,
                TranslateModule.forRoot(),
                HttpClientTestingModule
            ],
            providers: [
                {provide: ChangeDetectorRef, useClass: MockChangeDetectorRef}
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InvoiceOverviewFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call ngOnInit lifecycle hook', () => {
        spyOn(component, 'ngOnInit').and.callThrough();
        component.ngOnInit();
        expect(component.ngOnInit).toHaveBeenCalled();
    });

    it('should call ngAfterViewInit lifecycle hook', () => {
        spyOn(component, 'ngAfterViewInit').and.callThrough();
        component.ngAfterViewInit();
        expect(component.ngAfterViewInit).toHaveBeenCalled();
    });
});