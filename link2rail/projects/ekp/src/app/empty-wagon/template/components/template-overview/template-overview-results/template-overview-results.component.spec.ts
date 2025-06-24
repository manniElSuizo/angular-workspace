import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateOverviewResultsComponent } from './template-overview-results.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { OrderDialogService } from '../../../../order/services/order-dialog.service';
import { of } from 'rxjs';
import { OrderAction } from '@src/app/empty-wagon/order/components/order-creation/order-creation.component';

// Mock Services
class MockPermissionService {}
class MockOrderDialogService {
  openOrderCreationDialog(action: OrderAction, templateName: string) {
    return of({}); // mock return
  }
}

describe('TemplateOverviewResultsComponent', () => {
  let component: TemplateOverviewResultsComponent;
  let fixture: ComponentFixture<TemplateOverviewResultsComponent>;
  let orderDialogService: MockOrderDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatDialogModule], // Include necessary imports
      declarations: [TemplateOverviewResultsComponent],
      providers: [
        { provide: PermissionService, useClass: MockPermissionService },
        { provide: OrderDialogService, useClass: MockOrderDialogService },
        TranslateService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateOverviewResultsComponent);
    component = fixture.componentInstance;
    orderDialogService = TestBed.inject(OrderDialogService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // This test checks if the component is created successfully.
    expect(component).toBeTruthy();  // Verifies that the component is initialized properly
  });

  it('should open dialog when createOrder is called', () => {
    const templateName = 'Test Template';
    spyOn(orderDialogService, 'openOrderCreationDialog').and.returnValue(of({})); // Mocking dialog open

    component.createOrder(templateName);

    expect(orderDialogService.openOrderCreationDialog).toHaveBeenCalledWith(OrderAction.CREATE, templateName);
  });

  it('should open dialog when viewTemplate is called', () => {
    const templateName = 'Test Template';
    spyOn(orderDialogService, 'openOrderCreationDialog').and.returnValue(of({})); // Mocking dialog open

    component.viewTemplate(templateName);

    expect(orderDialogService.openOrderCreationDialog).toHaveBeenCalledWith(OrderAction.VIEW, templateName);
  });

  it('should toggle sorting criteria correctly when clicking on sort field', () => {
    const fieldName = 'templateName';
    component.sortConditions = [{ asc: true, field: 'templateName' }];

    component.onClickSortField(fieldName);

    expect(component.sortConditions.length).toBe(1);
    expect(component.sortConditions[0].field).toBe('templateName');
    expect(component.sortConditions[0].asc).toBe(false); // Toggled from true to false
  });
});
