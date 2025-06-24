import { NgModule } from '@angular/core';
import { ProfileListRoutingModule } from './profile-list-routing.module';
import { ProfileListComponent } from './profile-list.component';
import { ProfileListService } from './profile-list.service';
import { SharedModule } from '@src/app/shared/shared.module';

@NgModule({
  declarations: [
    ProfileListComponent,
  ],
  imports: [
    SharedModule,
    ProfileListRoutingModule,
  ],
  providers: [
    ProfileListService,
  ]
})
export class ProfileListModule { }
