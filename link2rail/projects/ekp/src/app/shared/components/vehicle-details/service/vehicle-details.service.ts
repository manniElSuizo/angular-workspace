import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { VehicleByVehicleNumberRequest, Vehicle } from '../models/vehicle-details.model';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { ApiUrls } from '@src/app/shared/enums/api-urls.enum';
import { ApiVehicleDetailsMocks } from '../mockup/APIVehicleDetailsMocks';

@Injectable({
  providedIn: 'root'
})
export class VehicleDetailsService {

  private backendUrl: string;

  constructor(
    private httpClient: HttpClient,
    private env: EnvService
  ) {
    this.backendUrl = this.env?.backendUrlTnt;
    if (!this.backendUrl) {
      console.info("No environment setting for backendUrl found!");
    }
  }
  private httpHeaders = {
    headers: new HttpHeaders({
      'Requested-By': 'TM-Web-Frontend'
    })
  }
  public getVehicleDataByVehicleNumber(request: VehicleByVehicleNumberRequest): Observable<Vehicle> {

    if (!this.backendUrl) {
      console.warn('Backend URL is not configured. Using mock data.');
      return this.getVehicleByVehicleNumberResponseMock(request);
    }
    const url = ApiUrls.VEHICLE.replace('{vehicleNumber}', `${request.VehicleNumber}`)
    const uri = this.backendUrl + url;
    return this.httpClient.get<Vehicle>(uri, this.httpHeaders);

  }

  private getVehicleByVehicleNumberResponseMock(request: VehicleByVehicleNumberRequest): Observable<Vehicle> {
    console.log('Mock request:', request);
    const mockResponse = new ApiVehicleDetailsMocks().getStaticVehicleDataResponse();
    return of(mockResponse).pipe(delay(2000));
  }
}
