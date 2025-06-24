/**
 * Interface for CSV report options.
 */
export interface CsvReportOptions {
    headers: string[];
    rows: (string | number | null | undefined)[][];
    fileName?: string;
}

/**
 * Utility class for building and downloading CSV reports.
 * Determines separator based on browser language: ';' for 'de' and 'nl', ',' otherwise.
 */
export class CsvReportBuilder {
    private headers: string[];
    private rows: (string | number | null | undefined)[][];
    private readonly fileName: string;
    private readonly separator: string;

    constructor(options: CsvReportOptions) {
        this.headers = options.headers;
        this.rows = options.rows;
        this.fileName = options.fileName || 'report.csv';
        this.separator = CsvReportBuilder.determineSeparatorFromBrowser();
    }

    /**
     * Determines the CSV separator based on the browser's language.
     * @returns The separator character.
     */
    private static determineSeparatorFromBrowser(): string {
        const lang = (navigator.languages && navigator.languages.length
                ? navigator.languages[0]
                : navigator.language || 'en'
        ).toLowerCase();
        return lang.startsWith('de') || lang.startsWith('nl') ? ';' : ',';
    }

    /**
     * Generates the CSV content as a string.
     */
    public buildCsv(): string {
        const headerLine = this.headers.map(h => CsvReportBuilder.escapeField(h, this.separator)).join(this.separator);
        const rowLines = this.rows.map(row =>
            row.map(field => CsvReportBuilder.escapeField(field, this.separator)).join(this.separator)
        );
        return [headerLine, ...rowLines].join('\n');
    }

    /**
     * Triggers download of the CSV file.
     * Prepends UTF-8 BOM to ensure Excel displays UTF-8 characters correctly.
     */
    public download(): void {
        const csvContent = this.buildCsv();
        // Prepend UTF-8 BOM
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], {type: 'text/csv;charset=utf-8;'});
        if ((navigator as any).msSaveBlob) {
            (navigator as any).msSaveBlob(blob, this.fileName);
        } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = this.fileName;
            a.style.visibility = 'hidden';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    /**
     * Escapes a field value for CSV output.
     */
    public static escapeField(val: string | number | null | undefined, sep: string): string {
        const str = val == null ? '' : String(val);
        if (str.includes(sep) || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
}
