import { NgModule } from '@angular/core';
import { SideNavigationComponent } from './side-navigation.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SideNavigationComponent
  ],
  imports: [
    SharedModule,
    RouterModule
  ],
  exports: [
    SideNavigationComponent
  ]
})
export class SideNavigationModule {

}
