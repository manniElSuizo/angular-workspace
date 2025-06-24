import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RailOrderCancellationComponent } from './rail-order-cancellation.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

describe('RailOrderCancellationComponent', () => {
  let component: RailOrderCancellationComponent;
  let fixture: ComponentFixture<RailOrderCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RailOrderCancellationComponent, HttpClientModule, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {orderKey: {orderId: 1, orderNumber: '1'}, orderId: 1} },
        { provide: MatDialogRef, useValue: {orderKey: {orderId: 1, orderNumber: '1'}, orderId: 1} },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RailOrderCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
