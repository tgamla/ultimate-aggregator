import { IAggregateFunction } from './interfaces/iAggregateFunction';
export declare function count(rawExpression: any): AggregateFunction;
export declare function sum(rawExpression: any): AggregateFunction;
export declare function avg(rawExpression: any): AggregateFunction;
export declare function min(rawExpression: any): AggregateFunction;
export declare function max(rawExpression: any): AggregateFunction;
export declare function first(rawExpression: any): AggregateFunction;
export declare function last(rawExpression: any): AggregateFunction;
export declare function nth(rawExpression: any, no: any): AggregateFunction;
export declare function concat(rawExpression: any, delimiter: any): AggregateFunction;
export declare class AggregateFunction implements IAggregateFunction {
    private id;
    private type;
    private readonly _rawExpression;
    private readonly _argument;
    private _distinct;
    private _over;
    private _orderBy;
    constructor(type: Type, rawExpression: any, argExpression?: string);
    distinct(apply: boolean): AggregateFunction;
    over(grouping: string | string[]): AggregateFunction;
    orderBy(sorting: string | string[]): AggregateFunction;
    toString(): string;
    valueOf(): string;
    private defineOver;
    private defineOrderBy;
    private static getList;
}
export declare enum Type {
    COUNT = "COUNT",
    SUM = "SUM",
    AVG = "AVG",
    MIN = "MIN",
    MAX = "MAX",
    FIRST = "FIRST",
    LAST = "LAST",
    NTH = "NTH",
    CONCAT = "CONCAT"
}
