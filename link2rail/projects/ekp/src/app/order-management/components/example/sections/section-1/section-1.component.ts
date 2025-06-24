import { Component, Injector, Input } from "@angular/core";
import { SectionBase } from "../section.base";
import { ViewState } from "../../enums/viewstate.enum";
import { ExampleModel } from "../../models/example.model";
import { MainComponent } from "../../main/main.component";

@Component({
  selector: 'app-section-1',
  templateUrl: './section-1.component.html',
  styleUrl: './section-1.component.scss'
})
export class Section_1_Component extends SectionBase {
  
  @Input() viewState: ViewState;
  @Input() order: ExampleModel;
    
  protected ViewState = ViewState;
  protected parent: MainComponent;

  constructor(private injector: Injector) { 
    super();
    this.parent = this.injector.get<MainComponent>(MainComponent);      
  }

  public onChangeOrder(): void {
    this.order.id = 100;
    this.parent.changeOrder(this.order);
  }

  public validate(): string[] {
    console.log('validate section 1');
    return [];
  }  
}