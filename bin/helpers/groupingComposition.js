(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../common/utils", "../expressions/field", "../expressions/aggregate"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var field_1 = require("../expressions/field");
    var aggregate_1 = require("../expressions/aggregate");
    var GroupingComposition = /** @class */ (function () {
        function GroupingComposition(groupingExpression) {
            this.id = groupingExpression ? groupingExpression.id : null;
            this.groupingExpression = groupingExpression;
            this.inner = {};
            this.expressions = [];
            this.hasBeenDefined = false;
        }
        GroupingComposition.prototype.isComplex = function () {
            return (this.groupingExpression == null ||
                this.getPrimalAggregations().length + utils.keysLength(this.inner) > 0 ||
                this.hasNonAggregatedGroupedFields()) ? true : false;
        };
        GroupingComposition.prototype.getAggregations = function () {
            return this.expressions.filter(function (exp) { return exp instanceof aggregate_1.Aggregate; });
        };
        GroupingComposition.prototype.getPrimalAggregations = function () {
            return this.expressions.filter(function (exp) { return exp instanceof aggregate_1.Aggregate && exp.isPrimalAggregation; });
        };
        GroupingComposition.prototype.hasNonAggregatedNonGroupedFields = function () {
            return utils.some(this.expressions, function (exp) { return exp instanceof field_1.Field && exp.hasNonAggregatedFields && !exp.grouping.length; });
        };
        GroupingComposition.prototype.hasNonAggregatedGroupedFields = function () {
            return utils.some(this.expressions, function (exp) { return exp instanceof field_1.Field && exp.hasNonAggregatedFields && exp.grouping.length; });
        };
        GroupingComposition.prototype.hasFieldsWithGroupIndex = function () {
            return utils.some(this.expressions, function (exp) { return exp.hasGroupIndex; });
        };
        return GroupingComposition;
    }());
    exports.GroupingComposition = GroupingComposition;
});
