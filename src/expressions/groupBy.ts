import * as utils from "../common/utils";
import { Expression, Type as ExpressionType, Quotes } from '../prototypes/expression';

export class GroupBy extends Expression {
    
    public iteratorId: string;
    public valueId: string;
    public isOverType: boolean;
    
    constructor(
        rawExpression: any,
        queryQuotes: Quotes,
        queryExpressions: Array<Expression> = null,
        parentGroupingId: string = null
    ) {
        super(ExpressionType.GROUP_BY, rawExpression, queryQuotes, parentGroupingId);

        this.fillDefault();
        if (this.isOverallGrouping()) {
            return this;
        }

        this.normalize();

        var sibling: GroupBy;
        if (sibling = this.findSibling(queryExpressions)) {
            return sibling;
        }

        this.setIds();
        this.validate();
        // this.handleIndexes(); TODO:: Expression should have this
        if (queryExpressions) {
            queryExpressions.push(this);
        }
    }

    public equal(groupBy: GroupBy) {
        return this.id === groupBy.id;
    }

    public isOverallGrouping(): boolean {
        return this.code === GROUP_BY_ALL;
    }
    
    public static getLastGroupingId(parentGrouping: Grouping, currentGrouping?: Grouping): string {
        if (currentGrouping && currentGrouping.length) {
            return currentGrouping[currentGrouping.length - 1].id;
        }
        if (parentGrouping && parentGrouping.length) {
            return parentGrouping[parentGrouping.length - 1].id;
        }
        return null;
    }

    public static compareGrouping(groupingA: Grouping, groupingB: Grouping): boolean {
        return groupingA.length == groupingB.length &&
            !utils.find<Expression>(groupingA, (expA, index) => {
                return !expA.equals(groupingB[index]);
            });
    }

    public static defineGroupingReference(grouping: Grouping, groupigScope: Grouping): string {
        return utils.reduce(grouping, (refDef, groupBy: GroupBy, index) => {
            var groupByMatch = utils.find<GroupBy>(groupigScope, (groupByRef) => groupByRef.equals(groupBy));
            return refDef + '' + (parseInt(index) ? '' : (groupBy.parentGroupingId || '__groupings__')) + '.' + groupBy.id + '[' + groupByMatch.iteratorId + ']'
        }, '');
    }

    public static isOverall(exp: Expression): boolean {
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

    private findSibling(queryExpressions: Array<Expression>): GroupBy {
        return utils.find<GroupBy>(queryExpressions, (exp) => 
            this.parentGroupingId === exp.parentGroupingId && this.equals(exp)
        );
    }
}

export type Grouping = Array<GroupBy>;

const GROUP_BY_ALL = 'ALL';