import { Logger, MessageCodes } from '../common/logger';
import * as utils from '../common/utils';
import { AggregationType } from '../constants/aggregationType';
import { ExpressionType } from '../constants/expressionType';
import * as REG_EXPS from '../constants/regexps';
import { Aggregate } from '../expressions/aggregate';
import { Expression, IQuotes } from '../expressions/expression';
import { GroupBy, Grouping } from '../expressions/groupBy';
import { OrderBy, Sorting } from '../expressions/orderBy';
import { DirectiveArguments } from './directiveArguments';

export abstract class AggregationParser {
// TODO:: refactor parse method - metrics!
    static parse(
        expression: Aggregate,
        logger: Logger,
        queryExpressions: Expression[],
        queryQuotes: IQuotes,
        grouping: Grouping,
        groupId: string,
        isWithinUngroup: boolean = false
    ) {
        let match: RegExpMatchArray = expression.code.match(REG_EXPS.AGGREGATION);

        while(match) {
            const aggrArgs: DirectiveArguments = this.parseArguments(match);
            const aggrType: string = match[2].toUpperCase();
            const aggrStartIndex: number = match.index + match[1].length;
            const optionalArgs: string[] = aggrArgs.slice(1, aggrArgs.length);
            const isPrimal: boolean = expression.type === ExpressionType.FIELD;
            const requiresGroupingCompatibility: boolean = !!(isPrimal && !isWithinUngroup && grouping.length);
            let groupingOver: Grouping;
            let expressionsOver: Expression[];
            let nonMatchedGrouping: Grouping;
            let lastProcessedIndex: number;

            if (!aggrArgs.endIndex) {
                logger.error(utils.format('Missing closing bracket for {0} aggregation:\n{1}', aggrType, match.input));
            }
            else {
                lastProcessedIndex = aggrArgs.endIndex;
            }

            const overArgs: DirectiveArguments = this.parseAggregationDirective(
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
                        const groupByExpr: Expression = new Expression(
                            ExpressionType.GROUP_BY,
                            arg,
                            queryQuotes,
                            GroupBy.getLastGroupingId(<Grouping>expressions)
                            );
                        groupByExpr.normalize();

                        if (!GroupBy.isOverall(groupByExpr)) {
                            if (requiresGroupingCompatibility && !utils.some<GroupBy>(grouping, (groupBy) => groupBy.equals(groupByExpr))) {
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
                    groupingOver = overArgs.reduce((groupingAcc: Grouping, arg: string) => {
                        const groupExpr: GroupBy = new GroupBy(
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

            let sorting: Sorting;
            const orderByArgs: DirectiveArguments = this.parseAggregationDirective(
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
                    const orderExpr: OrderBy = new OrderBy(arg, queryQuotes, queryExpressions, GroupBy.getLastGroupingId(grouping));
                    if (orderExpr.normalized === '' && orderByArgs.length > 1) {
                        logger.error(utils.format('Argument expression is empty for {0} clause after {1} aggregation:\n{2}', ExpressionType.ORDER_BY, aggrType, match.input));
                    }
                    else {
                        sortingAcc.push(orderExpr);
                    }
                    return sortingAcc;
                }, []);
            }

            const innerExpr: Aggregate = new Aggregate(
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

            const groupingRefDefinition = requiresGroupingCompatibility && nonMatchedGrouping && nonMatchedGrouping.length ?
                GroupBy.defineGroupingReference(nonMatchedGrouping, grouping) + '.' + innerExpr.id :
                (<Aggregate>innerExpr).defineExpObjRef();

            expression.code = expression.code.replace(
                expression.code.substring(aggrStartIndex, lastProcessedIndex + 1),
                groupingRefDefinition + innerExpr.getValRef()
            );

            match = expression.code.match(REG_EXPS.AGGREGATION);
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

        const codeToAnalyse = expression.code.substring(startIndex, expression.code.length);
        const directiveMatch = codeToAnalyse.match(REG_EXPS[directiveType]);
        let parsedArgs: DirectiveArguments;

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
        const code = match.input;
        const codeLenght = code.length;
        const matchLength = match[0].length;
        const openBracketIndex = match.index + matchLength;
        const aggregationArgs = new DirectiveArguments();
        let openingBrackets = 1;
        let commaIndex = 0;

        for (let i = openBracketIndex; i < codeLenght; i++) {
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
                } break; // tslint:disable-line
                case ',': {
                    if (openingBrackets === 1) {
                        aggregationArgs.push(code.substring(commaIndex || openBracketIndex, i));
                        commaIndex = i + 1;
                    }
                } break; // tslint:disable-line
            }
        }
        return aggregationArgs;
    }

    private static matchGroupings(queryExpressions: Expression[], queryQuotes: IQuotes, grouping: Grouping, overExpressions: Expression[], nonMatchedGrouping: Grouping): Grouping {
        const overGrouping = [];
        let parentGroupingId = null;
        let chainMatches = true;

        utils.forEach<Expression>(overExpressions, (overExp, index) => {
            let groupBy: GroupBy = grouping[index];

            if (!chainMatches || !groupBy || !groupBy.equals(overExp)) {
                chainMatches = false;
                groupBy = new GroupBy(
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
