import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthorizationListComponent } from './authorization-list.component';

@NgModule({
  declarations: [
    AuthorizationListComponent
  ],
  imports: [
    ReactiveFormsModule, 
    SharedModule
  ],
  exports: [
    AuthorizationListComponent
  ]
})
export class AuthorizationListModule { }