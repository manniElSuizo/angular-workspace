import {
  Injectable,
  ComponentRef,
  ApplicationRef,
  createComponent,
  EmbeddedViewRef
} from '@angular/core';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerService {
  constructor(private appRef: ApplicationRef) { }
  private loadingSpinner: ComponentRef<LoadingSpinnerComponent> = null;
  private element: HTMLElement = document.body;

  public startLoading(htmlElement: HTMLElement = null): void {
    if(htmlElement) {
      this.element = htmlElement;
    }
    if(!this.loadingSpinner) {
      this.loadingSpinner = createComponent(LoadingSpinnerComponent, {environmentInjector: this.appRef.injector});
      this.loadingSpinner.instance.configure(htmlElement);
      this.appRef.attachView(this.loadingSpinner.hostView);
      this.element.append(
        (<EmbeddedViewRef<any>>this.loadingSpinner.hostView).rootNodes[0]
      );
      this.loadingSpinner.instance.showSpinner = true;
    }
  }

  public stopLoading(): void {
    this.loadingSpinner.instance.showSpinner = false;
    this.appRef.detachView(this.loadingSpinner.hostView);
    this.loadingSpinner.destroy();
    this.loadingSpinner = null;
  }
}
