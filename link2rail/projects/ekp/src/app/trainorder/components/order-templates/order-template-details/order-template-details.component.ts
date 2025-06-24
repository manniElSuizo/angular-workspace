import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Border, BorderResponse, CommercialService, CommercialServiceResponse, WorkingDirection, WorkingDirectionsResponse } from '@src/app/trainorder/models/ApiModels';
import { OrderTemplate, OrderTemplateResponse } from '@src/app/trainorder/models/OrderTemplateModels';
import { SharedModule } from '@src/app/shared/shared.module';
import { TrainorderPipesModule } from '@src/app/trainorder/pipes/trainorder-pipes.module';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
@Component({
  selector: 'app-order-template-details',
  templateUrl: './order-template-details.component.html',
  styleUrls: ['./order-template-details.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    TrainorderPipesModule,
    MatDialogModule
  ]
})
export class OrderTemplateDetailsComponent implements OnInit {
  protected templateId: string;
  protected orderTemplate: OrderTemplate;
  protected borderStations: Border[];
  protected commercialServiceStr: string = '';
  protected workDirectionSendStr: string = ''
  protected workDirectionReceiveStr: string = ''

  constructor(@Inject(MAT_DIALOG_DATA) public param: { templateId: string }, private trainorderService: TrainorderService) {
    this.templateId = param.templateId;
  }

  ngOnInit(): void {
    this.trainorderService.getOrderTemplate(this.templateId).subscribe({
      next: ( (resp: OrderTemplateResponse) => {
        this.orderTemplate = resp.orderTemplate;
        // Border Station
        if (this.orderTemplate.borderStation && this.orderTemplate.borderStation.length > 0) {
          this.trainorderService.getBorders(this.orderTemplate.borderStation[0]).subscribe({
            next: ( (result: BorderResponse) => {
              this.borderStations = result;
            }),
            error: (error => {
              console.error('Failed to fetch data: ', error);
            })
          });
        }

        // Commercial Service
        if (this.orderTemplate.commercialService) {
          this.trainorderService.getCommercialServices().subscribe({
            next: ( (result: CommercialServiceResponse) => {
              result.forEach((cs: CommercialService) => {
                if (cs.code == this.orderTemplate.commercialService) {
                  this.commercialServiceStr = "(" + cs.code + ") " + cs.name;
                }
              });
            }),
            error: (error => {
              console.error('Failed to fetch data: ', error);
            })
          });
        }

        // working directions
        if (this.orderTemplate.workDirectionReceive || this.orderTemplate.workDirectionSend) {
          this.trainorderService.getWorkingDirections().subscribe({
            next: ( (result: WorkingDirectionsResponse) => {
              result.forEach((wd: WorkingDirection) => {
                if (wd.code === this.orderTemplate.workDirectionReceive) {
                  this.workDirectionReceiveStr = "(" + wd.code + ") " + wd.name;
                } else if (wd.code == this.orderTemplate.workDirectionSend) {
                  this.workDirectionSendStr = "(" + wd.code + ") " + wd.name;
                }
              });
            }),
            error: (error => {
              console.error('Failed to fetch data: ', error);
            })
          });
        }
      }),
      error: (error => {
        console.error('Failed to fetch data: ', error);
      })
    });
  }
}
