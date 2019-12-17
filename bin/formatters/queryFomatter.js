(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../constants/regexps", "../constants/common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var regexps = require("../constants/regexps");
    var common_1 = require("../constants/common");
    var QueryFormatter = /** @class */ (function () {
        function QueryFormatter() {
        }
        QueryFormatter.formatFunction = function (// TODO:: pass single definition object
            declarations, aggregationIterators, postProcessing, groupedResultSet, resultSet, comparators, mainSorting, debugLevel, usesGroupDistinct) {
            var aggregationIteratorsDef = QueryFormatter.formatComment(aggregationIterators, '/* === AGGREGATION ITERATORS === */'), postProcessingDef = QueryFormatter.formatComment(postProcessing, '/* === POST PROCESSING === */'), groupedResultSetDef = QueryFormatter.formatComment(groupedResultSet, '/* === GROUPED RESULT SET === */'), resultSetDef = QueryFormatter.formatComment(resultSet, '/* === NON GROUPED QUERY RESULT SET === */'), comparatorsDef = QueryFormatter.formatComment(comparators, '/* === ORDER BY COMPARATORS === */'), inputDataDebuger = debugLevel > 0 ? '__logger__.debugObject("Input Data", data);' : '', groupedDataDebuger = debugLevel > 1 ? '__logger__.debugObject("Grouped Aggregations", __groupings__);' : '', resultsDebuger = debugLevel > 0 ? '__logger__.debugObject("Results", __results__);' : '', distinctGroupFnDef = usesGroupDistinct ? QueryFormatter.DISTINCT_FN_TEMPLATE : '';
            return ("\n/* === DECLARATIONS === */\n" + declarations + "\n" + inputDataDebuger + "\n" + aggregationIteratorsDef + "\n\n" + groupedDataDebuger + "\n" + postProcessingDef + "\n\n" + groupedResultSetDef + "\n\n" + resultSetDef + "\n\n" + resultsDebuger + "\nreturn __results__" + mainSorting + ";\n\n" + comparatorsDef + "\n" + distinctGroupFnDef);
        };
        QueryFormatter.formatAggregationIterator = function (groupings, ungroups, aggregations, postProcessing, usesIndex) {
            var groupingsDef = QueryFormatter.formatComment(groupings, '/* === FILLING GROUPINGS === */'), ungroupsDef = QueryFormatter.formatComment(ungroups, '/* === UNGROUPS === */'), aggregationsDef = QueryFormatter.formatComment(aggregations, '/* === EXPRESSIONS AGGREGATION === */'), postProcessingDef = QueryFormatter.formatComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */'), indexingIncrementDef = usesIndex ? 'index++;' : '', indexingInitDef = usesIndex ? 'index = 1;' : '';
            return ("for (prop in data) { // TODO:: optimize it for list\n    row = data[prop];\n\n    " + groupingsDef + "\n\n    " + ungroupsDef + "\n\n    " + aggregationsDef + "\n\n    " + indexingIncrementDef + "\n}\n" + indexingInitDef + "\n" + postProcessingDef + "\n");
        };
        QueryFormatter.formatGroupedResultSet = function (groupDeclaration, groupReference, iteratorName, groupingsDeclaration, postProcessing, innerLoops, fillingResults) {
            var iterationDef = (QueryFormatter.formatComment(groupingsDeclaration, '/* === GROUPINGS DECLARATIONS === */') + '\n' +
                QueryFormatter.formatComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */') + '\n' +
                QueryFormatter.formatComment(innerLoops, '/* === AGGREGATE INNER GROUPINGS === */') + '\n' +
                QueryFormatter.formatComment(fillingResults, '/* === FILLING GROUPING RESULT SET === */')).replace(regexps.NEW_LINE_REGEXP, '\n' + common_1.INDENTATION);
            return (groupDeclaration + ";\nfor (var " + iteratorName + " in " + groupReference + ") {\n    " + iterationDef + "\n}");
        };
        QueryFormatter.getAllDeclarationsDefinition = function (mainGroupingDeclaration, allVariablesDeclaration) {
            return ("var __results__ = [],\n    __groupings__ = " + mainGroupingDeclaration + ",\n    __val__, __length__, __i__,\n    " + allVariablesDeclaration + "\n    prop, row, out, index = 1;");
        };
        QueryFormatter.formatComment = function (code, comment) {
            return code ? (comment + '\n' + code) : (code || '');
        };
        QueryFormatter.DISTINCT_FN_NAME = '__hasElement__';
        QueryFormatter.DISTINCT_FN_TEMPLATE = "function " + QueryFormatter.DISTINCT_FN_NAME + "(arr, val) {\n    return arr.indexOf(val) > -1;\n}";
        return QueryFormatter;
    }());
    exports.QueryFormatter = QueryFormatter;
});
