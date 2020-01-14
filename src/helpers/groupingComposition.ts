import * as utils from '../common/utils';
import { Aggregate } from '../expressions/aggregate';
import { Expression } from '../expressions/expression';
import { Field } from '../expressions/field';
import { GroupBy } from '../expressions/groupBy';
import { GroupComposition, IGroupMap } from './groupComposition';

export class GroupingComposition {

    id: GroupingId;
    groupingExpression: GroupBy;
    inner: { GroupingId?: GroupingComposition };
    expressions: Expression[];
    hasBeenDefined: boolean;

    private static GROUPING_DECLARATION_TEMPLATE: string =
        `    {1} = {2};
    if ({3}.hasOwnProperty({1})) {
        {0} = {3}[{1}];{5}{6}
    }
    else {
        {0} = {3}[{1}] = {4};
    }`;
    private static GROUPING_FETCH: string = `    {0} = {2}[{1}];`;

    private static OBJECT_COMPOSITION: string = `{ {0} }`;

    constructor(groupingExpression) {
        this.id = groupingExpression ? groupingExpression.id : null;
        this.groupingExpression = groupingExpression;
        this.inner = {};
        this.expressions = [];
        this.hasBeenDefined = false;
    }

    getGroupingVariableDeclarations(): string[] {
        const isParentComplex = this.isComplex();
        let declarations = [];

        utils.forEach<GroupingComposition>(this.inner, (innerGroupingComp) => {
            declarations = declarations.concat(
                innerGroupingComp.getGroupingDeclarations(
                    isParentComplex,
                    this.id
                )[0]
            ).concat(
                innerGroupingComp.getGroupingVariableDeclarations()
            );
        });

        return declarations;
    }

    getGroupingDeclarations(isParentComplex: boolean, parentId: string): string[] {
        const parentGrouping: string = parentId || '__groupings__';

        if (isParentComplex) {
            const groupingId = this.id;
            const innerGroupReference = parentGrouping + groupingId;

            return [
                innerGroupReference,
                innerGroupReference + ' = ' + parentGrouping + '.' + groupingId
            ];
        }
        else {
            return [ parentGrouping ];
        }
    }

    defineGroupings(
        groupMap: IGroupMap,
        baseGroupings: GroupingComposition,
        isLastIteration: boolean = true,
        groupingIds: string = '',
        definedGroupings: string[] = []
    ): string {
        return utils.map(this.inner, (groupingComp: GroupingComposition, groupingId: string) => {
            const baseGrouping: GroupingComposition = baseGroupings.inner[groupingId];
            const currentGroupingIds: string = groupingIds + groupingId;
            const parentGrouping = (baseGroupings.groupingExpression ? this.id : '__groupings__') +
                    (baseGroupings.isComplex() ? '.' + groupingId : '');
            let definition: string;

            if (!baseGrouping.hasBeenDefined) {
                const currentGroupMaps = groupMap[currentGroupingIds];

                definition = utils.format(GroupingComposition.GROUPING_DECLARATION_TEMPLATE,
                    groupingComp.id,
                    groupingComp.groupingExpression.valueId,
                    groupingComp.groupingExpression.code,
                    parentGrouping,
                    GroupingComposition.defineGrouping(baseGrouping, currentGroupMaps),
                    GroupingComposition.defineGroupIndexIncrementation(groupingComp),
                    GroupingComposition.defineGroupRowAssignment(groupingComp)
                );

                baseGrouping.hasBeenDefined = true;
                definedGroupings.push(groupingComp.id);
            }
            else if (definedGroupings.indexOf(groupingComp.id) === -1) {
                definition = utils.format(GroupingComposition.GROUPING_FETCH,
                    groupingComp.id,
                    groupingComp.groupingExpression.code,
                    parentGrouping
                );

                definedGroupings.push(groupingComp.id);
            }

            return (definition || '') + '\n' + groupingComp.defineGroupings(groupMap, baseGrouping, isLastIteration, currentGroupingIds, definedGroupings);
        }).join('');
    }

    isComplex(): boolean {
        return !!(
            this.groupingExpression == null ||
            this.getPrimalAggregations().length + utils.keysLength(this.inner) > 0 ||
            this.hasNonAggregatedGroupedFields()
        );
    }

    getAggregations(): Aggregate[] {
        return <Aggregate[]>this.expressions.filter((exp) => exp instanceof Aggregate);
    }

    getPrimalAggregations(): Aggregate[] {
        return <Aggregate[]>this.expressions.filter((exp) => exp instanceof Aggregate && exp.isPrimalAggregation);
    }

    hasNonAggregatedNonGroupedFields(): boolean {
        return utils.some<Expression>(this.expressions, (exp) => exp instanceof Field && exp.hasNonAggregatedFields && !exp.grouping.length);
    }

    hasNonAggregatedGroupedFields(): boolean {
        return utils.some<Expression>(this.expressions, (exp) => exp instanceof Field && exp.hasNonAggregatedFields && exp.grouping.length);
    }

    hasFieldsWithGroupIndex(): boolean {
        return utils.some<Expression>(this.expressions, (exp) => exp.hasGroupIndex);
    }

    static getComposition(expressions: Expression[]): GroupingComposition {
        return expressions.reduce((groupingComposition, expression) => {
            if (expression.isSelectiveType()) {
                const groupComp: GroupingComposition = (<Field|Aggregate>expression).grouping.reduce((groupingComp, groupingExp) => {
                    let innerGrpComp: GroupingComposition = groupingComp.inner[groupingExp.id];

                    if (innerGrpComp === undefined) {
                        groupingComp.inner[groupingExp.id] = innerGrpComp = new GroupingComposition(groupingExp);
                    }

                    return innerGrpComp;
                }, groupingComposition);

                groupComp.expressions.push(expression);
            }

            return groupingComposition;
        }, new GroupingComposition(null));
    }

    static defineGrouping(baseGrouping: GroupingComposition, groupCompositions: GroupComposition[]): string {
        const props: string[] = [];
        let definition: string;

        // Adds declaration of inner groups
        utils.forEach<GroupingComposition>(baseGrouping.inner,
            (gComp) => props.push(gComp.groupingExpression.id + ': {}')
        );
        // Adds declaration of group expressions
        utils.forEach<Aggregate>(baseGrouping.getAggregations(), (exp) => {
            props.push(exp.defineInitialProperty());
            if (exp.hasDistinct) {
                props.push(exp.distinctProperty());
            }
        });

        if (baseGrouping.hasNonAggregatedGroupedFields()) {
            props.push('row: row');
        }

        if (baseGrouping.hasFieldsWithGroupIndex()) {
            props.push('groupIndex: 1');
        }

        utils.forEach<GroupComposition>(groupCompositions, (groupComp: GroupComposition) => {
            if (groupComp.isUngroup) {
                props.push(groupComp.id + ': []');
            }
        });

        definition = props.join(', ');

        return utils.format(GroupingComposition.OBJECT_COMPOSITION, definition);
    }

    private static defineGroupRowAssignment(groupingComp: GroupingComposition): string {
        return groupingComp.hasNonAggregatedGroupedFields() ?
            `\n        ${groupingComp.id}.row = row;` : '';
    }

    private static defineGroupIndexIncrementation(groupingComp: GroupingComposition): string {
        return groupingComp.hasFieldsWithGroupIndex() ?
            `\n        ${groupingComp.id}.groupIndex++;` : '';
    }
}

export type GroupingId = string;
