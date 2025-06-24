import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, inject, OnDestroy, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SystemInformationComponent } from '@src/app/system-information/system-information.component';
import { RailOrderDialogService } from '@src/app/order-management/components/new-order/service/railorder-order-dialog.service';

@Component({
  selector: 'app-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnDestroy, AfterViewInit {
  subscription: Subscription = new Subscription();
  @Output() closeMenu: EventEmitter<any> = new EventEmitter();

  protected isAdmin = true;
  protected isInternal = false;
  protected authorization = Authorization;

  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor(private elemRef: ElementRef, private router: Router, public permissionService: PermissionService,  private dialog: MatDialog, public newOrderDialogService:RailOrderDialogService ) {
    // Close the menu on navigation to any page
    this.subscription.add(
      this.router.events.subscribe(res => {
        if (res instanceof NavigationEnd) {
          this.emitCloseMenu();
        }
      })
    );
  }

  ngAfterViewInit(): void {
      document.querySelectorAll<HTMLInputElement>('.expand-more').forEach(el => el.checked = true);
      this.permissionService.isAdmin().subscribe({
        next: permission => {
          this.isAdmin = permission;
        }
      });
      this.permissionService.isInternalUser().subscribe({
        next: permission => {
          this.isInternal = permission;
        }
      });
      this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Closes the menu
  emitCloseMenu(): void {
    this.closeMenu.emit();
  }

  // Close menu when clicked outside of it
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(!this.elemRef.nativeElement.contains(event.target)) {
      this.emitCloseMenu();
    }
  }

  openSystemInformationModal(): void {
    this.emitCloseMenu();
    let config: MatDialogConfig = { maxWidth: '90vw', maxHeight: '90vh', width: '100%', height: '100%' };
    this.openDialog(SystemInformationComponent, config);

  }

  private openDialog<T>(comp: new (...args: any[]) => T, config: any): void {
    this.dialog.open(comp, config);
  }

  protected openPopupNewOrderDetails() {
    this.newOrderDialogService.showNewOrderDialog(null);
  }

}
