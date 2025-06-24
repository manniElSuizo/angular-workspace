import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';
@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss'],
    standalone: true,
    imports: [
        SharedModule
    ]
})
export class ConfirmationComponent{

    constructor(private dialogRef: MatDialogRef<ConfirmationComponent>) {}

    decision(value: boolean){
        this.dialogRef.close(value);
    }
}

