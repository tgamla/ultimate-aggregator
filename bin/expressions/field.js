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
        define(["require", "exports", "../common/utils", "../common/logger", "../prototypes/expression", "./groupBy", "./aggregate"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var logger_1 = require("../common/logger");
    var expression_1 = require("../prototypes/expression");
    var groupBy_1 = require("./groupBy");
    var aggregate_1 = require("./aggregate");
    var Field = /** @class */ (function (_super) {
        __extends(Field, _super);
        function Field(logger, rawExpression, queryQuotes, queryExpressions, groupId, grouping, isWithinUngroup, level) {
            if (groupId === void 0) { groupId = null; }
            if (grouping === void 0) { grouping = []; }
            if (isWithinUngroup === void 0) { isWithinUngroup = false; }
            if (level === void 0) { level = 0; }
            var _this = _super.call(this, expression_1.Type.FIELD, rawExpression, queryQuotes, groupBy_1.GroupBy.getLastGroupingId(grouping)) || this;
            _this.level = level;
            _this.grouping = utils.copy(grouping);
            _this.addGroupId(groupId);
            _this.normalize();
            var sibling = _this.findSibling(queryExpressions);
            if (sibling) {
                return sibling;
            }
            _this.hasNonAggregatedFields = false;
            _this.innerExpressions = new Array();
            aggregate_1.AggregationParser.parse(_this, logger, queryExpressions, queryQuotes, grouping, groupId, isWithinUngroup);
            _this.validate();
            _this.handleGroupIndex();
            _this.handleNonAggrFields();
            _this.handleIndex(logger, isWithinUngroup);
            queryExpressions.push(_this);
            return _this;
        }
        // =========================================================================================================
        // ============================================ PRIVATE METHODS ============================================
        // =========================================================================================================
        Field.prototype.findSibling = function (queryExpressions) {
            var _this = this;
            var sibling = utils.find(queryExpressions, function (exp) {
                return _this.equals(exp) && groupBy_1.GroupBy.compareGrouping(_this.grouping, exp.grouping);
            });
            if (sibling) {
                if (this.level > sibling.level) {
                    sibling.level = this.level;
                }
                sibling.addGroupId(this.groupIds[0]);
            }
            return sibling;
        };
        Field.prototype.handleNonAggrFields = function () {
            var _this = this;
            if (this.parentGroupingId && !this.level) {
                this.code = this.code.replace(expression_1.ExpressionRegExps.ROW, function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this.hasNonAggregatedFields = true;
                    return args[1] + _this.parentGroupingId + '.row' + args[2];
                });
            }
        };
        Field.prototype.handleIndex = function (logger, isWithinUngroup) {
            if (this.checkIndex()) {
                if (!isWithinUngroup && this.parentGroupingId) {
                    logger.warning(logger_1.MessageCodes.INDEX_USED_IN_GROUP, this.raw);
                }
                else {
                    this.hasIndex = true;
                }
            }
        };
        return Field;
    }(expression_1.Expression));
    exports.Field = Field;
});
