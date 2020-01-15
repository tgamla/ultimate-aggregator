"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../common/utils");
var common_1 = require("../constants/common");
var regexps = require("../constants/regexps");
var QueryFormatter = /** @class */ (function () {
    function QueryFormatter() {
    }
    QueryFormatter.defineFunction = function (declarations, aggregationIterators, postProcessing, groupedResultSet, resultSet, comparators, mainSorting, debugLevel, usesGroupDistinct) {
        var aggregationIteratorsDef = QueryFormatter.defineComment(aggregationIterators, '/* === AGGREGATION ITERATORS === */');
        var postProcessingDef = QueryFormatter.defineComment(postProcessing, '/* === POST PROCESSING === */');
        var groupedResultSetDef = QueryFormatter.defineComment(groupedResultSet, '/* === GROUPED RESULT SET === */');
        var resultSetDef = QueryFormatter.defineComment(resultSet, '/* === NON GROUPED QUERY RESULT SET === */');
        var comparatorsDef = QueryFormatter.defineComment(comparators, '/* === ORDER BY COMPARATORS === */');
        var inputDataDebugger = debugLevel > 0 ? '__logger__.debugObject("Input Data", data);' : '';
        var groupedDataDebugger = debugLevel > 1 ? '__logger__.debugObject("Grouped Aggregations", __groupings__);' : '';
        var resultsDebugger = debugLevel > 0 ? '__logger__.debugObject("Results", __results__);' : '';
        var distinctGroupFnDef = usesGroupDistinct ? QueryFormatter.DISTINCT_FN_TEMPLATE : '';
        return ("\n/* === DECLARATIONS === */\n" + declarations + "\n" + inputDataDebugger + "\n" + aggregationIteratorsDef + "\n\n" + groupedDataDebugger + "\n" + postProcessingDef + "\n\n" + groupedResultSetDef + "\n\n" + resultSetDef + "\n\n" + resultsDebugger + "\nreturn __results__" + mainSorting + ";\n\n" + comparatorsDef + "\n" + distinctGroupFnDef);
    };
    QueryFormatter.defineAggregationIterator = function (groupings, ungroups, aggregations, postProcessing, usesIndex) {
        var groupingsDef = QueryFormatter.defineComment(groupings, '/* === FILLING GROUPINGS === */');
        var ungroupsDef = QueryFormatter.defineComment(ungroups, '/* === UNGROUPS === */');
        var aggregationsDef = QueryFormatter.defineComment(aggregations, '/* === EXPRESSIONS AGGREGATION === */');
        var postProcessingDef = QueryFormatter.defineComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */');
        var indexingIncrementDef = usesIndex ? 'index++;' : '';
        var indexingInitDef = usesIndex ? 'index = 1;' : '';
        return ("for (prop in data) { // TODO:: optimize it for list\n    row = data[prop];\n\n    " + groupingsDef + "\n\n    " + ungroupsDef + "\n\n    " + aggregationsDef + "\n\n    " + indexingIncrementDef + "\n}\n" + indexingInitDef + "\n" + postProcessingDef + "\n");
    };
    QueryFormatter.defineGroupedResultSet = function (groupDeclaration, groupReference, iteratorName, groupingsDeclaration, postProcessing, innerLoops, fillingResults) {
        var iterationDef = (QueryFormatter.defineComment(groupingsDeclaration, '/* === GROUPINGS DECLARATIONS === */') + '\n' +
            QueryFormatter.defineComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */') + '\n' +
            QueryFormatter.defineComment(innerLoops, '/* === AGGREGATE INNER GROUPINGS === */') + '\n' +
            QueryFormatter.defineComment(fillingResults, '/* === FILLING GROUPING RESULT SET === */')).replace(regexps.NEW_LINE, '\n' + common_1.INDENTATION);
        return (groupDeclaration + ";\nfor (var " + iteratorName + " in " + groupReference + ") {\n    " + iterationDef + "\n}");
    };
    QueryFormatter.defineAllDeclarations = function (mainGroupingDeclaration, allVariablesDeclaration) {
        return ("var __results__ = [],\n    __groupings__ = " + mainGroupingDeclaration + ",\n    __val__, __length__, __i__,\n    " + allVariablesDeclaration + "\n    prop, row, out, index = 1;");
    };
    QueryFormatter.defineGrouping = function (groupingId, innerGroupRef, iteratorName) {
        return "    " + groupingId + " = " + innerGroupRef + "[" + iteratorName + "];";
    };
    QueryFormatter.defineProperty = function (propName, propertyDefinition) {
        return utils.format(QueryFormatter.PROPERTY_DEFINITION, propName, propertyDefinition);
    };
    QueryFormatter.defineDistinctPreProcessing = function (containerReference) {
        return "!" + QueryFormatter.DISTINCT_FN_NAME + "(" + containerReference + ", out)";
    };
    QueryFormatter.definePreProcessedPushTemplate = function (containerReference, selectionDefinition, preProcessing) {
        var preProcesses = preProcessing.join(' && ');
        return ("out = " + selectionDefinition + ";\nif (" + preProcesses + ")\n    " + containerReference + ".push(out);");
    };
    QueryFormatter.defineResultsPushTemplate = function (containerReference, selectionDefinition) {
        return containerReference + ".push(" + selectionDefinition + ");";
    };
    QueryFormatter.defineComment = function (code, comment) {
        return code ? (comment + '\n' + code) : (code || '');
    };
    QueryFormatter.DISTINCT_FN_NAME = '__hasElement__';
    QueryFormatter.DISTINCT_FN_TEMPLATE = "function " + QueryFormatter.DISTINCT_FN_NAME + "(arr, val) {\n    return arr.indexOf(val) > -1;\n}";
    QueryFormatter.PROPERTY_DEFINITION = '"{0}": {1}';
    return QueryFormatter;
}());
exports.QueryFormatter = QueryFormatter;
