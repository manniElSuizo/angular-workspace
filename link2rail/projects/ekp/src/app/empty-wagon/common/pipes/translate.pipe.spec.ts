import {TestBed} from '@angular/core/testing';

import {TranslateService} from "../services/translate.service";
import {TranslatePipe} from "./translate.pipe";

describe('TranslatePipe', () => {
    let pipe: TranslatePipe;
    let translateService: jasmine.SpyObj<TranslateService>;

    beforeEach(() => {
        const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['getTranslation']);

        TestBed.configureTestingModule({
            providers: [
                TranslatePipe,
                {provide: TranslateService, useValue: translateServiceSpy},
            ],
        });

        pipe = TestBed.inject(TranslatePipe);
        translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    });

    it('should translate the given key with the provided asset', () => {
        // Arrange
        const key = 'greeting';
        const asset = 'common';
        const expectedTranslation = 'Hello';
        translateService.getTranslation.and.returnValue(expectedTranslation);

        // Act
        const result = pipe.transform(key, asset);

        // Assert
        expect(result).toBe(expectedTranslation);
        expect(translateService.getTranslation).toHaveBeenCalledWith(key, asset);
    });

    it('should handle missing keys gracefully', () => {
        // Arrange
        const key = 'missing.key';
        const asset = 'unknown';
        translateService.getTranslation.and.returnValue('');

        // Act
        const result = pipe.transform(key, asset);

        // Assert
        expect(result).toBe('');
        expect(translateService.getTranslation).toHaveBeenCalledWith(key, asset);
    });
});
