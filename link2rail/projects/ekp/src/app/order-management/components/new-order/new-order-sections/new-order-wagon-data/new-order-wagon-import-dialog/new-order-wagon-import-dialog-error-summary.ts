import { ValidationErrors } from "@angular/forms";

export class ErrorSummary {
    private wagonErrors: Map<string, ValidationErrors> = new Map();

    public addErrors(rowId: string, errors: ValidationErrors): void {
        if (!rowId || !errors) return;
        const existingErrors = this.wagonErrors.get(rowId) || {};
        const newErrors: ValidationErrors = {};
    
        Object.keys(errors).forEach((errorKey) => {
            newErrors[errorKey] = errors[errorKey];
        });
    
        // Combine existing errors with new ones (update all errors)
        const updatedErrors = { ...existingErrors, ...newErrors };
    
        // Only update if there are valid errors to store
        if (Object.keys(updatedErrors).length > 0) {
            this.wagonErrors.set(rowId, updatedErrors);
        }
    }

    /** Get validation errors for a specific wagon */
    public getErrors(rowId: string): ValidationErrors | undefined {
        return this.wagonErrors.get(rowId);
    }

    /** Check if any errors exist for a specific wagon */
    public rowHasErrors(rowId: string): boolean {
        return this.wagonErrors.has(rowId) && Object.keys(this.wagonErrors.get(rowId) || {}).length > 0;
    }

    /** Remove errors for a specific wagon */
    public removeErrors(rowId: string): void {
        this.wagonErrors.delete(rowId);
    }

    /** Clear all errors */
    public clear(): void {
        this.wagonErrors.clear();
    }

    /** Get all errors */
    public getAllErrors(): Map<string, ValidationErrors> {
        return this.wagonErrors;
    }

    /** Get errors for a specific row */
    public getRowErrors(rowId: string): ValidationErrors | null {
        return this.wagonErrors.get(rowId) || null;
    }

    /** Convert errors to an array for UI display */
    public getErrorsArray(): { rowId: string; errors: ValidationErrors }[] {
        return Array.from(this.wagonErrors.entries()).map(([rowId, errors]) => ({
            rowId,
            errors,
        }));
    }
}