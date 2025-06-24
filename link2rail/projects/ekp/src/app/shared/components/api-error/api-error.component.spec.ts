import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ModalWindows } from '../modal-windows/modal-windows';

import { ErrorDialogComponent } from './api-error.component';
import { ErrorData } from './ErrorData';
import { TranslateModule } from '@ngx-translate/core';

describe('ApiErrorComponent', () => {
  let component: ErrorDialogComponent;
  let fixture: ComponentFixture<ErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, TranslateModule.forRoot()],
      providers: [ModalWindows,
        {provide: MatDialogRef, useValue: errorData},
        {provide: MAT_DIALOG_DATA, useValue: errorData}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

export const errorData: ErrorData = {

}