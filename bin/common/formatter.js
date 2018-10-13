(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("./utils");
    var QueryFormatter = /** @class */ (function () {
        function QueryFormatter() {
        }
        QueryFormatter.formatFunction = function (// TODO:: pass single definition object
            declarations, aggregationIterators, postProcessing, groupedResultSet, resultSet, comparators, mainSorting, debugLevel, usesGroupDistinct) {
            return utils.format(QueryFormatter.MAIN_TEMPLATE, declarations, QueryFormatter.formatComment(aggregationIterators, '/* === AGGREGATION ITERATORS === */'), QueryFormatter.formatComment(postProcessing, '/* === POST PROCESSING === */'), QueryFormatter.formatComment(groupedResultSet, '/* === GROUPED RESULT SET === */'), QueryFormatter.formatComment(resultSet, '/* === NON GROUPED QUERY RESULT SET === */'), QueryFormatter.formatComment(comparators, '/* === ORDER BY COMPARATORS === */'), mainSorting, debugLevel > 0 ? '__logger__.debugObject("Input Data", data);' : '', debugLevel > 1 ? '__logger__.debugObject("Grouped Aggregations", __groupings__);' : '', debugLevel > 0 ? '__logger__.debugObject("Results", __results__);' : '', usesGroupDistinct ? QueryFormatter.DISTINCT_FN_TEMPLATE : '');
        };
        QueryFormatter.formatAggregationIterator = function (groupings, ungroups, aggregations, postProcessing, usesIndex) {
            return utils.format(QueryFormatter.AGGREGATION_ITERATOR_TEMPLATE, QueryFormatter.formatComment(groupings, '/* === FILLING GROUPINGS === */'), QueryFormatter.formatComment(ungroups, '/* === UNGROUPS === */'), QueryFormatter.formatComment(aggregations, '/* === EXPRESSIONS AGGREGATION === */'), QueryFormatter.formatComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */'), usesIndex ? 'index++;' : '', usesIndex ? 'index = 1;' : '');
        };
        QueryFormatter.formatGroupedResultSet = function (groupDeclaration, groupReference, iteratorName, groupingsDeclaration, postProcessing, innerLoops, fillingResults) {
            var iterationDef = QueryFormatter.formatComment(groupingsDeclaration, '/* === GROUPINGS DECLARATIONS === */') + '\n' +
                QueryFormatter.formatComment(postProcessing, '/* === EXPRESSIONS POST PROCESSING === */') + '\n' +
                QueryFormatter.formatComment(innerLoops, '/* === AGGREGATE INNER GROUPINGS === */') + '\n' +
                QueryFormatter.formatComment(fillingResults, '/* === FILLING GROUPING RESULT SET === */');
            return utils.format(QueryFormatter.GROUPED_RESULTS_ITERATOR_TEMPLATE, groupDeclaration, groupReference, iteratorName, iterationDef.replace(QueryFormatter.NEW_LINE_REGEXP, '\n' + QueryFormatter.INDENTATION));
        };
        QueryFormatter.formatComparision = function (innerComparision, valueX, valueY) {
            return utils.format(QueryFormatter.COMPARISION_TEMPLATE, innerComparision, valueX, valueY).replace(QueryFormatter.NEW_LINE_REGEXP, '\n' + QueryFormatter.INDENTATION);
        };
        QueryFormatter.formatComment = function (code, comment) {
            return code ? (comment + '\n' + code) : (code || '');
        };
        QueryFormatter.MAIN_TEMPLATE = "\n/* === DECLARATIONS === */\n{0}\n{7}\n{1}\n\n{8}\n{2}\n\n{3}\n\n{4}\n\n{9}\nreturn __results__{6};\n\n{5}\n{10}";
        QueryFormatter.DISTINCT_FN_NAME = '__hasElement__';
        QueryFormatter.DISTINCT_FN_TEMPLATE = "function " + QueryFormatter.DISTINCT_FN_NAME + "(arr, val) {\n    return arr.indexOf(val) > -1;\n}";
        QueryFormatter.AGGREGATION_ITERATOR_TEMPLATE = "for (prop in data) { // TODO:: optimize it for list\n    row = data[prop];\n\n    {0}\n\n    {1}\n\n    {2}\n\n    {4}\n}\n{5}\n{3} \n";
        QueryFormatter.GROUPED_RESULTS_ITERATOR_TEMPLATE = "{0};\nfor (var {2} in {1}) {\n    {3}\n}";
        QueryFormatter.COMPARISION_TEMPLATE = "({1} === {2} ?\n    {0} :\n    (\n        {1} != null ?\n        ({2} != null ? ({1} > {2} ? 1 : -1) : 1) :\n        ({2} != null ? -1 : ({1} === null ? 1 : -1))\n    )\n)";
        QueryFormatter.NEW_LINE_REGEXP = /(\r\n)|(\n)/gm;
        QueryFormatter.INDENTATION = '    ';
        return QueryFormatter;
    }());
    exports.QueryFormatter = QueryFormatter;
});
