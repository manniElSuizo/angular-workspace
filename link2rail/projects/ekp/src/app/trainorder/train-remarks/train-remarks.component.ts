import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TrainChain, TrainDetail } from '@src/app/trainorder/models/ApiTrainsDetail.model';

interface RemarkItem {
    productionDate: Date,
    trainNumber: string,
    remark: string
}

@Component({
    selector: 'app-train-remarks',
    templateUrl: './train-remarks.component.html',
    styleUrl: './train-remarks.component.scss',
})
export class TrainRemarksComponent implements OnInit {

    protected formGroup: FormGroup;
    private trainChain: TrainChain | undefined;
    private trainDetail: TrainDetail | undefined;
    protected remarkList : RemarkItem[] = new Array();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { trainDetail: TrainDetail | undefined, trainChain: TrainChain | undefined }) {

        this.trainChain = data.trainChain;
        this.trainDetail = data.trainDetail;
    }

    ngOnInit(): void {
        this.fillRemarkList();
    }

    private fillRemarkList() {
        //const tempData =  'Ein langer Text \r 2. Zeile \n 3. Zeile TestText TestText TestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestTextTestText TestText' ;
        if (this.trainChain) {
            this.trainChain.trains.forEach((train:TrainDetail)=>{
                //train.comment = tempData;
                if (train.comment) {
                    this.remarkList.push({productionDate:train.train.productionDate,trainNumber:train.train.trainNumber,remark:train.comment});
                }
            });
            return;
        }
        //this.trainDetail.comment = tempData;
        this.remarkList.push({productionDate:this.trainDetail.train.productionDate,trainNumber:this.trainDetail.train.trainNumber,remark:this.trainDetail.comment});
    }
}
