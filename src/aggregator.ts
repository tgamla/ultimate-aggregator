import { Query } from './query';
import { Group } from './group';
import { Ungroup } from './ungroup';
import { AggregateFunction, Type as AggregateFunctionType, count, sum, avg, min, max, first, last, nth, concat } from './aggregateFunction';

export function query(config: IConfig) { return new Query(config); };
export function group(selection: Object) { return new Group(selection); };
export function ungroup(selection: Object) { return new Ungroup(selection); };
export function aggregateFunction(type: AggregateFunctionType, rawExpression: any, argExpression?: string) {
    return new AggregateFunction(type, rawExpression, argExpression);
};

export {
    Query,
    Group,
    Ungroup,
    AggregateFunction,
    AggregateFunctionType,
    count,
    sum,
    avg,
    min,
    max,
    first,
    last,
    nth,
    concat
};