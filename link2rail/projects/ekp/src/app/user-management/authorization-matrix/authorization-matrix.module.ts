import { NgModule } from '@angular/core';
import { AuthorizationMatrixRoutingModule } from './authorization-matrix-routing.module';
import { AuthorizationMatrixComponent } from './authorization-matrix.component';
import { AuthorizationMatrixService } from './authorization-matrix.service';
import { SharedModule } from '@src/app/shared/shared.module';

@NgModule({
  declarations: [
    AuthorizationMatrixComponent,
  ],
  imports: [
    SharedModule,
    AuthorizationMatrixRoutingModule,
  ],
  providers: [
    AuthorizationMatrixService,
  ]
})
export class AuthorizationMatrixModule { }
