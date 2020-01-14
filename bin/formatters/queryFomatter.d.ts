export declare abstract class QueryFormatter {
    static DISTINCT_FN_NAME: string;
    private static DISTINCT_FN_TEMPLATE;
    private static PROPERTY_DEFINITION;
    static defineFunction(declarations: string, aggregationIterators: string, postProcessing: string, groupedResultSet: string, resultSet: string, comparators: string, mainSorting: string, debugLevel: number, usesGroupDistinct: boolean): string;
    static defineAggregationIterator(groupings: string, ungroups: string, aggregations: string, postProcessing?: string, usesIndex?: boolean): string;
    static defineGroupedResultSet(groupDeclaration: string, groupReference: string, iteratorName: string, groupingsDeclaration: string, postProcessing: string, innerLoops: string, fillingResults: string): string;
    static defineAllDeclarations(mainGroupingDeclaration: string, allVariablesDeclaration: string): string;
    static defineGrouping(groupingId: string, innerGroupRef: string, iteratorName: string): string;
    static defineProperty(propName: string, propertyDefinition: string): string;
    static defineDistinctPreProcessing(containerReference: string): string;
    static definePreProcessedPushTemplate(containerReference: string, selectionDefinition: string, preProcessing: string[]): string;
    static defineResultsPushTemplate(containerReference: string, selectionDefinition: string): string;
    private static defineComment(code, comment);
}
