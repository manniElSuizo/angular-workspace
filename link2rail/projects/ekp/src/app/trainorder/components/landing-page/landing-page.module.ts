import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { LandingPageComponent } from "./landing-page.component";
import { landingPageRoutes } from "./landing-page.routes";
import { SharedModule } from "@src/app/shared/shared.module";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    LandingPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(landingPageRoutes),
    SharedModule
  ]
})
export class LandingPageModule {

}
