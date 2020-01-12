import * as utils from '../common/utils';
import { ExpressionType } from '../constants/expressionType';
import { Expression, IQuotes } from './expression';

export class GroupBy extends Expression {

    iteratorId: string;
    valueId: string;

    constructor(
        rawExpression: any,
        queryQuotes: IQuotes,
        queryExpressions: Expression[] = null,
        parentGroupingId: string = null
    ) {
        super(ExpressionType.GROUP_BY, rawExpression, queryQuotes, parentGroupingId);

        this.fillDefault();
        if (this.isOverallGrouping()) {
            return this;
        }

        this.normalize();

        const sibling: GroupBy = this.findSibling(queryExpressions);
        if (sibling) {
            return sibling;
        }

        this.setIds();
        this.validate();
        // this.checkForIndexes(); // TODO:: in expression
        if (queryExpressions) {
            queryExpressions.push(this);
        }
    }

    equal(groupBy: GroupBy) {
        return this.id === groupBy.id;
    }

    isOverallGrouping(): boolean {
        return this.code === GROUP_BY_ALL;
    }

    static getLastGroupingId(parentGrouping: Grouping, currentGrouping?: Grouping): string {
        if (currentGrouping && currentGrouping.length) {
            return currentGrouping[currentGrouping.length - 1].id;
        }
        if (parentGrouping && parentGrouping.length) {
            return parentGrouping[parentGrouping.length - 1].id;
        }
        return null;
    }

    static compareGrouping(groupingA: Grouping, groupingB: Grouping): boolean {
        return groupingA.length === groupingB.length &&
            !utils.find<Expression>(groupingA, (expA, index) => {
                return !expA.equals(groupingB[index]);
            });
    }

    static defineGroupingReference(grouping: Grouping, groupigScope: Grouping): string {
        return utils.reduce(grouping, (refDef, groupBy: GroupBy, index) => {
            const groupByMatch = utils.find<GroupBy>(groupigScope, (groupByRef) => groupByRef.equals(groupBy));
            return refDef + '' + (parseInt(index) ? '' : (groupBy.parentGroupingId || '__groupings__')) + '.' + groupBy.id + '[' + groupByMatch.iteratorId + ']';
        }, '');
    }

    static isOverall(exp: Expression): boolean {
        return !exp.code || exp.code === 'ALL' || exp.code === 'true' || exp.code === '*';
    }

    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================

    private fillDefault(): void {
        if (GroupBy.isOverall(this)) {
            this.code = GROUP_BY_ALL;
        }
    }

    private setIds(): void {
        this.iteratorId = utils.addIdSuffix(this.id, 'I');
        this.valueId = utils.addIdSuffix(this.id, 'Val');
    }

    private findSibling(queryExpressions: Expression[]): GroupBy {
        return utils.find<GroupBy>(queryExpressions, (exp) =>
            this.parentGroupingId === exp.parentGroupingId && this.equals(exp)
        );
    }
}

export type Grouping = GroupBy[];

const GROUP_BY_ALL = 'ALL';
