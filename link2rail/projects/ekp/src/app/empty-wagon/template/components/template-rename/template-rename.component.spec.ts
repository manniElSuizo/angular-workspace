import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TemplateRenameComponent} from './template-rename.component';
import {TemplateService} from '../../services/template.service';
import {ErrorDialogService} from '../../../../shared/error-handler/service/api-error-dialog.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {of, throwError} from 'rxjs';
import {TranslateModule} from "@ngx-translate/core";

describe('TemplateRenameComponent', () => {
    let component: TemplateRenameComponent;
    let fixture: ComponentFixture<TemplateRenameComponent>;
    let templateServiceMock: any;
    let errorDialogServiceMock: any;
    let dialogRefMock: any;

    beforeEach(async () => {
        templateServiceMock = jasmine.createSpyObj('TemplateService', ['updateCustomerTemplateName']);
        errorDialogServiceMock = jasmine.createSpyObj('ErrorDialogService', ['openApiErrorDialog']);
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, TemplateRenameComponent, TranslateModule.forRoot()],
            providers: [
                {provide: TemplateService, useValue: templateServiceMock},
                {provide: ErrorDialogService, useValue: errorDialogServiceMock},
                {provide: MatDialogRef, useValue: dialogRefMock},
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {templateName: 'Test Template', customerTemplateName: 'Customer Template'}
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TemplateRenameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with customerTemplateName', () => {
        expect(component.customerTemplateNameControl.value).toBe('Customer Template');
    });

    it('should call updateCustomerTemplateName on submit', () => {
        templateServiceMock.updateCustomerTemplateName.and.returnValue(of({}));
        component.submit();
        expect(templateServiceMock.updateCustomerTemplateName)
            .toHaveBeenCalledWith('Test Template', 'Customer Template');
        expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should handle error on submit', () => {
        const error = new Error('Error');
        templateServiceMock.updateCustomerTemplateName.and.returnValue(throwError(() => error));
        component.submit();
        expect(dialogRefMock.close).toHaveBeenCalledWith(false);
        expect(errorDialogServiceMock.openApiErrorDialog).toHaveBeenCalledWith(error);
    });
});
