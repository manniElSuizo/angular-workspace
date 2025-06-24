import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrderWagonDetailDialogComponent } from './new-order-wagon-detail-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('NewOrderWagonDetailDialogComponent', () => {
  let component: NewOrderWagonDetailDialogComponent;
  let fixture: ComponentFixture<NewOrderWagonDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewOrderWagonDetailDialogComponent],
      imports: [MatDialogModule, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { railOrder: {wagonInformation: [{}]}, idx: 0 }},
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewOrderWagonDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
