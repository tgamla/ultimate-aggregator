import * as utils from './utils';

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
        return utils.format(QueryFormatter.MAIN_TEMPLATE,
            declarations,
            QueryFormatter.formatComment(aggregationIterators, '/* === AGGREGATION ITERATORS === */'),
            QueryFormatter.formatComment(postProcessing, '/* === POST PROCESSING === */'),
            QueryFormatter.formatComment(groupedResultSet, '/* === GROUPED RESULT SET === */'),
            QueryFormatter.formatComment(resultSet, '/* === NON GROUPED QUERY RESULT SET === */'),
            QueryFormatter.formatComment(comparators, '/* === ORDER BY COMPARATORS === */'),
            mainSorting,
            debugLevel > 0 ? '__logger__.debugObject("Input Data", data);' : '',
            debugLevel > 1 ? '__logger__.debugObject("Grouped Aggregations", __groupings__);' : '',
            debugLevel > 0 ? '__logger__.debugObject("Results", __results__);' : '',
            usesGroupDistinct ? QueryFormatter.DISTINCT_FN_TEMPLATE : ''
        );
    }

    private static MAIN_TEMPLATE =
`
/* === DECLARATIONS === */
{0}
{7}
{1}

{8}
{2}

{3}

{4}

{9}
return __results__{6};

{5}
{10}`;
    public static DISTINCT_FN_NAME = '__hasElement__';
    private static DISTINCT_FN_TEMPLATE = // TODO:: expand to compare objects
`function ` + QueryFormatter.DISTINCT_FN_NAME + `(arr, val) {
    return arr.indexOf(val) > -1;
}`;

    public static formatAggregationIterator(groupings: string, ungroups: string, aggregations: string, postProcessing?: string, usesIndex?: boolean): string {
        return utils.format(QueryFormatter.AGGREGATION_ITERATOR_TEMPLATE,
            QueryFormatter.formatComment(groupings, '/* === FILLING GROUPINGS === */'),
            QueryFormatter.formatComment(ungroups, '/* === UNGROUPS === */'),
            QueryFormatter.formatComment(aggregations, '/* === EXPRESSIONS AGGREGATION === */'),
            QueryFormatter.formatComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */'),
            usesIndex ? 'index++;' : '',
            usesIndex ? 'index = 1;' : ''
        );
    }

    private static AGGREGATION_ITERATOR_TEMPLATE =
`for (prop in data) { // TODO:: optimize it for list
    row = data[prop];

    {0}

    {1}

    {2}

    {4}
}
{5}
{3} 
`;

    public static formatGroupedResultSet(
        groupDeclaration: string,
        groupReference: string,
        iteratorName: string,
        groupingsDeclaration: string,
        postProcessing: string,
        innerLoops: string,
        fillingResults: string
    ): string {
        var iterationDef: string = QueryFormatter.formatComment(groupingsDeclaration, '/* === GROUPINGS DECLARATIONS === */') + '\n' +
            QueryFormatter.formatComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */') + '\n' +
            QueryFormatter.formatComment(innerLoops, '/* === AGGREGATE INNER GROUPINGS === */') + '\n' +
            QueryFormatter.formatComment(fillingResults, '/* === FILLING GROUPING RESULT SET === */');

        return utils.format(QueryFormatter.GROUPED_RESULTS_ITERATOR_TEMPLATE,
            groupDeclaration,
            groupReference,
            iteratorName,
            iterationDef.replace(QueryFormatter.NEW_LINE_REGEXP, '\n' + QueryFormatter.INDENTATION)
        );
    }

    private static GROUPED_RESULTS_ITERATOR_TEMPLATE =
`{0};
for (var {2} in {1}) {
    {3}
}`;

    public static formatComparision(innerComparision: string, valueX: string, valueY: string): string {
        return utils.format(
            QueryFormatter.COMPARISION_TEMPLATE,
            innerComparision,
            valueX,
            valueY
        ).replace(QueryFormatter.NEW_LINE_REGEXP, '\n' + QueryFormatter.INDENTATION);
    }

    private static COMPARISION_TEMPLATE =
`({1} === {2} ?
    {0} :
    (
        {1} != null ?
        ({2} != null ? ({1} > {2} ? 1 : -1) : 1) :
        ({2} != null ? -1 : ({1} === null ? 1 : -1))
    )
)`;

    private static formatComment(code: string, comment: string): string {
        return code ? (comment + '\n' + code) : (code || '');
    }

    private static NEW_LINE_REGEXP: RegExp = /(\r\n)|(\n)/gm;
    private static INDENTATION: string = '    ';
}