import { AggregateFunction, avg, concat, count, first, last, max, min, nth, sum, Type as AggregateFunctionType } from './aggregateFunction';
import { Group } from './group';
import { IConfig } from './interfaces/iConfig';
import { Query } from './query';
import { Ungroup } from './ungroup';
export declare function query<T>(config?: IConfig): Query<T>;
export declare function group(selection: Object): Group;
export declare function ungroup(selection: Object): Ungroup;
export declare function aggregateFunction(type: AggregateFunctionType, rawExpression: any, argExpression?: string): AggregateFunction;
export { Query, Group, Ungroup, AggregateFunction, AggregateFunctionType, count, sum, avg, min, max, first, last, nth, concat, IConfig };
