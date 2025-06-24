import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ListViewComponent} from './list-view.component';
import {TranslateModule} from '@ngx-translate/core';
import {HttpClientModule} from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';
import {ListViewFilterComponent} from './list-view-filter/list-view-filter.component';
import {LOCALE_ID, NO_ERRORS_SCHEMA} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { SharedPipesModule } from '@src/app/shared/pipes/shared-pipes.module';

describe('ListViewComponent', () => {
    let component: ListViewComponent;
    let fixture: ComponentFixture<ListViewComponent>;

    beforeEach(async () => {
        registerLocaleData(localeDe);
        await TestBed.configureTestingModule({
            declarations: [ListViewComponent, ListViewFilterComponent],
            imports: [
                HttpClientModule,
                TranslateModule.forRoot(),
                MatDialogModule,
                FormsModule,
                ReactiveFormsModule,
                SharedPipesModule
            ],
            providers: [
                ModalWindows,
                {provide: LOCALE_ID, useValue: 'de-DE'}
            ],
            schemas: [NO_ERRORS_SCHEMA],
        })
                     .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });
});
