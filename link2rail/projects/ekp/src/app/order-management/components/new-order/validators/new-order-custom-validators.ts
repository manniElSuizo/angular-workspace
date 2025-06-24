import { FormGroup } from "@angular/forms";


export function isNationalTransport(group: FormGroup): boolean {
    const pickupCountry = String(group.get('pickupDelivery').get('pickupCountry')?.value);
    const deliveryCountry = String(group.get('pickupDelivery').get('deliveryCountry')?.value);
    return pickupCountry == '80' && deliveryCountry == '80';
};

export function isMultiNationalTransport(group: FormGroup): boolean {
    const pickupCountry = String(group.get('pickupDelivery').get('pickupCountry')?.value);
    const deliveryCountry = String(group.get('pickupDelivery').get('deliveryCountry')?.value);
    return pickupCountry !== '80' && deliveryCountry !== '80';
};

export function isInterNationalTransport(group: FormGroup): boolean {
    const pickupCountry = String(group.get('pickupDelivery').get('pickupCountry')?.value);
    const deliveryCountry = String(group.get('pickupDelivery').get('deliveryCountry')?.value);
    return pickupCountry !== '80' || deliveryCountry !== '80';
};