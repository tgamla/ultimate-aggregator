import { Logger } from '../common/logger';
import { Aggregate } from './aggregate';
import { Expression, IQuotes } from './expression';
import { Grouping } from './groupBy';
export declare class Field extends Expression {
    level: number;
    innerExpressions: Aggregate[];
    groupIds: string[];
    grouping: Grouping;
    hasNonAggregatedFields: boolean;
    constructor(logger: Logger, rawExpression: any, queryQuotes: IQuotes, queryExpressions: Expression[], groupId?: string, grouping?: Grouping, isWithinUngroup?: boolean, level?: number);
    private findSibling;
    private handleNonAggrFields;
    private handleIndex;
}
