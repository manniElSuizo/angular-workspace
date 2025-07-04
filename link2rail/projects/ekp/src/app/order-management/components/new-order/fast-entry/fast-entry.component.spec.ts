import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastEntryComponent } from './fast-entry.component';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { initialRailOrder } from '@src/app/order-management/models/rail-order-api';
import { HttpClientModule } from '@angular/common/http';

describe('FastEntryComponent', () => {
  let component: FastEntryComponent;
  let fixture: ComponentFixture<FastEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FastEntryComponent, TranslateModule.forRoot(), HttpClientModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {railOrder: initialRailOrder()} },
        { provide: MatDialogRef, useValue: {railOrder: initialRailOrder()} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FastEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
