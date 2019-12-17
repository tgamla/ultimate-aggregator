import * as regexps from '../constants/regexps';
import { INDENTATION } from '../constants/common';


export abstract class QueryFormatter {
    public static formatFunction( // TODO:: pass single definition object
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
        let aggregationIteratorsDef = QueryFormatter.formatComment(aggregationIterators, '/* === AGGREGATION ITERATORS === */'),
            postProcessingDef = QueryFormatter.formatComment(postProcessing, '/* === POST PROCESSING === */'),
            groupedResultSetDef = QueryFormatter.formatComment(groupedResultSet, '/* === GROUPED RESULT SET === */'),
            resultSetDef = QueryFormatter.formatComment(resultSet, '/* === NON GROUPED QUERY RESULT SET === */'),
            comparatorsDef = QueryFormatter.formatComment(comparators, '/* === ORDER BY COMPARATORS === */'),
            inputDataDebuger = debugLevel > 0 ? '__logger__.debugObject("Input Data", data);' : '',
            groupedDataDebuger = debugLevel > 1 ? '__logger__.debugObject("Grouped Aggregations", __groupings__);' : '',
            resultsDebuger = debugLevel > 0 ? '__logger__.debugObject("Results", __results__);' : '',
            distinctGroupFnDef = usesGroupDistinct ? QueryFormatter.DISTINCT_FN_TEMPLATE : '';

        return (
`
/* === DECLARATIONS === */
${declarations}
${inputDataDebuger}
${aggregationIteratorsDef}

${groupedDataDebuger}
${postProcessingDef}

${groupedResultSetDef}

${resultSetDef}

${resultsDebuger}
return __results__${mainSorting};

${comparatorsDef}
${distinctGroupFnDef}`
        );
    }

    public static DISTINCT_FN_NAME = '__hasElement__';
    private static DISTINCT_FN_TEMPLATE = // TODO:: expand to compare objects
`function ${QueryFormatter.DISTINCT_FN_NAME}(arr, val) {
    return arr.indexOf(val) > -1;
}`;

    public static formatAggregationIterator(groupings: string, ungroups: string, aggregations: string, postProcessing?: string, usesIndex?: boolean): string {
        let groupingsDef = QueryFormatter.formatComment(groupings, '/* === FILLING GROUPINGS === */'),
            ungroupsDef = QueryFormatter.formatComment(ungroups, '/* === UNGROUPS === */'),
            aggregationsDef = QueryFormatter.formatComment(aggregations, '/* === EXPRESSIONS AGGREGATION === */'),
            postProcessingDef = QueryFormatter.formatComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */'),
            indexingIncrementDef = usesIndex ? 'index++;' : '',
            indexingInitDef = usesIndex ? 'index = 1;' : '';

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

    public static formatGroupedResultSet(
        groupDeclaration: string,
        groupReference: string,
        iteratorName: string,
        groupingsDeclaration: string,
        postProcessing: string,
        innerLoops: string,
        fillingResults: string
    ): string {
        var iterationDef: string = (
            QueryFormatter.formatComment(groupingsDeclaration, '/* === GROUPINGS DECLARATIONS === */') + '\n' +
            QueryFormatter.formatComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */') + '\n' +
            QueryFormatter.formatComment(innerLoops, '/* === AGGREGATE INNER GROUPINGS === */') + '\n' +
            QueryFormatter.formatComment(fillingResults, '/* === FILLING GROUPING RESULT SET === */')
        ).replace(regexps.NEW_LINE_REGEXP, '\n' + INDENTATION);

        return (
`${groupDeclaration};
for (var ${iteratorName} in ${groupReference}) {
    ${iterationDef}
}`
        );
    }

    public static getAllDeclarationsDefinition(mainGroupingDeclaration: string, allVariablesDeclaration: string): string {
        return (
`var __results__ = [],
    __groupings__ = ${mainGroupingDeclaration},
    __val__, __length__, __i__,
    ${allVariablesDeclaration}
    prop, row, out, index = 1;`
        );
    }

    private static formatComment(code: string, comment: string): string {
        return code ? (comment + '\n' + code) : (code || '');
    }
}