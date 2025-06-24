import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  public showSpinner: boolean = false;
  protected position: string = 'fixed';

  public configure(htmlElement: HTMLElement = null): void {
    if(htmlElement) {
      this.position = 'absolute';
    }
  }
}
