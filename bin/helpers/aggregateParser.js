var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../common/utils", "../expressions/aggregate", "../common/logger", "../prototypes/expression", "../expressions/groupBy", "../expressions/orderBy", "../constants/aggregationType"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var aggregate_1 = require("../expressions/aggregate");
    var logger_1 = require("../common/logger");
    var expression_1 = require("../prototypes/expression");
    var groupBy_1 = require("../expressions/groupBy");
    var orderBy_1 = require("../expressions/orderBy");
    var aggregationType_1 = require("../constants/aggregationType");
    var AggregationParser = /** @class */ (function () {
        function AggregationParser() {
        }
        AggregationParser.parse = function (expression, logger, queryExpressions, queryQuotes, grouping, groupId, isWithinUngroup) {
            if (isWithinUngroup === void 0) { isWithinUngroup = false; }
            var match = expression.code.match(expression_1.ExpressionRegExps.AGGREGATION);
            while (match) {
                var aggrArgs = this.parseArguments(match);
                var optionalArgs = aggrArgs.slice(1, aggrArgs.length);
                var aggrType = match[2].toUpperCase();
                var lastProcessedIndex;
                var isPrimal = expression.type === expression_1.Type.FIELD;
                if (!aggrArgs.endIndex) {
                    logger.error(utils.format('Missing closing bracket for {0} aggregation:\n{1}', aggrType, match.input));
                }
                else {
                    lastProcessedIndex = aggrArgs.endIndex;
                }
                var groupingOver;
                var expressionsOver;
                var nonMatchedGrouping;
                var requiresGroupingCompatibility = isPrimal && !isWithinUngroup && grouping.length ? true : false;
                var overArgs = this.parseAggregationDirective(expression, logger, match, aggrType, lastProcessedIndex, expression_1.Type.GROUP_BY);
                if (overArgs) {
                    lastProcessedIndex = overArgs.endIndex;
                    if (requiresGroupingCompatibility) {
                        nonMatchedGrouping = [];
                        expressionsOver = overArgs.reduce(function (expressions, arg) {
                            var groupByExpr = new expression_1.Expression(expression_1.Type.GROUP_BY, arg, queryQuotes, groupBy_1.GroupBy.getLastGroupingId(expressions));
                            groupByExpr.normalize();
                            if (!groupBy_1.GroupBy.isOverall(groupByExpr)) {
                                if (requiresGroupingCompatibility && !utils.some(grouping, function (groupBy) { return groupBy.equals(groupByExpr); })) {
                                    throw 'Primal aggregation cannot have grouping that exceeds over outer scope non empty grouping!\n' + (expression.code.substring(aggrStartIndex, lastProcessedIndex + 1));
                                }
                                expressions.push(groupByExpr);
                            }
                            return expressions;
                        }, []);
                        groupingOver = AggregationParser.matchGroupings(queryExpressions, queryQuotes, grouping, expressionsOver, nonMatchedGrouping);
                    }
                    else {
                        groupingOver = overArgs.reduce(function (groupingAcc, arg) {
                            var groupExpr = new groupBy_1.GroupBy(arg, queryQuotes, queryExpressions, groupBy_1.GroupBy.getLastGroupingId(groupingAcc));
                            if (!groupExpr.isOverallGrouping()) {
                                groupingAcc.push(groupExpr);
                            }
                            return groupingAcc;
                        }, []);
                    }
                    if (overArgs.length > 1 && overArgs.length > groupingOver.length) {
                        logger.log(logger_1.MessageCodes.UNNECESSARY_OVERALL_GROUP_BY, expression.code.substring(aggrStartIndex, lastProcessedIndex + 1));
                    }
                }
                var sorting;
                var orderByArgs = this.parseAggregationDirective(expression, logger, match, aggrType, lastProcessedIndex, expression_1.Type.ORDER_BY);
                if (orderByArgs) {
                    lastProcessedIndex = orderByArgs.endIndex;
                    sorting = orderByArgs.reduce(function (sortingAcc, arg) {
                        var orderExpr = new orderBy_1.OrderBy(arg, queryQuotes, queryExpressions, groupBy_1.GroupBy.getLastGroupingId(grouping));
                        if (orderExpr.normalized === '' && orderByArgs.length > 1) {
                            logger.error(utils.format('Argument expression is empty for {0} clause after {1} aggregation:\n{2}', expression_1.Type.ORDER_BY, aggrType, match.input));
                        }
                        else {
                            sortingAcc.push(orderExpr);
                        }
                        return sortingAcc;
                    }, []);
                }
                var innerExpr = new aggregate_1.Aggregate(logger, aggrArgs[0], aggregationType_1.AggregationType[aggrType], queryQuotes, queryExpressions, groupId, grouping, expression.level + 1, isPrimal, optionalArgs, groupingOver, sorting);
                expression.innerExpressions.push(innerExpr);
                var aggrStartIndex = match.index + match[1].length;
                var groupingRefDefinition = requiresGroupingCompatibility && nonMatchedGrouping && nonMatchedGrouping.length ?
                    groupBy_1.GroupBy.defineGroupingReference(nonMatchedGrouping, grouping) + '.' + innerExpr.id :
                    innerExpr.defineExpObjRef();
                expression.code = expression.code.replace(expression.code.substring(aggrStartIndex, lastProcessedIndex + 1), groupingRefDefinition + innerExpr.getValRef());
                match = expression.code.match(expression_1.ExpressionRegExps.AGGREGATION);
            }
        };
        AggregationParser.parseAggregationDirective = function (expression, logger, aggrMatch, aggrType, startIndex, directiveType) {
            var codeToAnalyse = expression.code.substring(startIndex, expression.code.length);
            var directiveMatch = codeToAnalyse.match(expression_1.ExpressionRegExps[directiveType]);
            var parsedArgs;
            if (directiveMatch) {
                parsedArgs = this.parseArguments(directiveMatch);
                if (!parsedArgs.endIndex) {
                    logger.error(utils.format('No closing bracket for {0} clause after {1} aggregation:\n{2}', directiveType, aggrType, aggrMatch.input));
                }
                parsedArgs.endIndex += startIndex;
                if (directiveType === expression_1.Type.ORDER_BY && !aggregate_1.Aggregate.canHaveSorting(aggrType)) {
                    logger.warning(utils.format('{0} directive will not be taken into account for {1} aggregation please consider removing such directive or changing aggregation type:\n{2}', directiveType, aggrType, aggrMatch.input));
                    return parsedArgs;
                }
            }
            return parsedArgs;
        };
        AggregationParser.parseArguments = function (match) {
            var i, openingBrackets = 1, commaIndex = 0, code = match.input, codeLenght = code.length, matchLength = match[0].length, openBracketIndex = match.index + matchLength, aggregationArgs = new DirectiveArguments();
            for (i = openBracketIndex; i < codeLenght; i++) {
                switch (code[i]) {
                    case '[': // Semicolon can be used in Array constructor.
                    case '(':
                        openingBrackets++;
                        break;
                    case ']':
                        openingBrackets--;
                        break;
                    case ')':
                        {
                            if (openingBrackets === 1) {
                                aggregationArgs.push(code.substring(commaIndex || openBracketIndex, i));
                                aggregationArgs.endIndex = i;
                                return aggregationArgs;
                            }
                            else {
                                openingBrackets--;
                            }
                        }
                        break;
                    case ',':
                        {
                            if (openingBrackets === 1) {
                                aggregationArgs.push(code.substring(commaIndex || openBracketIndex, i));
                                commaIndex = i + 1;
                            }
                        }
                        break;
                }
            }
            return aggregationArgs;
        };
        AggregationParser.matchGroupings = function (queryExpressions, queryQuotes, grouping, overExpressions, nonMatchedGrouping) {
            var overGrouping = [];
            var parentGroupingId = null;
            var chainMatches = true;
            utils.forEach(overExpressions, function (overExp, index) {
                var groupBy = grouping[index];
                if (!chainMatches || !groupBy || !groupBy.equals(overExp)) {
                    chainMatches = false;
                    var groupBy = new groupBy_1.GroupBy(overExp.raw, queryQuotes, queryExpressions, parentGroupingId);
                    nonMatchedGrouping.push(groupBy);
                }
                parentGroupingId = groupBy.id;
                overGrouping.push(groupBy);
            });
            return overGrouping;
        };
        return AggregationParser;
    }());
    exports.AggregationParser = AggregationParser;
    var DirectiveArguments = /** @class */ (function (_super) {
        __extends(DirectiveArguments, _super);
        function DirectiveArguments() {
            var _this = _super.call(this) || this;
            _this.endIndex = 0;
            return _this;
        }
        return DirectiveArguments;
    }(Array));
});
