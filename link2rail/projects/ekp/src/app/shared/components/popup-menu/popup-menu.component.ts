import { Component, HostBinding, HostListener, Input } from '@angular/core';
 
@Component({
  selector: 'app-popup-menu',
  templateUrl: './popup-menu.component.html',
  styleUrls: ['./popup-menu.component.scss']
})
export class PopupMenuComponent {
  @HostBinding("style.top") y = "0px"
  @HostBinding("style.left") x = "0px"
  @HostBinding("style.visibility") visibility = "hidden"
  @Input() @HostBinding("style.width") width = "200px"
 
  open(e:MouseEvent) {
    this.x = `${e.pageX-200}px`
    this.y = `${e.pageY-75}px`
 
    this.visibility = "visible"
 
    e.stopPropagation()
  }
 
  close() {
    this.visibility = "hidden"
  }
 
  @HostListener('document:click')
  public onDocumentClick() {
    if (this.visibility === "visible") {
      this.close()
    }
  }
}