import { AggregateFunction, avg, concat, count, first, last, max, min, nth, sum, Type as AggregateFunctionType } from './aggregateFunction';
import { Group } from './group';
import { IConfig } from './interfaces/iConfig';
import { IBaseGroupDefinition as IGroupDefinition, IBaseGroupDefinition as IUngroupDefinition, IQueryDefinition } from './interfaces/IDefinition';
import { Query } from './query';
import { Ungroup } from './ungroup';

export function query<T>(config?: IConfig) { return new Query<T>(config); }
export function group(selection: Object) { return new Group(selection); }
export function ungroup(selection: Object) { return new Ungroup(selection); }
export function aggregateFunction(type: AggregateFunctionType, rawExpression: any, argExpression?: string) {
    return new AggregateFunction(type, rawExpression, argExpression);
}

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
    concat,

    IConfig,
    IQueryDefinition,
    IGroupDefinition,
    IUngroupDefinition
};
