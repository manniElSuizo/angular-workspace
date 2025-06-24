import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { firstValueFrom } from 'rxjs'; // Import for handling observables
import { ApiUrls } from "@src/app/shared/enums/api-urls.enum";
import { EnvService } from "@src/app/shared/services/env/env.service";
import { RailOrder } from '@src/app/order-management/models/rail-order-api';

@Injectable({
  providedIn: 'root'
})
export class RailOrderBillOfLadingService {
  private backendUrlOm: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.backendUrlOm = this.env?.backendUrlOm;
    if (!this.backendUrlOm) {
      console.info("No environment setting for backendUrlOm found!");
    }
  }

  public getRailOrderBillOfLading(orderId: number): Observable<Blob> {
    if (!this.backendUrlOm || !orderId) {
      console.error('Backend URL is not configured or orderId is missing.');
      throw new Error('Backend URL is not configured or orderId is missing');
    }

    const url = ApiUrls.RAIL_ORDERS_BILL_OF_LADING.replace('{orderId}', `${orderId}`);
    const uri = `${this.backendUrlOm}${url}`;

    return this.httpClient.get(uri, { responseType: 'blob' });
  }

  public postRailOrdersBillOfLoading(railOrder: RailOrder, error?: ((error: any) => void) | null, complete?: (() => void) | null): void {
    const url = `${this.backendUrlOm}${ApiUrls.RAIL_ORDERS_CURRENT_BILL_OF_LADING}`;
    this.httpClient.post<Blob>(url, railOrder, { responseType: 'blob' as 'json' }).subscribe({
      next: (blob: Blob) => {
        if (blob && blob.size > 0) {
          // Check if the Blob is valid (not empty)
          const fileURL = URL.createObjectURL(blob);

          // Open the Blob URL in a new tab
          const newWindow = window.open(fileURL, '_blank');
          if (!newWindow) {
            console.error('Failed to open the document in a new tab. Please check browser settings.');
          }
        } else {
          console.error('Received empty Blob for Bill of Lading');
          // Optionally, handle empty response or show user-friendly message
        }
      },
      error: error,
      complete: complete
    });
  }

  public getOrderCodeBillOfLading(templateNumber: string): Observable<Blob> {
    if (!this.backendUrlOm || !templateNumber) {
      console.error('Backend URL is not configured or orderId is missing.');
      throw new Error('Backend URL is not configured or orderId is missing');
    }

    const url = ApiUrls.ORDERCODE_BILL_OF_LADING.replace('{templateNumber}', `${templateNumber}`);
    const uri = `${this.backendUrlOm}${url}`;

    return this.httpClient.get(uri, { responseType: 'blob' });
  }

  public async downloadBillOfLading(orderId: number): Promise<void> {
    try {
      const blob = await firstValueFrom(this.getRailOrderBillOfLading(orderId)); // Converts observable to a promise
      const fileURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = `RailOrder_BillOfLading_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileURL); // Clean up memory
    } catch (error) {
      console.error('Download failed', error);
    }
  }
}
