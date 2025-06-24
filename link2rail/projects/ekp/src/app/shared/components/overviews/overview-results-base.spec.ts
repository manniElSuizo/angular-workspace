import {OverviewResultsBase} from "./overview-results-base";
import {TableHeader} from "../../models/table";

// Create a concrete subclass for testing purposes that exposes the protected methods.
class TestOverviewResults<T> extends OverviewResultsBase<T> {
    constructor(translate: any) {
        super(translate);
    }

    // Public wrapper for the protected buildTableHeaders method.
    public testBuildTableHeaders(headersConfig: any, translationKey: string): TableHeader[] {
        return this.buildTableHeaders(headersConfig, translationKey);
    }

    // Public wrapper for the protected changeSortCriteria method.
    public testChangeSortCriteria(fieldName: string): void {
        this.changeSortCriteria(fieldName);
    }
}

// Define a fake translate service.
const fakeTranslate = {
    // When the key contains "objKey", return an object to simulate a complex translation.
    instant: (key: string) => key.includes("objKey")
        ? {text: key + "_text", title: key + "_title"}
        : key
};

describe('OverviewResultsBase', () => {
    let testInstance: TestOverviewResults<any>;

    beforeEach(() => {
        testInstance = new TestOverviewResults(fakeTranslate);
    });

    describe('buildTableHeaders', () => {
        it('should build headers with simple translations', () => {
            const headersConfig = [
                {fieldName: "name", width: "100px", sortable: true},
                {fieldName: "age", width: "50px", sortable: false},
            ];
            // translationKey such that translate.instant returns simple string
            const result = testInstance.testBuildTableHeaders(headersConfig, "simpleKey");
            expect(result.length).toBe(2);
            expect(result[0]).toEqual({
                fieldName: "name",
                headerText: "simpleKey.name",
                headerTitle: "simpleKey.name",
                minWidth: "100px",
                maxWidth: "100px",
                textAlign: "left",
                sortable: true
            });
            expect(result[1]).toEqual({
                fieldName: "age",
                headerText: "simpleKey.age",
                headerTitle: "simpleKey.age",
                minWidth: "50px",
                maxWidth: "50px",
                textAlign: "left",
                sortable: false
            });
        });

        it('should build headers with object translations', () => {
            const headersConfig = [
                {fieldName: "objKeyField", width: "120px", sortable: true, textAlign: "center"}
            ];
            const result = testInstance.testBuildTableHeaders(headersConfig, "objKey");
            expect(result.length).toBe(1);
            expect(result[0]).toEqual({
                fieldName: "objKeyField",
                headerText: "objKey.objKeyField_text",
                headerTitle: "objKey.objKeyField_title",
                minWidth: "120px",
                maxWidth: "120px",
                textAlign: "center",
                sortable: true
            });
        });
    });

    describe('Sorting functions', () => {
        it('should add a sort condition if none exists', () => {
            expect(testInstance.sortConditions.length).toBe(0);
            testInstance.testChangeSortCriteria("name");
            expect(testInstance.sortConditions.length).toBe(1);
            expect(testInstance.sortConditions[0]).toEqual({asc: true, field: "name"});
        });

        it('should reverse sort order if first condition is the same', () => {
            testInstance.testChangeSortCriteria("name");
            expect(testInstance.sortConditions[0].asc).toBe(true);
            testInstance.testChangeSortCriteria("name");
            expect(testInstance.sortConditions[0].asc).toBe(false);
        });

        it('should update sortConditions according to the defined logic', () => {
            // Add initial condition.
            testInstance.testChangeSortCriteria("name");
            // Change to a different field, pushing the new condition to the beginning.
            testInstance.testChangeSortCriteria("age");

            // According to the logic, if there are more than two, the last will be popped, resulting in a single
            // condition.
            expect(testInstance.sortConditions.length).toBe(2);
            expect(testInstance.sortConditions[0]).toEqual({asc: true, field: "age"});
        });

        it('should return sorted condition for a given field', () => {
            testInstance.testChangeSortCriteria("name");
            const condition = testInstance.getSortedCondition("name");
            expect(condition).toBeDefined();
            expect(condition?.field).toBe("name");
        });

        it('should return undefined if sort condition is not set', () => {
            const condition = testInstance.getSortedCondition("nonExist");
            expect(condition).toBeUndefined();
        });

        it('should handle onClickSortField and emit event', () => {
            spyOn(testInstance.addSortCondition, 'emit');
            testInstance.onClickSortField("name");
            expect(testInstance.sortConditions[0]).toEqual({asc: true, field: "name"});
            expect(testInstance.addSortCondition.emit).toHaveBeenCalled();
        });

        it('should correctly identify ascending sort', () => {
            testInstance.testChangeSortCriteria("name");
            expect(testInstance.isAscending("name")).toBeTrue();
            // Reverse sort order.
            testInstance.testChangeSortCriteria("name");
            expect(testInstance.isAscending("name")).toBeFalse();
        });

        it('should correctly identify descending sort', () => {
            testInstance.testChangeSortCriteria("name");
            // By default, ascending so descending check should be false.
            expect(testInstance.isDescending("name")).toBeFalse();
            // Reverse sort order.
            testInstance.testChangeSortCriteria("name");
            expect(testInstance.isDescending("name")).toBeTrue();
        });
    });
});