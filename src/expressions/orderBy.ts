import * as utils from '../common/utils';
import { ExpressionType } from '../constants/expressionType';
import * as REGEXPS from '../constants/regexps';
import { SortingFromatter } from '../formatters/sortingFormatter';
import { GroupComposition } from '../helpers/groupComposition';
import { Expression, IQuotes } from './expression';

export class OrderBy extends Expression {

    orderDirection: OrderByDirection;

    constructor(
        rawExpression: any,
        queryQuotes: IQuotes,
        queryExpressions: Expression[] = null,
        parentGroupingId: string = null
    ) {
        super(ExpressionType.ORDER_BY, rawExpression, queryQuotes, parentGroupingId);
        this.normalize();

        const sibling: OrderBy = this.findSibling(queryExpressions);
        if (sibling) {
            return sibling;
        }

        this.parseOrderDirection();
        this.fillDefault();
        super.validate();
        // this.checkForIndexes(); // TODO:: in expression
        if (queryExpressions) {
            queryExpressions.push(this);
        }
    }

    equals(oderBy: OrderBy): boolean {
        return super.equals(oderBy) && this.orderDirection === oderBy.orderDirection;
    }

    compareToAggregation(exp: Expression): void {
        if (!this.isOrderedByValue() && super.equals(exp)) {
            this.code = ORDER_BY_VALUE;
        }
    }

    isOrderedByValue(): boolean {
        return this.code === ORDER_BY_VALUE;
    }

    isAscending(): boolean {
        return this.orderDirection === OrderByDirection.ASC;
    }

    static compareSorting(sortingA: Sorting, sortingB: Sorting): boolean {
        return (
                sortingA instanceof Array && sortingB instanceof Array &&
                sortingA.length === sortingB.length &&
                !utils.some<OrderBy>(sortingA, (orderByA, index) => !orderByA.equals(sortingB[index]))
            ) ||
            (sortingA === sortingB);
    }

    static defineGroupComparator(group: GroupComposition): string {
        const comparatorId = utils.addIdSuffix(group.id, 'Comparator');
        const comparatorDefinition = OrderBy.defineComparator(group.sorting);

        return utils.format(
            `function ${comparatorId}(out, __outB__) {
${comparatorDefinition}
}`
        );
    }

    static defineComparator(sorting: Sorting): string {
        let valuesDeclarations: string = '';
        const comparisons: string = utils.reduce<OrderBy, string>(sorting, (compDef, orderBy, index) => {
            const isASC: boolean = orderBy.isAscending();

            if (orderBy.isOrderedByValue()) {
                return utils.format(
                    compDef,
                    SortingFromatter.defineValuesComparision(
                        '{0}',
                        (isASC ? 'out' : '__outB__'),
                        (isASC ? '__outB__' : 'out')
                    )
                );
            }
            else {
                const valRef: string = parseInt(index) === 0 ? '' : index;
                const xValue: string = orderBy.code;
                const yValue: string = orderBy.code.replace(REGEXPS.OUT, '$1__outB__$2');

                valuesDeclarations += SortingFromatter.defineValuesDeclaration(valRef, xValue, yValue);

                return utils.format(
                    compDef,
                    SortingFromatter.defineValuesComparision(
                        '{0}',
                        '__' + (isASC ? 'x' : 'y') + valRef + '__',
                        '__' + (isASC ? 'y' : 'x') + valRef + '__'
                    )
                );
            }
        }, '{0}');

        return valuesDeclarations + '\n    return ' + utils.format(comparisons, '0');
    }

    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================

    private parseOrderDirection(): void {
        this.code = this.code.replace(REGEXPS.ORDER_BY_DIRECTION, (...args: any[]) => {
            this.orderDirection = <OrderByDirection>OrderByDirection[args[1]];
            return '';
        });

        if (!this.orderDirection) {
            this.orderDirection = OrderByDirection.ASC;
        }
    }

    private fillDefault(): void {
        if (!this.code) {
            this.code = ORDER_BY_VALUE;
        }
    }

    private findSibling(queryExpressions: Expression[]): OrderBy {
        const sibling: OrderBy = null;

        // TODO::

        return sibling;
    }
}

export enum OrderByDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

export type Sorting = OrderBy[];

const ORDER_BY_VALUE = 'VALUE';
