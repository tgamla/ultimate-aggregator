"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../common/logger");
var utils = require("../common/utils");
var aggregationType_1 = require("../constants/aggregationType");
var expressionType_1 = require("../constants/expressionType");
var REG_EXPS = require("../constants/regexps");
var aggregate_1 = require("../expressions/aggregate");
var expression_1 = require("../expressions/expression");
var groupBy_1 = require("../expressions/groupBy");
var orderBy_1 = require("../expressions/orderBy");
var directiveArguments_1 = require("./directiveArguments");
var AggregationParser = /** @class */ (function () {
    function AggregationParser() {
    }
    // TODO:: refactor parse method - metrics!
    AggregationParser.parse = function (expression, logger, queryExpressions, queryQuotes, grouping, groupId, isWithinUngroup) {
        if (isWithinUngroup === void 0) { isWithinUngroup = false; }
        var match = expression.code.match(REG_EXPS.AGGREGATION);
        var _loop_1 = function () {
            var aggrArgs = this_1.parseArguments(match);
            var aggrType = match[2].toUpperCase();
            var aggrStartIndex = match.index + match[1].length;
            var optionalArgs = aggrArgs.slice(1, aggrArgs.length);
            var isPrimal = expression.type === expressionType_1.ExpressionType.FIELD;
            var requiresGroupingCompatibility = !!(isPrimal && !isWithinUngroup && grouping.length);
            var groupingOver = void 0;
            var expressionsOver = void 0;
            var nonMatchedGrouping = void 0;
            var lastProcessedIndex;
            if (!aggrArgs.endIndex) {
                logger.error(utils.format('Missing closing bracket for {0} aggregation:\n{1}', aggrType, match.input));
            }
            else {
                lastProcessedIndex = aggrArgs.endIndex;
            }
            var overArgs = this_1.parseAggregationDirective(expression, logger, match, aggrType, lastProcessedIndex, expressionType_1.ExpressionType.GROUP_BY);
            if (overArgs) {
                lastProcessedIndex = overArgs.endIndex;
                if (requiresGroupingCompatibility) {
                    nonMatchedGrouping = [];
                    expressionsOver = overArgs.reduce(function (expressions, arg) {
                        var groupByExpr = new expression_1.Expression(expressionType_1.ExpressionType.GROUP_BY, arg, queryQuotes, groupBy_1.GroupBy.getLastGroupingId(expressions));
                        groupByExpr.normalize();
                        if (!groupBy_1.GroupBy.isOverall(groupByExpr)) {
                            if (requiresGroupingCompatibility && !utils.some(grouping, function (groupBy) { return groupBy.equals(groupByExpr); })) {
                                throw 'Primal aggregation cannot have grouping that exceeds over outer scope non empty grouping!\n' +
                                    (expression.code.substring(aggrStartIndex, lastProcessedIndex + 1));
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
            var sorting = void 0;
            var orderByArgs = this_1.parseAggregationDirective(expression, logger, match, aggrType, lastProcessedIndex, expressionType_1.ExpressionType.ORDER_BY);
            if (orderByArgs) {
                lastProcessedIndex = orderByArgs.endIndex;
                sorting = orderByArgs.reduce(function (sortingAcc, arg) {
                    var orderExpr = new orderBy_1.OrderBy(arg, queryQuotes, queryExpressions, groupBy_1.GroupBy.getLastGroupingId(grouping));
                    if (orderExpr.normalized === '' && orderByArgs.length > 1) {
                        logger.error(utils.format('Argument expression is empty for {0} clause after {1} aggregation:\n{2}', expressionType_1.ExpressionType.ORDER_BY, aggrType, match.input));
                    }
                    else {
                        sortingAcc.push(orderExpr);
                    }
                    return sortingAcc;
                }, []);
            }
            var innerExpr = new aggregate_1.Aggregate(logger, aggrArgs[0], aggregationType_1.AggregationType[aggrType], queryQuotes, queryExpressions, groupId, grouping, expression.level + 1, isPrimal, optionalArgs, groupingOver, sorting);
            expression.innerExpressions.push(innerExpr);
            var groupingRefDefinition = requiresGroupingCompatibility && nonMatchedGrouping && nonMatchedGrouping.length ?
                groupBy_1.GroupBy.defineGroupingReference(nonMatchedGrouping, grouping) + '.' + innerExpr.id :
                innerExpr.defineExpObjRef();
            expression.code = expression.code.replace(expression.code.substring(aggrStartIndex, lastProcessedIndex + 1), groupingRefDefinition + innerExpr.getValRef());
            match = expression.code.match(REG_EXPS.AGGREGATION);
        };
        var this_1 = this;
        while (match) {
            _loop_1();
        }
    };
    AggregationParser.parseAggregationDirective = function (expression, logger, aggrMatch, aggrType, startIndex, directiveType) {
        var codeToAnalyse = expression.code.substring(startIndex, expression.code.length);
        var directiveMatch = codeToAnalyse.match(REG_EXPS[directiveType]);
        var parsedArgs;
        if (directiveMatch) {
            parsedArgs = this.parseArguments(directiveMatch);
            if (!parsedArgs.endIndex) {
                logger.error(utils.format('No closing bracket for {0} clause after {1} aggregation:\n{2}', directiveType, aggrType, aggrMatch.input));
            }
            parsedArgs.endIndex += startIndex;
            if (directiveType === expressionType_1.ExpressionType.ORDER_BY && !aggregate_1.Aggregate.canHaveSorting(aggrType)) {
                logger.warning(utils.format('{0} directive will not be taken into account for {1} aggregation please consider removing such directive or changing aggregation type:\n{2}', directiveType, aggrType, aggrMatch.input));
                return parsedArgs;
            }
        }
        return parsedArgs;
    };
    AggregationParser.parseArguments = function (match) {
        var code = match.input;
        var codeLenght = code.length;
        var matchLength = match[0].length;
        var openBracketIndex = match.index + matchLength;
        var aggregationArgs = new directiveArguments_1.DirectiveArguments();
        var openingBrackets = 1;
        var commaIndex = 0;
        for (var i = openBracketIndex; i < codeLenght; i++) {
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
                    break; // tslint:disable-line
                case ',':
                    {
                        if (openingBrackets === 1) {
                            aggregationArgs.push(code.substring(commaIndex || openBracketIndex, i));
                            commaIndex = i + 1;
                        }
                    }
                    break; // tslint:disable-line
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
                groupBy = new groupBy_1.GroupBy(overExp.raw, queryQuotes, queryExpressions, parentGroupingId);
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
