import { Pipe, PipeTransform } from "@angular/core";
import { InfrastructureLocationSummary } from "@src/app/order-management/components/wagon-view/models/api-wagon-list";

@Pipe({
  name: 'infrastructureLocationSummary'
})
export class InfrastructureLocationSummaryPipe implements PipeTransform {

  transform(infrastructureLocationSummary: InfrastructureLocationSummary): string {
    if(!infrastructureLocationSummary) {
      return null;
    }

    return `${infrastructureLocationSummary.name}`
  }
}
