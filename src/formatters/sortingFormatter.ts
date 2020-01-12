import * as utils from '../common/utils';
import { INDENTATION } from '../constants/common';
import * as regexps from '../constants/regexps';
import { OrderBy, Sorting } from '../expressions/orderBy';

export abstract class SortingFromatter {

    static defineSortingFunction(sortFunctionName: string, sorting: Sorting, hasExtendedSorting: boolean): string {
        const comparisonDefinition: string = SortingFromatter.defineComparision(sorting, hasExtendedSorting);
        return `
function ${sortFunctionName}(x, y) {
    return ${comparisonDefinition};
}
`;
    }

    static defineSortedValueReference(expObjRef: string): string {
        return `${expObjRef} = ${expObjRef} ? ${expObjRef}.val : null;`;
    }

    static defineNthSortingOutput(expObjRef: string, comparatorId: string, valRef: string, elementIndex: string): string {
        return (
`${expObjRef} = ${expObjRef}.sort(${comparatorId})[${elementIndex}];
${valRef}`
        );
    }

    static defineComplexSortingOutput(expObjRef: string, comparatorId: string, valRef: string): string {
        return `
__val__ = ${expObjRef}.sort(${comparatorId});
__tempRes__ = [];
__length__ = __val__.length;
for (__i__ = 0; __i__ < __length__; __i__++) {
    __tempRes__.push(__val__[__i__]${valRef});
}
${expObjRef} = __tempRes__;
`;
    }

    static defineComparision(sorting: Sorting, hasExtendedSorting: boolean): string {
        const comparisions = utils.reduce(sorting, (acc: string, orderBy: OrderBy) => {
            let compareVal: string;

            if (hasExtendedSorting) {
                compareVal = '.' + (orderBy.isOrderedByValue() ? 'val' : orderBy.id);
            }
            else {
                compareVal = '';
            }

            const isASC: boolean = orderBy.isAscending();

            return utils.format(
                acc,
                SortingFromatter.defineValuesComparision(
                    '{0}',
                    (isASC ? 'x' : 'y') + compareVal,
                    (isASC ? 'y' : 'x') + compareVal
                )
            );
        }, '{0}');

        return utils.format(comparisions, '0');
    }

    static defineValuesComparision(innerComparision: string, valueX: string, valueY: string): string {
        return (
`(${valueX} === ${valueY} ?
    ${innerComparision} :
    (
        ${valueX} != null ?
        (${valueY} != null ? (${valueX} > ${valueY} ? 1 : -1) : 1) :
        (${valueY} != null ? -1 : (${valueX} === null ? 1 : -1))
    )
)`
        ).replace(regexps.NEW_LINE, '\n' + INDENTATION);
    }

    static defineValuesDeclaration(valRef: string, xValue: string, yValue: string): string {
        return (
`    var __x${valRef}__ = ${xValue};
    var __y${valRef}__ = ${yValue};
`
        );
    }
}
