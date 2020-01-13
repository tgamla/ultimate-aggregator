var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../common/utils", "../constants/expressionType", "../constants/regexps", "../formatters/sortingFormatter", "./expression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var expressionType_1 = require("../constants/expressionType");
    var REGEXPS = require("../constants/regexps");
    var sortingFormatter_1 = require("../formatters/sortingFormatter");
    var expression_1 = require("./expression");
    var OrderBy = /** @class */ (function (_super) {
        __extends(OrderBy, _super);
        function OrderBy(rawExpression, queryQuotes, queryExpressions, parentGroupingId) {
            if (queryExpressions === void 0) { queryExpressions = null; }
            if (parentGroupingId === void 0) { parentGroupingId = null; }
            var _this = _super.call(this, expressionType_1.ExpressionType.ORDER_BY, rawExpression, queryQuotes, parentGroupingId) || this;
            _this.normalize();
            var sibling = _this.findSibling(queryExpressions);
            if (sibling) {
                return sibling;
            }
            _this.parseOrderDirection();
            _this.fillDefault();
            _super.prototype.validate.call(_this);
            // this.checkForIndexes(); // TODO:: in expression
            if (queryExpressions) {
                queryExpressions.push(_this);
            }
            return _this;
        }
        OrderBy.prototype.equals = function (oderBy) {
            return _super.prototype.equals.call(this, oderBy) && this.orderDirection === oderBy.orderDirection;
        };
        OrderBy.prototype.compareToAggregation = function (exp) {
            if (!this.isOrderedByValue() && _super.prototype.equals.call(this, exp)) {
                this.code = ORDER_BY_VALUE;
            }
        };
        OrderBy.prototype.isOrderedByValue = function () {
            return this.code === ORDER_BY_VALUE;
        };
        OrderBy.prototype.isAscending = function () {
            return this.orderDirection === OrderByDirection.ASC;
        };
        OrderBy.compareSorting = function (sortingA, sortingB) {
            return (sortingA instanceof Array && sortingB instanceof Array &&
                sortingA.length === sortingB.length &&
                !utils.some(sortingA, function (orderByA, index) { return !orderByA.equals(sortingB[index]); })) ||
                (sortingA === sortingB);
        };
        OrderBy.defineGroupComparator = function (group) {
            var comparatorId = utils.addIdSuffix(group.id, 'Comparator');
            var comparatorDefinition = OrderBy.defineComparator(group.sorting);
            return utils.format("function " + comparatorId + "(out, __outB__) {\n" + comparatorDefinition + "\n}");
        };
        OrderBy.defineComparator = function (sorting) {
            var valuesDeclarations = '';
            var comparisons = utils.reduce(sorting, function (compDef, orderBy, index) {
                var isASC = orderBy.isAscending();
                if (orderBy.isOrderedByValue()) {
                    return utils.format(compDef, sortingFormatter_1.SortingFormatter.defineValuesComparision('{0}', (isASC ? 'out' : '__outB__'), (isASC ? '__outB__' : 'out')));
                }
                else {
                    var valRef = parseInt(index) === 0 ? '' : index;
                    var xValue = orderBy.code;
                    var yValue = orderBy.code.replace(REGEXPS.OUT, '$1__outB__$2');
                    valuesDeclarations += sortingFormatter_1.SortingFormatter.defineValuesDeclaration(valRef, xValue, yValue);
                    return utils.format(compDef, sortingFormatter_1.SortingFormatter.defineValuesComparision('{0}', '__' + (isASC ? 'x' : 'y') + valRef + '__', '__' + (isASC ? 'y' : 'x') + valRef + '__'));
                }
            }, '{0}');
            return valuesDeclarations + '\n    return ' + utils.format(comparisons, '0');
        };
        // =========================================================================================================
        // ============================================ PRIVATE METHODS ============================================
        // =========================================================================================================
        OrderBy.prototype.parseOrderDirection = function () {
            var _this = this;
            this.code = this.code.replace(REGEXPS.ORDER_BY_DIRECTION, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.orderDirection = OrderByDirection[args[1]];
                return '';
            });
            if (!this.orderDirection) {
                this.orderDirection = OrderByDirection.ASC;
            }
        };
        OrderBy.prototype.fillDefault = function () {
            if (!this.code) {
                this.code = ORDER_BY_VALUE;
            }
        };
        OrderBy.prototype.findSibling = function (queryExpressions) {
            var sibling = null;
            // TODO::
            return sibling;
        };
        return OrderBy;
    }(expression_1.Expression));
    exports.OrderBy = OrderBy;
    var OrderByDirection;
    (function (OrderByDirection) {
        OrderByDirection["ASC"] = "ASC";
        OrderByDirection["DESC"] = "DESC";
    })(OrderByDirection = exports.OrderByDirection || (exports.OrderByDirection = {}));
    var ORDER_BY_VALUE = 'VALUE';
});
