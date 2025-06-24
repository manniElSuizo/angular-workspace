import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedPipesModule } from './pipes/shared-pipes.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DBUIElementsModule } from '@db-ui/ngx-elements-enterprise/dist/lib';
@NgModule({
    imports: [
        CommonModule,
        SharedPipesModule,
        DBUIElementsModule,        
        FormsModule,
        ReactiveFormsModule,
        TranslateModule
    ],
    exports: [
        CommonModule,
        TranslateModule,
        SharedPipesModule,
        FormsModule,
        ReactiveFormsModule,
        DBUIElementsModule
    ]
})
export class SharedModule {

}