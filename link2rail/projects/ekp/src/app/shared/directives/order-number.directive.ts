import { Directive, ElementRef, HostListener, OnInit } from "@angular/core";
import { OrderNumberPipe } from "../pipes/order-number.pipe";

@Directive({ selector: "[orderNumberFormatter]" })
export class OrderNumberFormatterDirective implements OnInit {

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private orderNumberPipe: OrderNumberPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.value = this.orderNumberPipe.transform(this.el.value);
  }

  // @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
    this.el.value = this.orderNumberPipe.parse(value);
  }

  @HostListener("input", ["$event.target.value"])
  onInput(value) {
    this.el.value = this.orderNumberPipe.transform(value);
  }
}