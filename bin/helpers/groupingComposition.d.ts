import { Aggregate } from '../expressions/aggregate';
import { Expression } from '../expressions/expression';
import { GroupBy } from '../expressions/groupBy';
import { GroupComposition, IGroupMap } from './groupComposition';
export declare class GroupingComposition {
    id: GroupingId;
    groupingExpression: GroupBy;
    inner: {
        GroupingId?: GroupingComposition;
    };
    expressions: Expression[];
    hasBeenDefined: boolean;
    private static GROUPING_DECLARATION_TEMPLATE;
    private static GROUPING_FETCH;
    private static OBJECT_COMPOSITION;
    constructor(groupingExpression: any);
    getGroupingVariableDeclarations(): string[];
    getGroupingDeclarations(isParentComplex: boolean, parentId: string): string[];
    defineGroupings(groupMap: IGroupMap, baseGroupings: GroupingComposition, isLastIteration?: boolean, groupingIds?: string, definedGroupings?: string[]): string;
    isComplex(): boolean;
    getAggregations(): Aggregate[];
    getPrimalAggregations(): Aggregate[];
    hasNonAggregatedNonGroupedFields(): boolean;
    hasNonAggregatedGroupedFields(): boolean;
    hasFieldsWithGroupIndex(): boolean;
    static getComposition(expressions: Expression[]): GroupingComposition;
    static defineGrouping(baseGrouping: GroupingComposition, groupCompositions: GroupComposition[]): string;
    private static defineGroupRowAssignment;
    private static defineGroupIndexIncrementation;
}
export declare type GroupingId = string;
