import { OnDestroy } from '@angular/core';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';

export function AutoUnsubscribe(constructor: any) {
  // Get a reference to the original ngOnDestroy function of the component/service
  const original = constructor.prototype.ngOnDestroy;

  // Override the ngOnDestroy function of the component/service
  constructor.prototype.ngOnDestroy = function () {
    // Loop through all properties of the component/service
    for (const prop in this) {
      const property = this[prop];
      // Check if the property is a subscription
      if (property && typeof property.closed != 'undefined') {
        // console.log("prop", prop);
        // console.log("class", property.constructor.name);
        // console.log("closed", property.closed);
        if (property.closed === false) {
          if (property instanceof SafeSubscriber) {
            // console.log("class is SafeSubscriber", prop);
            // Call the unsubscribe function to unsubscribe from the subscription
            property.complete();
            // console.log("closed in SafeSubscriber", property.closed);
          } else
            if (typeof property.unsubscribe === 'function') {
              // Call the unsubscribe function to unsubscribe from the subscription
              property.unsubscribe();
              // console.log("closed", property.closed);
            }
        }
      }
    }

    original?.apply(this, arguments);
  };
}