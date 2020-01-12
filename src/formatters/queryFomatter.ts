import * as utils from '../common/utils';
import { INDENTATION } from '../constants/common';
import * as regexps from '../constants/regexps';

export abstract class QueryFormatter {

    static DISTINCT_FN_NAME = '__hasElement__';

    private static DISTINCT_FN_TEMPLATE = // TODO:: expand to compare objects
        `function ${QueryFormatter.DISTINCT_FN_NAME}(arr, val) {
    return arr.indexOf(val) > -1;
}`;
    private static PROPERTY_DEFINITION: string = '"{0}": {1}';

    static defineFunction(
        declarations: string,
        aggregationIterators: string,
        postProcessing: string,
        groupedResultSet: string,
        resultSet: string,
        comparators: string,
        mainSorting: string,
        debugLevel: number,
        usesGroupDistinct: boolean
    ): string {
        const aggregationIteratorsDef = QueryFormatter.defineComment(aggregationIterators, '/* === AGGREGATION ITERATORS === */');
        const postProcessingDef = QueryFormatter.defineComment(postProcessing, '/* === POST PROCESSING === */');
        const groupedResultSetDef = QueryFormatter.defineComment(groupedResultSet, '/* === GROUPED RESULT SET === */');
        const resultSetDef = QueryFormatter.defineComment(resultSet, '/* === NON GROUPED QUERY RESULT SET === */');
        const comparatorsDef = QueryFormatter.defineComment(comparators, '/* === ORDER BY COMPARATORS === */');
        const inputDataDebugger = debugLevel > 0 ? '__logger__.debugObject("Input Data", data);' : '';
        const groupedDataDebugger = debugLevel > 1 ? '__logger__.debugObject("Grouped Aggregations", __groupings__);' : '';
        const resultsDebugger = debugLevel > 0 ? '__logger__.debugObject("Results", __results__);' : '';
        const distinctGroupFnDef = usesGroupDistinct ? QueryFormatter.DISTINCT_FN_TEMPLATE : '';

        return (
`
/* === DECLARATIONS === */
${declarations}
${inputDataDebugger}
${aggregationIteratorsDef}

${groupedDataDebugger}
${postProcessingDef}

${groupedResultSetDef}

${resultSetDef}

${resultsDebugger}
return __results__${mainSorting};

${comparatorsDef}
${distinctGroupFnDef}`
        );
    }

    static defineAggregationIterator(groupings: string, ungroups: string, aggregations: string, postProcessing?: string, usesIndex?: boolean): string {
        const groupingsDef = QueryFormatter.defineComment(groupings, '/* === FILLING GROUPINGS === */');
        const ungroupsDef = QueryFormatter.defineComment(ungroups, '/* === UNGROUPS === */');
        const aggregationsDef = QueryFormatter.defineComment(aggregations, '/* === EXPRESSIONS AGGREGATION === */');
        const postProcessingDef = QueryFormatter.defineComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */');
        const indexingIncrementDef = usesIndex ? 'index++;' : '';
        const indexingInitDef = usesIndex ? 'index = 1;' : '';

        return (
`for (prop in data) { // TODO:: optimize it for list
    row = data[prop];

    ${groupingsDef}

    ${ungroupsDef}

    ${aggregationsDef}

    ${indexingIncrementDef}
}
${indexingInitDef}
${postProcessingDef}
`
        );
    }

    static defineGroupedResultSet(
        groupDeclaration: string,
        groupReference: string,
        iteratorName: string,
        groupingsDeclaration: string,
        postProcessing: string,
        innerLoops: string,
        fillingResults: string
    ): string {
        const iterationDef: string = (
            QueryFormatter.defineComment(groupingsDeclaration, '/* === GROUPINGS DECLARATIONS === */') + '\n' +
            QueryFormatter.defineComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */') + '\n' +
            QueryFormatter.defineComment(innerLoops, '/* === AGGREGATE INNER GROUPINGS === */') + '\n' +
            QueryFormatter.defineComment(fillingResults, '/* === FILLING GROUPING RESULT SET === */')
        ).replace(regexps.NEW_LINE, '\n' + INDENTATION);

        return (
`${groupDeclaration};
for (var ${iteratorName} in ${groupReference}) {
    ${iterationDef}
}`
        );
    }

    static defineAllDeclarations(mainGroupingDeclaration: string, allVariablesDeclaration: string): string {
        return (
`var __results__ = [],
    __groupings__ = ${mainGroupingDeclaration},
    __val__, __length__, __i__,
    ${allVariablesDeclaration}
    prop, row, out, index = 1;`
        );
    }

    static defineGrouping(groupingId: string, innerGroupRef: string, iteratorName: string): string {
        return `    ${groupingId} = ${innerGroupRef}[${iteratorName}];`;
    }

    static defineProperty(propName: string, propertyDefinition: string): string {
        return utils.format(QueryFormatter.PROPERTY_DEFINITION, propName, propertyDefinition);
    }

    static defineDistinctPreProcessing(containerReference: string): string {
        return `!${QueryFormatter.DISTINCT_FN_NAME}(${containerReference}, out)`;
    }

    static definePreProcessedPushTemplate(containerReference: string, selectionDefinition: string, preProcessing: string[]): string {
        const preProcesses = preProcessing.join(' && ');

        return (
`out = ${selectionDefinition};
if (${preProcesses})
    ${containerReference}.push(out);`
        );
    }

    static defineResultsPushTemplate(containerReference: string, selectionDefinition: string): string {
        return `${containerReference}.push(${selectionDefinition});`;
    }

    private static defineComment(code: string, comment: string): string {
        return code ? (comment + '\n' + code) : (code || '');
    }
}
