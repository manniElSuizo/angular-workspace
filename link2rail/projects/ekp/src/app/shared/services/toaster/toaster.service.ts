import { Injectable } from "@angular/core";

export const TOASTER_ELEMENT_ID = 'DEFAULT_TOASTER_ELEMENT_ID';

/**
 * Configuration for the toast service.
 * @param duration: The duration for which the toast message will be displayed.
 * @param dataType: The type of the toast message. It can be one of the following:
 * - 'informative'
 * - 'success'
 * - 'error'
 * - 'warning'
 * - 'alert'
 */
export interface ToasterConfig {
  duration?: number;
  dataType?: ToasterDataType;
}

export enum ToasterDataType {
  NONE = '',
  INFO = 'informative',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  ALERT = 'alert',
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  private toastMessageCount: number = 0;

  /**
   * 
   * @param message The message to show in toaster
   * @param toasterConfig: The configuration for the toaster
   * @see ToasterConfig
   */
  public addMessage(message: string, toasterConfig: ToasterConfig = null): void {
    if(this.toastMessageCount > 1000) {
      this.toastMessageCount = 0;
    }

    const uniqueToasterDivId = 'uniqueToasterDivId' + this.toastMessageCount;
    this.toastMessageCount++;

    const config = this.getConfig(toasterConfig);

    this.addToasterMarkup(message, config, uniqueToasterDivId);

    document.querySelector('#' + uniqueToasterDivId).classList.add('active');

    setTimeout(() => {
      const uniqueToastNode = document.querySelector('#' + uniqueToasterDivId);
      if (!uniqueToastNode) {
        return;
      }
      uniqueToastNode.classList.remove('active');
      setTimeout(() => document.querySelector('#' + uniqueToasterDivId).remove(), 1000);
    }, config.duration);
  }

  /**
   * Default toaster config values are defined here.
   */
  private getConfig(toasterConfig: ToasterConfig = null): ToasterConfig {
    return {
      duration: toasterConfig?.duration ? toasterConfig.duration : 3000,
      dataType: toasterConfig?.dataType ? toasterConfig.dataType : ToasterDataType.NONE,
    };
  }

  /**
   * Creates Html Node to append on the dom for showing the message.
   * @param message 
   * @param toasterConfig 
   * @param id 
   */
  private addToasterMarkup(message: string, toasterConfig: ToasterConfig, id: string): void {
    const notification = document.querySelector('#' + TOASTER_ELEMENT_ID);
    const toastNode = notification.cloneNode(true) as HTMLElement;
    toastNode.setAttribute('id', id);
    toastNode.style.display = 'block';
    toastNode.querySelector('p').innerHTML = message;

    // TODO: When styles for other message types (e.g. success, warning, error...) are defined, 
    // add style-attribute to the toastNode.
    // toastNode.setAttribute('arialive', toasterConfig.ariaLive);

    document.body.appendChild(toastNode);
    const width = Math.round(toastNode.offsetWidth / 2);
    toastNode.style.left = Math.round(window.innerWidth / 2) - width + 'px';
  }
}
