import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-confirmation-display',
  templateUrl: './confirmation-display.component.html',
  styleUrls: ['./confirmation-display.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule
  ]
})
export class ConfirmationDisplayComponent implements OnInit {
  confirmationText: string;

  constructor( private dialogRef: MatDialogRef<ConfirmationDisplayComponent>,
               @Inject(MAT_DIALOG_DATA) displayText: string) {
    this.confirmationText = displayText;
  }

  ngOnInit(): void {
  }

}
