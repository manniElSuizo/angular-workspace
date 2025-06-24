import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WagonInformationComponent } from './wagon-information.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { initialRailOrder } from '@src/app/order-management/models/rail-order-api';

describe('WagonInformationComponent', () => {
  let component: WagonInformationComponent;
  let fixture: ComponentFixture<WagonInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WagonInformationComponent, HttpClientModule, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WagonInformationComponent);
    component = fixture.componentInstance;
    component.fastEntryForm = new FormGroup({numberOfWagons: new FormControl()});
    component.railOrder = initialRailOrder();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
