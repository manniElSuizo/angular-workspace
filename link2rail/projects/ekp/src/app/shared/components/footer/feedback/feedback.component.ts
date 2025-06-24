import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'

})

export class FeedbackComponent {
  protected dataProtectionLink: string;
  protected feedbackLink: string;

  constructor(private dialog: MatDialog,
    private dialogRef: MatDialogRef<FeedbackComponent>,
    private translateService: TranslateService
  ) {
    // Set the default link based on the initial language
    this.setLinks();

    // Listen to language change and update the link
    this.translateService.onLangChange.subscribe(() => {
      this.setLinks();
    });
  }

  private setLinks() {
    const currentLang = this.translateService.currentLang;

    // Set the URLs based on the current language
    if (currentLang === 'de') {
      this.dataProtectionLink = 'https://www.dbcargo.com/rail-de-de/Datenschutz/datenschutzhinweis-link2rail-4983576?';
      this.feedbackLink = 'https://bahnhr.qualtrics.com/jfe/form/SV_3fK6yIKKmM3wc1E';
    } else {
      this.dataProtectionLink = 'https://www.dbcargo.com/rail-de-en/privatpolicy/data-protection-notice-link2rail-5078228';
      this.feedbackLink = 'https://bahnhr.qualtrics.com/jfe/form/SV_38kdLLSqgZhkCZo';
    }
  }

  protected openFeedbackLink() {
    this.close();
    window.open(this.feedbackLink, '_blank');
  }

  protected close() {
    this.dialogRef.close(); // Close the dialog
  }


  protected openDataProtectionLink() {
    window.open(this.dataProtectionLink, '_blank');
  }

}
