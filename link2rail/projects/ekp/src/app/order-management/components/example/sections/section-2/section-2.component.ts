import { Component, Input } from "@angular/core";
import { SectionBase } from "../section.base";
import { ViewState } from "../../enums/viewstate.enum";

@Component({
  selector: 'app-section-2',
  templateUrl: './section-2.component.html',
  styleUrl: './section-2.component.scss'
})
export class Section_2_Component extends SectionBase {
  
  @Input() viewState: ViewState;
  
  protected ViewState = ViewState;
  
  constructor() {
    super();
  }

  public validate(): string[] {
    console.log('validate section 2');
    return [];
  } 
}