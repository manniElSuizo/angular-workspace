import {CsvReportBuilder} from './csv-report-builder';

describe('CsvReportBuilder', () => {
    const ORIGINAL_LANG = navigator.language;
    const ORIGINAL_LANGUAGES = (navigator as any).languages;
    const originalCreateObjectURL = URL.createObjectURL;

    beforeEach(() => {
        // Reset URL.createObjectURL
        URL.createObjectURL = jasmine.createSpy('createObjectURL')
                                     .and.returnValue('blob:fake-url');
    });

    afterEach(() => {
        // Restore navigator.language / languages
        Object.defineProperty(navigator, 'language', {value: ORIGINAL_LANG, configurable: true});
        Object.defineProperty(navigator, 'languages', {value: ORIGINAL_LANGUAGES, configurable: true});
        // Restore URL.createObjectURL
        URL.createObjectURL = originalCreateObjectURL;
    });

    function setBrowserLocale(lang: string, languages: string[] = [lang]) {
        Object.defineProperty(navigator, 'language', {value: lang, configurable: true});
        Object.defineProperty(navigator, 'languages', {value: languages, configurable: true});
    }

    it('should use ";" separator for German and Dutch locales', () => {
        setBrowserLocale('de-DE');
        const builderDE = new CsvReportBuilder({headers: ['h'], rows: [['r']]});
        expect((builderDE as any).separator).toBe(';');

        setBrowserLocale('nl-NL');
        const builderNL = new CsvReportBuilder({headers: ['h'], rows: [['r']]});
        expect((builderNL as any).separator).toBe(';');
    });

    it('should use "," separator for other locales', () => {
        setBrowserLocale('en-US');
        const builderEN = new CsvReportBuilder({headers: ['h'], rows: [['r']]});
        expect((builderEN as any).separator).toBe(',');

        setBrowserLocale('fr-FR');
        const builderFR = new CsvReportBuilder({headers: ['h'], rows: [['r']]});
        expect((builderFR as any).separator).toBe(',');
    });

    describe('escapeField()', () => {
        const sep = ',';

        it('should leave simple strings untouched', () => {
            expect(CsvReportBuilder.escapeField('hello', sep)).toBe('hello');
        });

        it('should quote fields containing the separator', () => {
            expect(CsvReportBuilder.escapeField('a,b', sep)).toBe('"a,b"');
        });

        it('should quote and double-escape quotes inside fields', () => {
            expect(CsvReportBuilder.escapeField('he"llo', sep)).toBe('"he""llo"');
        });

        it('should quote fields containing newline characters', () => {
            expect(CsvReportBuilder.escapeField('line1\nline2', sep)).toBe('"line1\nline2"');
        });

        it('should treat null/undefined as empty string', () => {
            expect(CsvReportBuilder.escapeField(null, sep)).toBe('');
            expect(CsvReportBuilder.escapeField(undefined, sep)).toBe('');
        });

        it('should stringify numbers', () => {
            expect(CsvReportBuilder.escapeField(123, sep)).toBe('123');
        });
    });

    describe('buildCsv()', () => {
        it('should produce correctly joined CSV content', () => {
            setBrowserLocale('en-US');
            const headers = ['col1', 'col2'];
            const rows = [
                ['a', 'b'],
                ['1,2', 'he\nllo']  // test quoting for sep and newline
            ];
            const builder = new CsvReportBuilder({headers, rows, fileName: 'test.csv'});
            const csv = builder.buildCsv();
            const expected = [
                'col1,col2',
                'a,b',
                '"1,2","he\nllo"'
            ].join('\n');
            expect(csv).toBe(expected);
        });
    });

    describe('download()', () => {
        let appendSpy: jasmine.Spy;
        let removeSpy: jasmine.Spy;
        let fakeLink: any;

        beforeEach(() => {
            // fake <a> element
            fakeLink = {
                href: '',
                download: '',
                style: {visibility: ''},
                click: jasmine.createSpy('click')
            };
            appendSpy = spyOn(document.body, 'appendChild').and.returnValue(fakeLink);
            removeSpy = spyOn(document.body, 'removeChild').and.returnValue(undefined);
            spyOn(document, 'createElement').and.callFake((tag: string) => {
                if (tag === 'a') {
                    return fakeLink;
                }
                // fallback for other elements if needed
                return document.createElement(tag);
            });
        });

        it('should create a blob URL, append link, trigger click, and clean up', () => {
            setBrowserLocale('en-US');
            const headers = ['h'];
            const rows = [['r']];
            const builder = new CsvReportBuilder({headers, rows, fileName: 'f.csv'});

            builder.download();

            expect(URL.createObjectURL).toHaveBeenCalled();
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(fakeLink.download).toBe('f.csv');
            expect(appendSpy).toHaveBeenCalledWith(fakeLink);
            expect(fakeLink.click).toHaveBeenCalled();
            expect(removeSpy).toHaveBeenCalledWith(fakeLink);
        });
    });
});
