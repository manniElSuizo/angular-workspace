import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

import { CustomerSelectComponent } from '@src/app/shared/components/customer-select/customer-select.component';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { PermissionService } from '../../permission/PermissionService';
import { AuthService, CARGO_AUTH_CONFIG } from '../../auth/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @ViewChild('customer_select', { static: false }) customerSelection!: CustomerSelectComponent;
  protected selectedMenuItem: string | null = null;
  public isMenuOpened: boolean = false;
  protected nickname: string;
  protected showCustomerSelect: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected logoutUri = CARGO_AUTH_CONFIG.logoutUri;

  private authService: AuthService = inject(AuthService);

  constructor(
    private storageService: LocalStorageService,
    private router: Router,
    protected permissionService: PermissionService
  ) { }

  ngOnInit() {
    this.permissionService.permissionLoad().subscribe({
      next: (b) => this.nickname = this.storageService.getUsername()
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Update customer select visibility based on the URL
        if(event.url.startsWith('/gzp/') || (event.urlAfterRedirects && event.urlAfterRedirects.startsWith('/gzp/'))) {
          this.showCustomerSelect.next(true);
        } else {
          this.showCustomerSelect.next(false);
        }
      });
  }

  public closeMenu(): void {
    this.isMenuOpened = false;
  }

  protected isLoggedIn(): boolean {
    return !!this.nickname;
  }

  getNickName(): string {
    if(sessionStorage.getItem("customUsername") && sessionStorage.getItem("customUsername") != this.nickname) {
      return sessionStorage.getItem("customUsername") + " (" + this.nickname + ")";
    }

    return this.nickname;
  }
}
