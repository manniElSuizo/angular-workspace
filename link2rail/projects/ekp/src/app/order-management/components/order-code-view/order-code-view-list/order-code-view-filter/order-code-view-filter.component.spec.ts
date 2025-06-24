import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OrderCodeViewFilterComponent} from './order-code-view-filter.component';
import {RailOrderCodeSearchService} from '../../service/rail-order-code-search.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { AppService } from '@src/app/app.service';
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';
import {ReactiveFormsModule} from '@angular/forms';
import {of} from 'rxjs';
import { LocationNamePipe } from '@src/app/shared/pipes/location-name.pipe';
import { SharedModule } from '@src/app/shared/shared.module';


describe('OrderCodeViewFilterComponent', () => {
    let component: OrderCodeViewFilterComponent;
    let fixture: ComponentFixture<OrderCodeViewFilterComponent>;
    let railOrderCodeSearchService: jasmine.SpyObj<RailOrderCodeSearchService>;

    beforeEach(async () => {
        const railOrderCodeSearchServiceSpy = jasmine.createSpyObj<RailOrderCodeSearchService>('RailOrderCodeSearchService', ['getRailOrderCodeList']);
        const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
        const appServiceSpy = jasmine.createSpyObj<AppService>('AppService', ['getSelectedCustomerProfiles']);
        const fileExportServiceSpy = jasmine.createSpyObj<FileExportService>('FileExportService', ['exportRailOrderCodesToCsv']);

        await TestBed.configureTestingModule({
            declarations: [OrderCodeViewFilterComponent],
            imports: [SharedModule,ReactiveFormsModule, TranslateModule.forRoot()],
            providers: [
                {provide: RailOrderCodeSearchService, useValue: railOrderCodeSearchServiceSpy},
                {provide: TranslateService, useValue: translateServiceSpy},
                {provide: AppService, useValue: appServiceSpy},
                {provide: FileExportService, useValue: fileExportServiceSpy}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(OrderCodeViewFilterComponent);
        component = fixture.componentInstance;
        railOrderCodeSearchService = TestBed.inject(RailOrderCodeSearchService) as jasmine.SpyObj<RailOrderCodeSearchService>;

        railOrderCodeSearchService.getRailOrderCodeList.and.returnValue(of({
            items: [],
            total: 0,
            offset: 0,
            limit: 10
        }));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form on ngOnInit', () => {
        component.ngOnInit();
        const form = component['filterForm']; // Accessing protected property indirectly
        expect(form).toBeDefined();
        expect(form.contains('templateNumber')).toBeTrue();
    });

    it('should call getRailOrderCodeList from service', () => {
        component['requestData'](); // Accessing protected method indirectly
        expect(railOrderCodeSearchService.getRailOrderCodeList).toHaveBeenCalled();
    });
});
