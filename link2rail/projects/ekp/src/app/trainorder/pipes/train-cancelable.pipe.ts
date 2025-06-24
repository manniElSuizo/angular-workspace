import { Pipe, PipeTransform } from '@angular/core';
import { TrainSummary } from '../models/ApiTrainsList.models';
import { ProductType } from '@src/app/shared/enums/train-types.enum';
import { Authorization } from '../models/authorization';
import { TrainConnectionElement } from '../models/ApiMonthViewResponse.model';

@Pipe({
  name: 'trainCancelable'
})
export class TrainCancelablePipe implements PipeTransform {

  transform(element: TrainSummary | TrainConnectionElement, ...args: unknown[]): boolean {
    if(!element.productType) {
      return false;
    }
    if(!element.cancelable) return false;
    if(element.productType == ProductType.REGULAR_TRAIN) {
      return element.authorization.includes(Authorization.CANCEL_TRAIN);
    }
    return element.authorization.includes(Authorization.CANCEL_SPECIAL_TRAIN);
  }

}
