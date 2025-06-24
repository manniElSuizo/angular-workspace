import { Component, Inject, HostListener, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ViewportScroller } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DocumentationComponent } from './documentation-component/documentation.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { release } from '@src/release';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    release = '';
    footerForm!: any;
    windowScrolled: boolean;

    constructor(@Inject(DOCUMENT) private document: Document, private scroll: ViewportScroller, private dialog: MatDialog) {
        this.release = release.split('.').slice(0, 2).join('.');
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
        let scrollTo = 100;
        if (window.pageYOffset > scrollTo || document.documentElement.scrollTop > scrollTo || document.body.scrollTop > scrollTo) {
            this.windowScrolled = true;
        } else if (this.windowScrolled && (window.pageYOffset < scrollTo || document.documentElement.scrollTop < scrollTo || document.body.scrollTop < scrollTo)) {
            this.windowScrolled = false;
        }
    }

    /**
     * NOT USED NOW beacuase scroll detaction is in footer
     * @param element The element that shall be watched
     * @returns boolean true if element is on screen
     */
    elementOnScreen(element: ElementRef) {
        let docViewTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        let docViewBottom = docViewTop + window.innerHeight;
        let elemTop = element.nativeElement.offset().top;
        let elemBottom = elemTop + element.nativeElement.height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    scrollToTop(){
        this.scroll.scrollToPosition([0,0]);
    }

    showHelp(): void {
        let config: MatDialogConfig = { maxWidth: '90vw', maxHeight: '90vh', width: '100%', height: '100%' };
        this.openDialog(DocumentationComponent, config);
    }

    showFeedback(): void {
        let config: MatDialogConfig = { maxWidth: '40vw', maxHeight: '60vh', width: '100%', height: '100%' , disableClose: true};
        this.openDialog(FeedbackComponent, config);
    }


    private openDialog<T>(comp: new (...args: any[]) => T, config: any): void {
        this.dialog.open(comp, config);
    }
}
