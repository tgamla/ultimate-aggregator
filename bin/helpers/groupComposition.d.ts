import { Logger } from '../common/logger';
import { Expression } from '../expressions/expression';
import { Grouping } from '../expressions/groupBy';
import { Sorting } from '../expressions/orderBy';
import { Selector } from './selector';
export declare class GroupComposition {
    id: string;
    selection: Selector;
    distinct: boolean;
    filter: Expression;
    grouping: Grouping;
    sorting: Sorting;
    expressions: Expression[];
    outputType: OutputType;
    isMain: boolean;
    isUngroup: boolean;
    hasParentGrouping: boolean;
    innerGroups: GroupComposition[];
    constructor(groupId: string, distinct: boolean, filter: Expression, grouping: Grouping, sorting: Sorting, isMain?: boolean, isUngroup?: boolean, hasParentGrouping?: boolean);
    getInitVariable(): string;
    getGroupVariableDeclarations(): string[];
    isSubSelectorGroup(): boolean;
    hasSorting(): boolean;
    getSubGroups(): GroupComposition[];
    getUngroupReference(): string;
    extendChildGrouping(logger: Logger, grouping: Grouping): Grouping;
    defineSorting(): string;
}
export interface IGroupMap {
    string?: GroupComposition[];
}
export declare enum OutputType {
    AS_LIST = 0,
    AS_OBJECT = 1,
    AS_VALUE = 2,
}
