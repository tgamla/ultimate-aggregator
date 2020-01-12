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
        define(["require", "exports", "../common/utils", "../constants/expressionType", "./expression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var expressionType_1 = require("../constants/expressionType");
    var expression_1 = require("./expression");
    var GroupBy = /** @class */ (function (_super) {
        __extends(GroupBy, _super);
        function GroupBy(rawExpression, queryQuotes, queryExpressions, parentGroupingId) {
            if (queryExpressions === void 0) { queryExpressions = null; }
            if (parentGroupingId === void 0) { parentGroupingId = null; }
            var _this = _super.call(this, expressionType_1.ExpressionType.GROUP_BY, rawExpression, queryQuotes, parentGroupingId) || this;
            _this.fillDefault();
            if (_this.isOverallGrouping()) {
                return _this;
            }
            _this.normalize();
            var sibling = _this.findSibling(queryExpressions);
            if (sibling) {
                return sibling;
            }
            _this.setIds();
            _this.validate();
            // this.checkForIndexes(); // TODO:: in expression
            if (queryExpressions) {
                queryExpressions.push(_this);
            }
            return _this;
        }
        GroupBy.prototype.equal = function (groupBy) {
            return this.id === groupBy.id;
        };
        GroupBy.prototype.isOverallGrouping = function () {
            return this.code === GROUP_BY_ALL;
        };
        GroupBy.getLastGroupingId = function (parentGrouping, currentGrouping) {
            if (currentGrouping && currentGrouping.length) {
                return currentGrouping[currentGrouping.length - 1].id;
            }
            if (parentGrouping && parentGrouping.length) {
                return parentGrouping[parentGrouping.length - 1].id;
            }
            return null;
        };
        GroupBy.compareGrouping = function (groupingA, groupingB) {
            return groupingA.length === groupingB.length &&
                !utils.find(groupingA, function (expA, index) {
                    return !expA.equals(groupingB[index]);
                });
        };
        GroupBy.defineGroupingReference = function (grouping, groupigScope) {
            return utils.reduce(grouping, function (refDef, groupBy, index) {
                var groupByMatch = utils.find(groupigScope, function (groupByRef) { return groupByRef.equals(groupBy); });
                return refDef + '' + (parseInt(index) ? '' : (groupBy.parentGroupingId || '__groupings__')) + '.' + groupBy.id + '[' + groupByMatch.iteratorId + ']';
            }, '');
        };
        GroupBy.isOverall = function (exp) {
            return !exp.code || exp.code === 'ALL' || exp.code === 'true' || exp.code === '*';
        };
        // =========================================================================================================
        // ============================================ PRIVATE METHODS ============================================
        // =========================================================================================================
        GroupBy.prototype.fillDefault = function () {
            if (GroupBy.isOverall(this)) {
                this.code = GROUP_BY_ALL;
            }
        };
        GroupBy.prototype.setIds = function () {
            this.iteratorId = utils.addIdSuffix(this.id, 'I');
            this.valueId = utils.addIdSuffix(this.id, 'Val');
        };
        GroupBy.prototype.findSibling = function (queryExpressions) {
            var _this = this;
            return utils.find(queryExpressions, function (exp) {
                return _this.parentGroupingId === exp.parentGroupingId && _this.equals(exp);
            });
        };
        return GroupBy;
    }(expression_1.Expression));
    exports.GroupBy = GroupBy;
    var GROUP_BY_ALL = 'ALL';
});
