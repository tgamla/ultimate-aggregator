(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../common/utils", "../constants/common", "../constants/regexps"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var common_1 = require("../constants/common");
    var regexps = require("../constants/regexps");
    var SortingFromatter = /** @class */ (function () {
        function SortingFromatter() {
        }
        SortingFromatter.defineSortingFunction = function (sortFunctionName, sorting, hasExtendedSorting) {
            var comparisonDefinition = SortingFromatter.defineComparision(sorting, hasExtendedSorting);
            return "\nfunction " + sortFunctionName + "(x, y) {\n    return " + comparisonDefinition + ";\n}\n";
        };
        SortingFromatter.defineSortedValueReference = function (expObjRef) {
            return expObjRef + " = " + expObjRef + " ? " + expObjRef + ".val : null;";
        };
        SortingFromatter.defineNthSortingOutput = function (expObjRef, comparatorId, valRef, elementIndex) {
            return (expObjRef + " = " + expObjRef + ".sort(" + comparatorId + ")[" + elementIndex + "];\n" + valRef);
        };
        SortingFromatter.defineComplexSortingOutput = function (expObjRef, comparatorId, valRef) {
            return "\n__val__ = " + expObjRef + ".sort(" + comparatorId + ");\n__tempRes__ = [];\n__length__ = __val__.length;\nfor (__i__ = 0; __i__ < __length__; __i__++) {\n    __tempRes__.push(__val__[__i__]" + valRef + ");\n}\n" + expObjRef + " = __tempRes__;\n";
        };
        SortingFromatter.defineComparision = function (sorting, hasExtendedSorting) {
            var comparisions = utils.reduce(sorting, function (acc, orderBy) {
                var compareVal;
                if (hasExtendedSorting) {
                    compareVal = '.' + (orderBy.isOrderedByValue() ? 'val' : orderBy.id);
                }
                else {
                    compareVal = '';
                }
                var isASC = orderBy.isAscending();
                return utils.format(acc, SortingFromatter.defineValuesComparision('{0}', (isASC ? 'x' : 'y') + compareVal, (isASC ? 'y' : 'x') + compareVal));
            }, '{0}');
            return utils.format(comparisions, '0');
        };
        SortingFromatter.defineValuesComparision = function (innerComparision, valueX, valueY) {
            return ("(" + valueX + " === " + valueY + " ?\n    " + innerComparision + " :\n    (\n        " + valueX + " != null ?\n        (" + valueY + " != null ? (" + valueX + " > " + valueY + " ? 1 : -1) : 1) :\n        (" + valueY + " != null ? -1 : (" + valueX + " === null ? 1 : -1))\n    )\n)").replace(regexps.NEW_LINE, '\n' + common_1.INDENTATION);
        };
        SortingFromatter.defineValuesDeclaration = function (valRef, xValue, yValue) {
            return ("    var __x" + valRef + "__ = " + xValue + ";\n    var __y" + valRef + "__ = " + yValue + ";\n");
        };
        return SortingFromatter;
    }());
    exports.SortingFromatter = SortingFromatter;
});
