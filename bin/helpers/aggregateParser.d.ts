import { Logger } from '../common/logger';
import { Aggregate } from '../expressions/aggregate';
import { Expression, IQuotes } from '../expressions/expression';
import { Grouping } from '../expressions/groupBy';
export declare abstract class AggregationParser {
    static parse(expression: Aggregate, logger: Logger, queryExpressions: Expression[], queryQuotes: IQuotes, grouping: Grouping, groupId: string, isWithinUngroup?: boolean): void;
    private static parseAggregationDirective(expression, logger, aggrMatch, aggrType, startIndex, directiveType);
    private static parseArguments(match);
    private static matchGroupings(queryExpressions, queryQuotes, grouping, overExpressions, nonMatchedGrouping);
}
