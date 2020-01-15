
export interface IAggregateFunction {
    distinct(apply?: boolean): IAggregateFunction;
    over(grouping?: string | string[]): IAggregateFunction;
    orderBy(sorting?: string | string[]): IAggregateFunction;
    toString(): string;
    valueOf(): string;
    // TODO:: clone
}
