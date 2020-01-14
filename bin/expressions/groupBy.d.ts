import { Expression, IQuotes } from './expression';
export declare class GroupBy extends Expression {
    iteratorId: string;
    valueId: string;
    constructor(rawExpression: any, queryQuotes: IQuotes, queryExpressions?: Expression[], parentGroupingId?: string);
    equal(groupBy: GroupBy): boolean;
    isOverallGrouping(): boolean;
    static getLastGroupingId(parentGrouping: Grouping, currentGrouping?: Grouping): string;
    static compareGrouping(groupingA: Grouping, groupingB: Grouping): boolean;
    static defineGroupingReference(grouping: Grouping, groupigScope: Grouping): string;
    static isOverall(exp: Expression): boolean;
    private fillDefault();
    private setIds();
    private findSibling(queryExpressions);
}
export declare type Grouping = GroupBy[];
