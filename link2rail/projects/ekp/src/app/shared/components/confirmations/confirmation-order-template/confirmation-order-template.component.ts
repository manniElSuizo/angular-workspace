import { Component } from '@angular/core';
import { ModalWindows } from '../../modal-windows/modal-windows';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation-order-template',
  templateUrl: './confirmation-order-template.component.html',
  styleUrls: ['./confirmation-order-template.component.scss'],
      standalone: true,
      imports: [TranslateModule]
})
export class ConfirmationOrderTemplateComponent {

  constructor(
    private modalWindows: ModalWindows
    ){

}

closeModals(){
    this.modalWindows.closeAllModalWindows();
}
}
