import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocaleComponent } from './locale.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LocaleComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    LocaleComponent
  ]        
})
export class LocaleModule {

}