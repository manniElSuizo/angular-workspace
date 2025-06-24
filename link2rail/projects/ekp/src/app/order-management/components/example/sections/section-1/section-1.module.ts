import { NgModule } from '@angular/core';
import { Section_1_Component } from './section-1.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    Section_1_Component 
  ],
  exports: [
    Section_1_Component 
  ],
  imports: [
    CommonModule
  ]
})
export class Section_1_Module { 

}