import { Component, Input } from "@angular/core";
import { SectionBase } from "../section.base";
import { ViewState } from "../../enums/viewstate.enum";

@Component({
  selector: 'app-section-3',
  templateUrl: './section-3.component.html',
  styleUrl: './section-3.component.scss'
})
export class Section_3_Component extends SectionBase {
  
  @Input() viewState: ViewState;
  
  protected ViewState = ViewState;
  
  constructor() {
    super();
  }

  public validate(): string[] {
    console.log('validate section 3');
    return ['ERR_1', 'ERR_2', 'ERR_3'];
  }  
}