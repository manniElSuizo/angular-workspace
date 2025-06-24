import { Pipe, PipeTransform } from '@angular/core';
import { CommercialLocationSummary } from "../../order-management/models/om-internal-api";

export enum LocationNameOutputFormat {
  Name = 'name',
  Code = 'code',
  NameCode = 'nameAndCode',
  Authority = 'authority'
}

/**
 * Pipe to format location names based on the provided location object and output format.
 */
@Pipe({
  name: 'locationName'
})
export class LocationNamePipe implements PipeTransform {

  transform(
    commercialLocationSummary?: CommercialLocationSummary,
    outputFormat: LocationNameOutputFormat = LocationNameOutputFormat.NameCode
  ): string {
    if (!commercialLocationSummary) return '';

    const locationName = commercialLocationSummary.locationName || '';
    const locationCode = commercialLocationSummary.locationCode || '';
    const authority = commercialLocationSummary.authority || '';

    switch (outputFormat) {
      case LocationNameOutputFormat.Name:
        return locationName;

      case LocationNameOutputFormat.Code:
        return locationCode;

      case LocationNameOutputFormat.Authority:
        return String(authority);

      case LocationNameOutputFormat.NameCode:
      default:
        return locationCode ? `${locationName} (${locationCode})` : locationName;
    }
  }
}
