import * as utils from '../common/utils';
import { Expression } from '../expressions/expression';
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

    getGroupingVariableDeclarations(): Array<string> {
        var declarations = [];
        var isParentComplex = this.isComplex();

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
    
    getGroupingDeclarations(isParentComplex: boolean, parentId: string): Array<string> {
        var parentGrouping: string = parentId || '__groupings__';

        if (isParentComplex) {
            var groupingId = this.id;
            var innerGroupReference = parentGrouping + groupingId;
            return [
                innerGroupReference,
                innerGroupReference + ' = ' + parentGrouping + '.' + groupingId
            ]
        }
        else {
            return [ parentGrouping ];
        }
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

    static getComposition(expressions: Array<Expression>): GroupingComposition {
        return expressions.reduce((groupingComposition, expression) => {
            if (expression.isSelectiveType()) {
                var groupComp: GroupingComposition = (<Field|Aggregate>expression).grouping.reduce((groupingComp, groupingExp) => {
                    var innerGrpComp: GroupingComposition = groupingComp.inner[groupingExp.id];
    
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
}

type GroupingId = string;