import * as utils from "../common/utils";
import { Aggregate } from '../expressions/aggregate';
import { Logger, MessageCodes } from '../common/logger';
import { Expression, Quotes, ExpressionRegExps } from '../expressions/expression';
import { GroupBy, Grouping } from '../expressions/groupBy';
import { Sorting, OrderBy } from '../expressions/orderBy';
import { AggregationType } from '../constants/aggregationType';
import { ExpressionType } from '../constants/expressionType';


export abstract class AggregationParser {
    public static parse(expression: Aggregate, logger: Logger, queryExpressions: Array<Expression>, queryQuotes: Quotes, grouping: Grouping, groupId: string, isWithinUngroup: boolean = false) {
        var match: RegExpMatchArray = expression.code.match(ExpressionRegExps.AGGREGATION);

        while(match) {
            var aggrArgs: DirectiveArguments = this.parseArguments(match);
            var optionalArgs: Array<string> = aggrArgs.slice(1, aggrArgs.length);
            var aggrType: string = match[2].toUpperCase();
            var lastProcessedIndex: number;
            var isPrimal: boolean = expression.type === ExpressionType.FIELD;

            if (!aggrArgs.endIndex) {
                logger.error(utils.format('Missing closing bracket for {0} aggregation:\n{1}', aggrType, match.input));
            }
            else {
                lastProcessedIndex = aggrArgs.endIndex;
            }

            var groupingOver: Grouping;
            var expressionsOver: Array<Expression>;
            var nonMatchedGrouping: Grouping;
            var requiresGroupingCompatibility: boolean = isPrimal && !isWithinUngroup && grouping.length ? true : false;
            var overArgs: DirectiveArguments = this.parseAggregationDirective(
                expression,
                logger,
                match,
                aggrType,
                lastProcessedIndex,
                ExpressionType.GROUP_BY
            );

            if (overArgs) {
                lastProcessedIndex = overArgs.endIndex;

                if (requiresGroupingCompatibility) {
                    nonMatchedGrouping = [];

                    expressionsOver = overArgs.reduce((expressions, arg: string) => {
                        var groupByExpr: Expression = new Expression(
                            ExpressionType.GROUP_BY,
                            arg,
                            queryQuotes,
                            GroupBy.getLastGroupingId(<Grouping>expressions)
                            );
                        groupByExpr.normalize();
    
                        if (!GroupBy.isOverall(groupByExpr)) {
                            if (requiresGroupingCompatibility && !utils.some<GroupBy>(grouping, (groupBy) => groupBy.equals(groupByExpr))) {
                                throw 'Primal aggregation cannot have grouping that exceeds over outer scope non empty grouping!\n' + (expression.code.substring(aggrStartIndex, lastProcessedIndex + 1));
                            }
                            expressions.push(groupByExpr);
                        }
                        return expressions;
                    }, []);
    
                    groupingOver = AggregationParser.matchGroupings(queryExpressions, queryQuotes, grouping, expressionsOver, nonMatchedGrouping);
                }
                else {
                    groupingOver = overArgs.reduce((groupingAcc: Grouping, arg: string) => {
                        var groupExpr: GroupBy = new GroupBy(
                            arg,
                            queryQuotes,
                            queryExpressions,
                            GroupBy.getLastGroupingId(groupingAcc)
                            );
    
                        if (!groupExpr.isOverallGrouping()) {
                            groupingAcc.push(groupExpr);
                        }
                        return groupingAcc;
                    }, []);
                }

                if (overArgs.length > 1 && overArgs.length > groupingOver.length) {
                    logger.log(MessageCodes.UNNECESSARY_OVERALL_GROUP_BY, expression.code.substring(aggrStartIndex, lastProcessedIndex + 1));
                }
            }

            var sorting: Sorting;
            var orderByArgs: DirectiveArguments = this.parseAggregationDirective(
                expression,
                logger,
                match,
                aggrType,
                lastProcessedIndex,
                ExpressionType.ORDER_BY
            );

            if (orderByArgs) {
                lastProcessedIndex = orderByArgs.endIndex;

                sorting = orderByArgs.reduce((sortingAcc, arg: string) => {
                    var orderExpr: OrderBy = new OrderBy(arg, queryQuotes, queryExpressions, GroupBy.getLastGroupingId(grouping));
                    if (orderExpr.normalized === '' && orderByArgs.length > 1) {
                        logger.error(utils.format('Argument expression is empty for {0} clause after {1} aggregation:\n{2}', ExpressionType.ORDER_BY, aggrType, match.input));
                    }
                    else {
                        sortingAcc.push(orderExpr);
                    }
                    return sortingAcc;
                }, []);
            }

            var innerExpr: Aggregate = new Aggregate(
                logger,
                aggrArgs[0],
                AggregationType[aggrType],
                queryQuotes,
                queryExpressions,
                groupId,
                grouping,
                expression.level + 1,
                isPrimal,
                optionalArgs,
                groupingOver,
                sorting
            );

            expression.innerExpressions.push(innerExpr);

            var aggrStartIndex: number = match.index + match[1].length;
            var groupingRefDefinition = requiresGroupingCompatibility && nonMatchedGrouping && nonMatchedGrouping.length ?
                GroupBy.defineGroupingReference(nonMatchedGrouping, grouping) + '.' + innerExpr.id :
                (<Aggregate>innerExpr).defineExpObjRef();

            expression.code = expression.code.replace(
                expression.code.substring(aggrStartIndex, lastProcessedIndex + 1),
                groupingRefDefinition + innerExpr.getValRef()
            );

            match = expression.code.match(ExpressionRegExps.AGGREGATION);
        }
    }

    private static parseAggregationDirective(
        expression: Aggregate,
        logger: Logger,
        aggrMatch: RegExpMatchArray,
        aggrType: string,
        startIndex: number,
        directiveType: ExpressionType
    ): DirectiveArguments {

        var codeToAnalyse = expression.code.substring(startIndex, expression.code.length);
        var directiveMatch = codeToAnalyse.match(ExpressionRegExps[directiveType]);
        var parsedArgs: DirectiveArguments;
        
        if (directiveMatch) {
            parsedArgs = this.parseArguments(directiveMatch);
            if (!parsedArgs.endIndex) {
                logger.error(utils.format('No closing bracket for {0} clause after {1} aggregation:\n{2}', directiveType, aggrType, aggrMatch.input));
            }
            parsedArgs.endIndex += startIndex;

            if (directiveType === ExpressionType.ORDER_BY && !Aggregate.canHaveSorting(aggrType)) {
                logger.warning(utils.format('{0} directive will not be taken into account for {1} aggregation please consider removing such directive or changing aggregation type:\n{2}', directiveType, aggrType, aggrMatch.input));
                return parsedArgs;
            }
        }

        return parsedArgs;
    }

    private static parseArguments(match: RegExpMatchArray): DirectiveArguments {
        var i,
            openingBrackets = 1,
            commaIndex = 0,
            code = match.input,
            codeLenght = code.length,
            matchLength = match[0].length,
            openBracketIndex = match.index + matchLength,
            aggregationArgs = new DirectiveArguments();

        for (i = openBracketIndex; i < codeLenght; i++) {
            switch(code[i]) {
                case '[': // Semicolon can be used in Array constructor.
                case '(': openingBrackets++; break;
                case ']': openingBrackets--; break;
                case ')': {
                    if (openingBrackets === 1) {
                        aggregationArgs.push(code.substring(commaIndex || openBracketIndex, i));
                        aggregationArgs.endIndex = i;
                        return aggregationArgs;
                    }
                    else {
                        openingBrackets--;
                    }
                } break;
                case ',': {
                    if (openingBrackets === 1) {
                        aggregationArgs.push(code.substring(commaIndex || openBracketIndex, i));
                        commaIndex = i + 1;
                    }
                } break;
            }
        }
        return aggregationArgs;
    }

    private static matchGroupings(queryExpressions: Array<Expression>, queryQuotes: Quotes, grouping: Grouping, overExpressions: Array<Expression>, nonMatchedGrouping: Grouping): Grouping {
        var overGrouping = [];
        var parentGroupingId = null;
        var chainMatches = true;

        utils.forEach<Expression>(overExpressions, (overExp, index) => {
            var groupBy: GroupBy = grouping[index];

            if (!chainMatches || !groupBy || !groupBy.equals(overExp)) {
                chainMatches = false;
                var groupBy = new GroupBy(
                    overExp.raw,
                    queryQuotes,
                    queryExpressions,
                    parentGroupingId
                );
                nonMatchedGrouping.push(groupBy);
            }

            parentGroupingId = groupBy.id;
            overGrouping.push(groupBy);
        });

        return overGrouping;
    }
}

class DirectiveArguments extends Array<string> {
    public endIndex: number;

    constructor() {
        super();
        this.endIndex = 0;
    }
}
