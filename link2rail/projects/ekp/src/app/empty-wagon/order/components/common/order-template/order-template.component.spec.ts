import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TranslateModule} from "@ngx-translate/core";
import {OrderTemplateComponent} from "./order-template.component";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TemplateService} from "../../../../template/services/template.service";

describe('OrderTemplateComponent', () => {
    let component: OrderTemplateComponent;
    let fixture: ComponentFixture<OrderTemplateComponent>;
    let templateService;

    beforeEach(async () => {
        templateService = jasmine.createSpyObj('TemplateService', ['searchTemplates']);
        await TestBed.configureTestingModule({
            imports: [

                TranslateModule.forRoot({}),
                HttpClientTestingModule
            ],
            providers: [
                {provide: TemplateService, useValue: templateService}
            ]
        })
                     .compileComponents();

        fixture = TestBed.createComponent(OrderTemplateComponent);
        component = fixture.componentInstance;
        component.ngOnChanges();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});