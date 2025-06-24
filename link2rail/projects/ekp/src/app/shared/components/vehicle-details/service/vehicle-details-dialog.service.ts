import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Vehicle, VehicleByVehicleNumberRequest } from '../models/vehicle-details.model';
import { VehicleDetailsService } from './vehicle-details.service';
import { VehicleDetailsComponent } from '../vehicle-details.component';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VehicleDetailsDialogService implements OnDestroy {
  vehicleNumber: string;
  private destroy$ = new Subject<void>();

  constructor(
    private vehicleDetailsService: VehicleDetailsService,
    private dialog: MatDialog // Inject MatDialog here
  ) { }
  
  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  
  showVehicleDetalsDialog(vehicleNumber: string): void {
    this.getVehicleDetails(vehicleNumber).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        this.openModalWindow(VehicleDetailsComponent, {
          vehicleDetails: result
        });
      },
      error: e => {
        console.log("e", e);
        if(e instanceof HttpErrorResponse && e.status == HttpStatusCode.NotFound) {
          this.openModalWindow(VehicleDetailsComponent, {
            vehicleDetails: undefined,
            vehicleNumber: vehicleNumber
          });
        }
      }
    });
  }

  private getVehicleDetails(wagonNumber: string): Observable<Vehicle> {
    const vehicleByVehicleNumberRequest: VehicleByVehicleNumberRequest = {
      VehicleNumber: wagonNumber
    };
    return this.vehicleDetailsService.getVehicleDataByVehicleNumber(vehicleByVehicleNumberRequest);
  }

  private openModalWindow(component: any, data: any): void {
    const  ref = this.dialog.open(component, {
      data: data,
      width: '1000px',  // Adjust the width as needed
      height: '1000px',
      //minHeight: '50vh',
      maxHeight: '80vh', // Ensure dialog height doesn't exceed viewport height
      disableClose: true,  // Prevent closing the modal by clicking outside
    });
    ref.afterClosed().subscribe(result => {console.log(result)})
  }

}