import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {TemplateService} from './template.service';
import {EmptyWagonOrderTemplateService} from '../../api/generated/api/empty-wagon-order-template.service';
import {TemplateSummaryMappingService} from './template-summary-mapping.service';
import {TemplateSummaryRequestView, TemplateSummaryResponseView} from '../models/template-symmary-view';
import {TemplateSummaryRequest} from '../../api/generated/model/template-summary-request';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";

describe('TemplateService', () => {
    let service: TemplateService;
    let apiServiceSpy;
    let mapperSpy: jasmine.SpyObj<TemplateSummaryMappingService>;

    beforeEach(() => {
        const apiSpy = jasmine.createSpyObj('EmptyWagonOrderTemplateService', ['searchTemplates']);
        const mapperSpyObj = jasmine.createSpyObj('TemplateSummaryMappingService', ['toApiRequest', 'fromApiResponse']);

        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot({}),
                HttpClientTestingModule
            ],
            providers: [
                TemplateService,
                {provide: EmptyWagonOrderTemplateService, useValue: apiSpy},
                {provide: TemplateSummaryMappingService, useValue: mapperSpyObj}
            ]
        });

        service = TestBed.inject(TemplateService);
        apiServiceSpy = TestBed.inject(EmptyWagonOrderTemplateService) as jasmine.SpyObj<EmptyWagonOrderTemplateService>;
        mapperSpy = TestBed.inject(TemplateSummaryMappingService) as jasmine.SpyObj<TemplateSummaryMappingService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call mapper and apiService correctly in searchTemplates', () => {
        const requestView: TemplateSummaryRequestView = {offset: 0, limit: 10};
        const request: TemplateSummaryRequest = {offset: 0, limit: 10};
        const response: TemplateSummaryResponseView = {items: [], total: 0, offset: 0, limit: 10};

        mapperSpy.toApiRequest.and.returnValue(request);
        apiServiceSpy.searchTemplates.and.returnValue(of(response));
        mapperSpy.fromApiResponse.and.returnValue(response);

        service.searchTemplates(requestView).subscribe(res => {
            expect(res).toEqual(response);
        });

        expect(mapperSpy.toApiRequest).toHaveBeenCalledWith(requestView);
        expect(apiServiceSpy.searchTemplates).toHaveBeenCalledWith(request);
        expect(mapperSpy.fromApiResponse).toHaveBeenCalledWith(response);
    });
});