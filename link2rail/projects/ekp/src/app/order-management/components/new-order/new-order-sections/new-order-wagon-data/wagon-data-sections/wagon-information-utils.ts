import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { WagonInformation } from '@src/app/order-management/models/rail-order-api';

export class WagonInformationUtils {

    // Static function to get the total weight for goods
    static getGoodsWeight(wagonInformation: WagonInformation): number {
        if (wagonInformation?.goods) {
            return wagonInformation.goods.reduce((sum, good) => {
                return sum + (good.weight || 0);
            }, 0);
        }
        return 0;
    }

    // Static function to get the total weight for loading tackles
    static getLoadingTacklesWeight(wagonInformation: WagonInformation): number {
        if (wagonInformation && wagonInformation.loadingTackles) {
            return wagonInformation.loadingTackles.reduce((sum, tackle) => {
                return sum + (tackle.weight || 0);
            }, 0);
        }
        return 0;
    }

    // Static function to get the sum of goodWeight and loadingTacklesWeight
    static getTotalWeight(wagonInformation: WagonInformation): number {
        const goodsWeight = WagonInformationUtils.getGoodsWeight(wagonInformation);
        const loadingTacklesWeight = WagonInformationUtils.getLoadingTacklesWeight(wagonInformation);
        return goodsWeight + loadingTacklesWeight;
    }

    // Static function to check for duplicate permission numbers
    static checkForDuplicatePermissionNumbers(formGroup: FormGroup): void {
        const allPermissionNumbers: string[] = [];
        const duplicatePermissions: string[] = [];

        // First, set all permissionNumber errors to null (clear previous errors)
         const bzaControl = formGroup.get('bzaNumber') as FormControl;
         bzaControl.setErrors(null);

         const authorizationList = formGroup.get('authorizationList') as FormArray;
         authorizationList.controls.forEach((itemGroup: FormGroup) => {
             const permissionNumberControl = itemGroup.get('permissionNumber') as FormControl;
             permissionNumberControl.setErrors(null);  // Clear previous errors
         });

        // Collect all permissionNumbers in the FormArray
        
        authorizationList.controls.forEach((itemGroup: FormGroup) => {
            const permissionNumber = itemGroup.get('permissionNumber')?.value;
            if (permissionNumber) {
                allPermissionNumbers.push(permissionNumber);
            }
        });

        // Collect the BZA number if it exists
      
        const bzaNumber = bzaControl?.value;
        if (bzaNumber) {
            allPermissionNumbers.push(bzaNumber);
        }

        // Find duplicates
        const seen: Set<string> = new Set();
        allPermissionNumbers.forEach(permissionNumber => {
            if (seen.has(permissionNumber)) {
                duplicatePermissions.push(permissionNumber);
            } else {
                seen.add(permissionNumber);
            }
        });

        // Iterate over all permissionNumbers in the authorization list and mark duplicates with error
        authorizationList.controls.forEach((itemGroup: FormGroup) => {
            const permissionNumberControl = itemGroup.get('permissionNumber');
            const permissionNumber =permissionNumberControl?.value;
            permissionNumberControl?.setErrors(null);

            if (duplicatePermissions.includes(permissionNumber)) {
                itemGroup.get('permissionNumber')?.setErrors({ hasPermissionNumberDouble: true });
            }
        });

        // Check if the bzaNumber is in the duplicatePermissions and add an error if it is
        if (duplicatePermissions.includes(bzaNumber)) {
            bzaControl.setErrors({ hasPermissionNumberDouble: true });
        }
    }
}