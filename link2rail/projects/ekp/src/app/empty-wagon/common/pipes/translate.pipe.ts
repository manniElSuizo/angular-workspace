import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '../services/translate.service';

@Pipe({
    name: 'translateMultiple',
})
export class TranslatePipe implements PipeTransform {
    constructor(private translateService: TranslateService) {}

    transform(key: string, asset: string): string {
        return this.translateService.getTranslation(key, asset);
    }
}