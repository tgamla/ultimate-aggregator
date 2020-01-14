import { GroupComposition } from '../helpers/groupComposition';
import { Expression, IQuotes } from './expression';
export declare class OrderBy extends Expression {
    orderDirection: OrderByDirection;
    constructor(rawExpression: any, queryQuotes: IQuotes, queryExpressions?: Expression[], parentGroupingId?: string);
    equals(oderBy: OrderBy): boolean;
    compareToAggregation(exp: Expression): void;
    isOrderedByValue(): boolean;
    isAscending(): boolean;
    static compareSorting(sortingA: Sorting, sortingB: Sorting): boolean;
    static defineGroupComparator(group: GroupComposition): string;
    static defineComparator(sorting: Sorting): string;
    private parseOrderDirection();
    private fillDefault();
    private findSibling(queryExpressions);
}
export declare enum OrderByDirection {
    ASC = "ASC",
    DESC = "DESC",
}
export declare type Sorting = OrderBy[];
