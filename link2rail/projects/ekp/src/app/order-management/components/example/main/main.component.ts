import { Component, ViewChild } from "@angular/core";
import { ViewState } from "../enums/viewstate.enum";
import { Section_1_Component } from "../sections/section-1/section-1.component";
import { emptyModel, ExampleModel } from "../models/example.model";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  @ViewChild('section_1', { static: false }) section_1!: Section_1_Component;
  @ViewChild('section_2', { static: false }) section_2!: Section_1_Component;
  @ViewChild('section_3', { static: false }) section_3!: Section_1_Component;

  protected order: ExampleModel;

  protected viewState: ViewState = ViewState.SECTION_1;
  protected ViewState = ViewState;

  constructor() {
    this.order = emptyModel();
    //console.log(this.order);
  }

  public changeOrder(order: ExampleModel): void {
    //console.log(order);
  }

  public setSection(selectedViewState: ViewState): void {
    this.viewState = selectedViewState;
  }

  public validate(): boolean {
    let section_1_result = this.section_1.validate();
    if (section_1_result?.length > 0) {
      //console.log(section_1_result);
      return false;
    }
    let section_2_result = this.section_2.validate();
    if (section_2_result?.length > 0) {
      console.log(section_2_result);
      return false;
    }
    let section_3_result = this.section_3.validate();
    if (section_3_result?.length > 0) {
      //console.log(section_3_result);
      return false;
    }
    return true;
  }
}