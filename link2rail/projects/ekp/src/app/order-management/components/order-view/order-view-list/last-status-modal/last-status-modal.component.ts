import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { TranslateModule } from "@ngx-translate/core";
import { RailOrderSearchSummary } from "@src/app/trainorder/models/ApiRailOrder.model";
import { RailOrderStatusHistoryService } from "./service/rail-order-status-history.service";
import { RailOrderStatusHistory } from "./models/api-railorder-status-history";
import { SharedPipesModule } from "@src/app/shared/pipes/shared-pipes.module";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import the progress spinner module

@Component({
  selector: 'app-last-status-modal',
  standalone: true,
  imports: [CommonModule,
    MatDialogModule,
    TranslateModule,
    SharedPipesModule,
    MatProgressSpinnerModule // Include progress spinner module
  ],
  templateUrl: './last-status-modal.component.html',
  styleUrls: ['./last-status-modal.component.scss']
})
export class LastStatusModalComponent implements OnInit {

  protected railOrderSearchSummary: RailOrderSearchSummary;
  protected railOrderLastStatusHistory: RailOrderStatusHistory[];
  protected isDataLoaded = false;  // Flag to track data loading status
  protected isLoading = false;  // Flag to control the loading spinner visibility

  constructor(@Inject(MAT_DIALOG_DATA) public param: RailOrderSearchSummary,
    private dialogRef: MatDialogRef<LastStatusModalComponent>, private railOrderStatusHistoryService: RailOrderStatusHistoryService) {
    this.railOrderSearchSummary = param;
  }

  ngOnInit(): void {
    this.loadLastStatusHistory();
  }

  private loadLastStatusHistory(): void {
    this.isLoading = true;  // Show the loading spinner while fetching data

    if (this.railOrderSearchSummary?.orderId) {
      this.railOrderStatusHistoryService.getRailOrderStatusHistory(this.railOrderSearchSummary.orderId)
        .subscribe({
          next: (statusHistory: RailOrderStatusHistory[]) => {
            if (statusHistory.length > 0) {
               // Sort statuses by dateTime in descending order (latest first)
              statusHistory.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

              // Initialize a variable to track the latest statuses
              const latestStatuses: RailOrderStatusHistory[] = [];
              let previousStatus: string | null = null;

              // Iterate over sorted status history and only keep the most recent of each unique status
              statusHistory.forEach((status) => {
                if (status.railOrderStatus !== previousStatus) {
                  // Add the current status to the list and update the previousStatus
                  latestStatuses.push(status);
                  previousStatus = status.railOrderStatus;
                }
              });

              // Set the latest statuses as the result
              this.railOrderLastStatusHistory = latestStatuses;
              console.log(this.railOrderLastStatusHistory.length);
            }
            this.isLoading = false;  // Hide the spinner once data is fetched
            this.isDataLoaded = true;
          },
          error: (err) => {
            console.error("Error fetching rail order status history", err);
            this.isLoading = false;  // Hide the spinner in case of error
            this.isDataLoaded = true;  // Optionally handle errors gracefully
          }
        });
    } else {
      console.error("No orderId provided in RailOrderSearchSummary");
      this.isLoading = false;  // Hide the spinner if no orderId is provided
      this.isDataLoaded = true;
    }
  }


  protected closeDialog() {
    this.dialogRef.close();
  }

  protected getZabOrderNumber(): string {
    if (this.railOrderSearchSummary) {
      return String(this.railOrderSearchSummary.orderKey.orderNumber);
    }
    return '';
  }

  protected formatDate(dateTime: string | null | undefined): string {
    if (!dateTime || dateTime.trim() === "") {
      return "";
    }

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  }
}
