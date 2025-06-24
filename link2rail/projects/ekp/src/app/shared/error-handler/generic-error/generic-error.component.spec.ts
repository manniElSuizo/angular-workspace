import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericErrorComponent } from './generic-error.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('GenericErrorComponent', () => {
  let component: GenericErrorComponent;
  let fixture: ComponentFixture<GenericErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericErrorComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenericErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
