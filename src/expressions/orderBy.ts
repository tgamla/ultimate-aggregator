import * as utils from '../common/utils';
import { Expression, Quotes, ExpressionRegExps } from './expression';
import { QueryFormatter as Formatter } from '../common/formatter';
import { ExpressionType } from '../constants/expressionType';


export class OrderBy extends Expression {
    
    public orderDirection: OrderByDirection;
    
    constructor(
        rawExpression: any,
        queryQuotes: Quotes,
        queryExpressions: Array<Expression> = null,
        parentGroupingId: string = null
    ) {
        super(ExpressionType.ORDER_BY, rawExpression, queryQuotes, parentGroupingId);
        this.normalize();
        
        var sibling: OrderBy = this.findSibling(queryExpressions);
        if (sibling) {
            return sibling;
        }

        this.parseOrderDirection();
        this.fillDefault();
        super.validate();
        this.checkForIndexes();
        if (queryExpressions) {
            queryExpressions.push(this);
        }
    }

    public equals(oderBy: OrderBy): boolean {
        return super.equals(oderBy) && this.orderDirection === oderBy.orderDirection;
    }

    public compareToAggregation(exp: Expression): void {
        if (!this.isOrderedByValue() && super.equals(exp)) {
            this.code = ORDER_BY_VALUE;
        }
    }

    public isOrderedByValue(): boolean {
        return this.code === ORDER_BY_VALUE;
    }

    public isAscending(): boolean {
        return this.orderDirection === OrderByDirection.ASC;
    }

    public static compareSorting(sortingA: Sorting, sortingB: Sorting): boolean {
        return (
                sortingA instanceof Array && sortingB instanceof Array &&
                sortingA.length == sortingB.length &&
                !utils.some<OrderBy>(sortingA, (orderByA, index) => !orderByA.equals(sortingB[index]))
            ) ||
            (sortingA === sortingB);
    }

    public static defineComparator(sorting: Sorting): string {
        var valuesDeclarations: string = '';
        var comparisions: string = utils.reduce<OrderBy, string>(sorting, (compDef, orderBy, index) => {
            var isASC: boolean = orderBy.isAscending();

            if (orderBy.isOrderedByValue()) {
                return utils.format(
                    compDef,
                    Formatter.formatComparision(
                        '{0}',
                        (isASC ? 'out' : '__outB__'),
                        (isASC ? '__outB__' : 'out')
                    )
                );
            }
            else {
                var valRef: string = parseInt(index) === 0 ? '' : index;
                var xValue: string = orderBy.code;
                var yValue: string = orderBy.code.replace(ExpressionRegExps.OUT, '$1__outB__$2');

                valuesDeclarations += utils.format(
`    var __x{0}__ = {1};
    var __y{0}__ = {2};
`,
                    valRef,
                    xValue,
                    yValue
                );
    
                return utils.format(
                    compDef,
                    Formatter.formatComparision(
                        '{0}',
                        '__' + (isASC ? 'x' : 'y') + valRef + '__',
                        '__' + (isASC ? 'y' : 'x') + valRef + '__'
                    )
                );
            }          
        }, '{0}');

        return valuesDeclarations + '\n    return ' + utils.format(comparisions, '0');
    }

    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================

    private parseOrderDirection(): void {        
        this.code = this.code.replace(ExpressionRegExps.ORDER_BY_DIRECTION, (...args: Array<any>) => {
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

    private findSibling(queryExpressions: Array<Expression>): OrderBy {
        var sibling: OrderBy;

        // TODO::

        return sibling;
    }

    private checkForIndexes(): void {
        /* TODO::
        if (this.checkIndex()) {
            // TODO:: throw warning
        }
        if (checkForGroupIndex()) {
            // TODO:: throw warning
        }
        */
    }

}

export enum OrderByDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

export type Sorting = Array<OrderBy>;

const ORDER_BY_VALUE = 'VALUE';