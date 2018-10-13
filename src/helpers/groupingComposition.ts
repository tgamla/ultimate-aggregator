import * as utils from '../common/utils';
import { Expression } from '../prototypes/expression';
import { Field } from '../expressions/field';
import { Aggregate } from '../expressions/aggregate';
import { GroupBy } from '../expressions/groupBy';

export class GroupingComposition {
    id: GroupingId;
    groupingExpression: GroupBy;
    inner: { GroupingId?: GroupingComposition };
    expressions: Array<Expression>;
    hasBeenDefined: boolean;

    constructor(groupingExpression) {
        this.id = groupingExpression ? groupingExpression.id : null;
        this.groupingExpression = groupingExpression;
        this.inner = {};
        this.expressions = [];
        this.hasBeenDefined = false;
    }

    isComplex(): boolean {
        return (
            this.groupingExpression == null ||
            this.getPrimalAggregations().length + utils.keysLength(this.inner) > 0 ||
            this.hasNonAggregatedGroupedFields()
        ) ? true : false;
    }

    getAggregations(): Array<Aggregate> {
        return <Array<Aggregate>>this.expressions.filter((exp) => exp instanceof Aggregate);
    }

    getPrimalAggregations(): Array<Aggregate> {
        return <Array<Aggregate>>this.expressions.filter((exp) => exp instanceof Aggregate && exp.isPrimalAggregation);
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
}

type GroupingId = string;