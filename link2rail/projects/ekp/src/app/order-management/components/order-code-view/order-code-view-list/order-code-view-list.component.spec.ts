import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCodeViewListComponent } from './order-code-view-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { PermissionService } from '@src/app/shared/permission/PermissionService';

describe('OrderCodeViewListComponent', () => {
  let component: OrderCodeViewListComponent;
  let fixture: ComponentFixture<OrderCodeViewListComponent>;
  let permissionService: jasmine.SpyObj<PermissionService>;

  beforeEach(async () => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    await TestBed.configureTestingModule({
      declarations: [OrderCodeViewListComponent],
      imports: [TranslateModule.forRoot(), HttpClientModule, MatDialogModule],
      providers: [ModalWindows, {provide: PermissionService, useValue: permissionServiceSpy}],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    permissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;

    fixture = TestBed.createComponent(OrderCodeViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
