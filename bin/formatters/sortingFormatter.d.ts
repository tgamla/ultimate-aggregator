import { Sorting } from '../expressions/orderBy';
export declare abstract class SortingFormatter {
    static defineSortingFunction(sortFunctionName: string, sorting: Sorting, hasExtendedSorting: boolean): string;
    static defineSortedValueReference(expObjRef: string): string;
    static defineNthSortingOutput(expObjRef: string, comparatorId: string, valRef: string, elementIndex: string): string;
    static defineComplexSortingOutput(expObjRef: string, comparatorId: string, valRef: string): string;
    static defineComparision(sorting: Sorting, hasExtendedSorting: boolean): string;
    static defineValuesComparision(innerComparision: string, valueX: string, valueY: string): string;
    static defineValuesDeclaration(valRef: string, xValue: string, yValue: string): string;
}
