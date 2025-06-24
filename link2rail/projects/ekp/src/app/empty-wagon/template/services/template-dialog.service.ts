import {Injectable, OnDestroy, Type} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {TemplateRenameComponent} from "../components/template-rename/template-rename.component";

@Injectable({
    providedIn: 'root'
})
export class TemplateDialogService implements OnDestroy {

    constructor(
        private dialog: MatDialog
    ) {}

    ngOnDestroy(): void {}

    public openTemplateModificationDialog(templateName: string, customerTemplateName: string): Subject<boolean> {
        const resultSubject = new Subject<boolean>();
        this.openDialog(TemplateRenameComponent, {
            templateName,
            customerTemplateName
        }, resultSubject, '600px', '40vh');
        return resultSubject;
    }

    private openDialog<T>(component: Type<T>, data: any, resultSubject: Subject<boolean>, width: string = '1710px', height: string = '90vh'): void {
        this.dialog.open<T>(component, {
            data,
            width: width,
            height: height,
            disableClose: true,
            panelClass: 'full-screen-modal'
        }).afterClosed().subscribe({
            next: result => resultSubject.next(!!result)
        });
    }

}