import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { GoodModel } from '@src/app/trainorder/models/Cargo.model';
import { SharedModule } from '@src/app/shared/shared.module';
import { TrainorderPipesModule } from '@src/app/trainorder/pipes/trainorder-pipes.module';

@Component({
  selector: 'app-nhm-code-details',
  templateUrl: './nhm-code-details.component.html',
  styleUrls: ['./nhm-code-details.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    TrainorderPipesModule
  ]
})
export class NhmCodeDetailsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public nhmCodeDetails: {nhmCodes: GoodModel[], orderNumber: string | undefined, zabOrderNumber: string | undefined }) { }

  ngOnInit(): void {
  }

}
