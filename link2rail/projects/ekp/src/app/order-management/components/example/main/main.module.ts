import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { mainRoutes } from './main.routes';
import { MainComponent } from './main.component';
import { Section_1_Module } from '../sections/section-1/section-1.module';
import { Section_2_Module } from '../sections/section-2/section-2.module';
import { Section_3_Module } from '../sections/section-3/section-3.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    MainComponent 
  ],  
  imports: [    
    CommonModule,
    RouterModule.forChild(mainRoutes),
    Section_1_Module,
    Section_2_Module,
    Section_3_Module
  ]  
})
export class MainModule { 

}