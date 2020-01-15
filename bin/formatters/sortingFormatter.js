"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../common/utils");
var common_1 = require("../constants/common");
var regexps = require("../constants/regexps");
var SortingFormatter = /** @class */ (function () {
    function SortingFormatter() {
    }
    SortingFormatter.defineSortingFunction = function (sortFunctionName, sorting, hasExtendedSorting) {
        var comparisonDefinition = SortingFormatter.defineComparision(sorting, hasExtendedSorting);
        return "\nfunction " + sortFunctionName + "(x, y) {\n    return " + comparisonDefinition + ";\n}\n";
    };
    SortingFormatter.defineSortedValueReference = function (expObjRef) {
        return expObjRef + " = " + expObjRef + " ? " + expObjRef + ".val : null;";
    };
    SortingFormatter.defineNthSortingOutput = function (expObjRef, comparatorId, valRef, elementIndex) {
        return (expObjRef + " = " + expObjRef + ".sort(" + comparatorId + ")[" + elementIndex + "];\n" + valRef);
    };
    SortingFormatter.defineComplexSortingOutput = function (expObjRef, comparatorId, valRef) {
        return "\n__val__ = " + expObjRef + ".sort(" + comparatorId + ");\n__tempRes__ = [];\n__length__ = __val__.length;\nfor (__i__ = 0; __i__ < __length__; __i__++) {\n    __tempRes__.push(__val__[__i__]" + valRef + ");\n}\n" + expObjRef + " = __tempRes__;\n";
    };
    SortingFormatter.defineComparision = function (sorting, hasExtendedSorting) {
        var comparisions = utils.reduce(sorting, function (acc, orderBy) {
            var compareVal;
            if (hasExtendedSorting) {
                compareVal = '.' + (orderBy.isOrderedByValue() ? 'val' : orderBy.id);
            }
            else {
                compareVal = '';
            }
            var isASC = orderBy.isAscending();
            return utils.format(acc, SortingFormatter.defineValuesComparision('{0}', (isASC ? 'x' : 'y') + compareVal, (isASC ? 'y' : 'x') + compareVal));
        }, '{0}');
        return utils.format(comparisions, '0');
    };
    SortingFormatter.defineValuesComparision = function (innerComparision, valueX, valueY) {
        return ("(" + valueX + " === " + valueY + " ?\n    " + innerComparision + " :\n    (\n        " + valueX + " != null ?\n        (" + valueY + " != null ? (" + valueX + " > " + valueY + " ? 1 : -1) : 1) :\n        (" + valueY + " != null ? -1 : (" + valueX + " === null ? 1 : -1))\n    )\n)").replace(regexps.NEW_LINE, '\n' + common_1.INDENTATION);
    };
    SortingFormatter.defineValuesDeclaration = function (valRef, xValue, yValue) {
        return ("    var __x" + valRef + "__ = " + xValue + ";\n    var __y" + valRef + "__ = " + yValue + ";\n");
    };
    return SortingFormatter;
}());
exports.SortingFormatter = SortingFormatter;
