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
        define(["require", "exports", "../common/utils", "./expression", "./groupBy", "./orderBy", "../helpers/aggregateParser", "../constants/aggregationType", "../constants/expressionType", "../formatters/aggregateFormatter", "../formatters/sortingFormatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var expression_1 = require("./expression");
    var groupBy_1 = require("./groupBy");
    var orderBy_1 = require("./orderBy");
    var aggregateParser_1 = require("../helpers/aggregateParser");
    var aggregationType_1 = require("../constants/aggregationType");
    var expressionType_1 = require("../constants/expressionType");
    var aggregateFormatter_1 = require("../formatters/aggregateFormatter");
    var sortingFormatter_1 = require("../formatters/sortingFormatter");
    var Aggregate = /** @class */ (function (_super) {
        __extends(Aggregate, _super);
        function Aggregate(logger, rawExpression, aggregation, queryQuotes, queryExpressions, groupId, grouping, level, isPrimalAggregation, args, over, sorting) {
            if (groupId === void 0) { groupId = null; }
            if (grouping === void 0) { grouping = []; }
            if (level === void 0) { level = 0; }
            if (isPrimalAggregation === void 0) { isPrimalAggregation = false; }
            if (args === void 0) { args = null; }
            if (over === void 0) { over = null; }
            if (sorting === void 0) { sorting = null; }
            var _this = this;
            var groupingId = over && !over.length ? null : groupBy_1.GroupBy.getLastGroupingId(grouping, over);
            _this = _super.call(this, expressionType_1.ExpressionType.AGGREGATE, rawExpression, queryQuotes, groupingId) || this;
            _this.aggregation = aggregation;
            _this.level = level;
            _this.isPrimalAggregation = isPrimalAggregation;
            _this.arguments = utils.map(args, function (arg) { return new expression_1.Expression(expressionType_1.ExpressionType.ARGUMENT, arg, queryQuotes); });
            _this.grouping = over ? over : utils.copy(grouping);
            _this.sorting = sorting;
            _this.hasGroupByOver = over ? true : false;
            _this.hasDistinct = false;
            _this.innerExpressions = new Array();
            _this.parseDistinct(logger);
            _this.fillDefault();
            aggregateParser_1.AggregationParser.parse(_this, logger, queryExpressions, queryQuotes, grouping, groupId);
            _this.handleGroupIndex();
            _this.normalize();
            _this.validate();
            _this.addGroupId(groupId);
            var sibling = _this.findSibling(queryExpressions);
            if (sibling) {
                return sibling;
            }
            _this.handleIndex();
            _this.matchSorting();
            if (queryExpressions) {
                queryExpressions.push(_this);
            }
            return _this;
        }
        Aggregate.prototype.equals = function (aggregate) {
            return _super.prototype.equals.call(this, aggregate) && this.hasDistinct === aggregate.hasDistinct && this.aggregation === aggregate.aggregation &&
                (groupBy_1.GroupBy.compareGrouping(this.grouping, aggregate.grouping) && orderBy_1.OrderBy.compareSorting(this.sorting, aggregate.sorting));
        };
        Aggregate.prototype.isPrimalNonOver = function () {
            return !this.hasGroupByOver && this.isPrimalAggregation;
        };
        Aggregate.prototype.isPostProcessingType = function () {
            return this.aggregation === aggregationType_1.AggregationType.CONCAT || this.aggregation === aggregationType_1.AggregationType.AVG ||
                (this.sorting && this.aggregation === aggregationType_1.AggregationType.NTH);
        };
        Aggregate.prototype.getValRef = function () {
            return (this.hasExtendedSorting() && (this.aggregation === aggregationType_1.AggregationType.FIRST || this.aggregation === aggregationType_1.AggregationType.LAST)) ? '.val' : '';
        };
        Aggregate.prototype.defineInitialProperty = function () {
            return this.id + ': ' + this.defineInitVal();
        };
        Aggregate.prototype.distinctProperty = function () {
            var distinctLength = (this.aggregation === aggregationType_1.AggregationType.NTH && !this.sorting && this.hasDistinct) ?
                (', ' + utils.addIdSuffix(this.id, 'DistinctLength') + ': 1') : '';
            return utils.addIdSuffix(this.id, 'Distinct') + ': {}' + distinctLength;
        };
        Aggregate.prototype.defineAggregation = function () {
            var expObjDef = this.defineExpObjRef();
            if (this.countByAll()) {
                return expObjDef + '++;';
            }
            else if (this.sorting) {
                return this.defineAggregationWithSorting(expObjDef);
            }
            else if (this.aggregation === aggregationType_1.AggregationType.NTH) {
                var nthNo = this.getFirstArgument() || '1';
                if (this.hasDistinct) {
                    return utils.format(aggregateFormatter_1.AggregateTemplates.DISTINCT_NTH, this.code, expObjDef, nthNo, this.defineValReference('Distinct'), this.defineValReference('DistinctLength'));
                }
                else {
                    return utils.format(aggregateFormatter_1.AggregateTemplates.NTH, this.code, expObjDef, this.hasGroupIndex ? this.parentGroupingId + '.groupIndex' : 'index', nthNo);
                }
            }
            else if (this.aggregation === aggregationType_1.AggregationType.CONCAT) {
                if (this.hasDistinct) {
                    return utils.format(aggregateFormatter_1.AggregateTemplates.DISTINCT_CONCAT, this.code, expObjDef, '__val__', this.defineValReference('Distinct'));
                }
                else {
                    return utils.format(aggregateFormatter_1.AggregateTemplates.CONCAT, this.code, expObjDef, '__val__');
                }
            }
            else if (this.aggregation === aggregationType_1.AggregationType.FIRST) {
                return utils.format(aggregateFormatter_1.AggregateTemplates.FIRST, this.code, expObjDef, this.hasGroupIndex ? this.parentGroupingId + '.groupIndex' : 'index');
            }
            else {
                if (this.hasDistinct) {
                    return aggregateFormatter_1.AggregateFromatter.getAggrDefinition('DISTINCT_' + this.aggregation, this.code, expObjDef, this.defineValReference('Distinct'));
                }
                else {
                    return aggregateFormatter_1.AggregateFromatter.getAggrDefinition(this.aggregation, this.code, expObjDef);
                }
            }
        };
        Aggregate.prototype.definePostProcessing = function () {
            switch (this.aggregation) {
                case aggregationType_1.AggregationType.NTH:
                    {
                        if (this.sorting) {
                            return this.defineSorting();
                        }
                    }
                    break;
                case aggregationType_1.AggregationType.AVG: {
                    return aggregateFormatter_1.AggregateFromatter.getPostProcessingAvgDefinition(this.defineExpObjRef());
                }
                case aggregationType_1.AggregationType.CONCAT: {
                    var sorting = this.sorting ?
                        this.defineSorting() : '';
                    var delimiter = this.getFirstArgument() || '", "';
                    return aggregateFormatter_1.AggregateFromatter.getPostProcessingConcatDefinition(this.defineExpObjRef(), delimiter, sorting);
                }
            }
            return '';
        };
        Aggregate.prototype.defineSortingComparator = function () {
            if (this.sorting) {
                return sortingFormatter_1.SortingFromatter.getSortingFnDefinition(utils.addIdSuffix(this.id, 'Comparator'), this.sorting, this.hasExtendedSorting());
            }
        };
        Aggregate.prototype.defineExpObjRef = function () {
            return this.getGroupingId() + '.' + this.id;
        };
        Aggregate.prototype.handleGroupIndex = function () {
            _super.prototype.handleGroupIndex.call(this);
            if (!this.hasGroupIndex && this.parentGroupingId && (this.aggregation == aggregationType_1.AggregationType.FIRST ||
                (this.sorting && this.aggregation === aggregationType_1.AggregationType.LAST) ||
                (this.aggregation === aggregationType_1.AggregationType.NTH && !this.sorting && !this.hasDistinct))) {
                this.hasGroupIndex = true;
            }
        };
        Aggregate.canHaveSorting = function (aggrType) {
            return aggrType === aggregationType_1.AggregationType.CONCAT || aggrType === aggregationType_1.AggregationType.FIRST || aggrType === aggregationType_1.AggregationType.LAST || aggrType === aggregationType_1.AggregationType.NTH;
        };
        // =========================================================================================================
        // ============================================ PRIVATE METHODS ============================================
        // =========================================================================================================
        Aggregate.prototype.fillDefault = function () {
            if (this.aggregation === aggregationType_1.AggregationType.COUNT &&
                (!this.code || this.code === 'true' || this.code === '*')) {
                this.code = BY_ALL;
            }
        };
        Aggregate.prototype.parseDistinct = function (logger) {
            var _this = this;
            if (aggregationType_1.AggregationType[this.aggregation]) {
                this.code = this.code.replace(expression_1.ExpressionRegExps.DISTINCT, function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this.hasDistinct = true;
                    return args[2]; // Following character after DISTINCT
                });
            }
            if (this.hasDistinct) {
                if (this.aggregation === aggregationType_1.AggregationType.COUNT && this.code === BY_ALL) {
                    this.hasDistinct = false;
                    logger.warning(utils.format('Distinct cannot be used along with COUNT by all values;\n', this.raw));
                }
                else if (!this.canHaveDistinct()) {
                    this.hasDistinct = false;
                    logger.log(utils.format('Unnecessary DISTINCT, distinct do NOT apply on {0} expression type;\n{1}', this.type, this.raw));
                }
            }
        };
        Aggregate.prototype.canHaveDistinct = function () {
            return aggregateFormatter_1.AggregateTemplates['DISTINCT_' + this.aggregation] ? true : false;
        };
        Aggregate.prototype.findSibling = function (queryExpressions) {
            var _this = this;
            var sibling = utils.find(queryExpressions, function (exp) { return exp.equals(_this); });
            if (sibling) {
                if (this.level > sibling.level) {
                    sibling.level = this.level;
                }
                sibling.addGroupId(this.groupIds[0]);
            }
            return sibling;
        };
        Aggregate.prototype.handleIndex = function () {
            if ((!this.parentGroupingId &&
                (this.aggregation === aggregationType_1.AggregationType.FIRST ||
                    (this.aggregation === aggregationType_1.AggregationType.NTH && !this.sorting && !this.hasDistinct) ||
                    (this.sorting && this.aggregation === aggregationType_1.AggregationType.LAST))) ||
                this.checkIndex()) {
                this.hasIndex = true;
            }
            ;
        };
        Aggregate.prototype.matchSorting = function () {
            var _this = this;
            utils.forEach(this.sorting, function (orderBy) { return orderBy.compareToAggregation(_this); });
        };
        Aggregate.prototype.hasExtendedSorting = function () {
            return utils.some(this.sorting, function (orderBy) { return !orderBy.isOrderedByValue(); });
        };
        Aggregate.prototype.countByAll = function () {
            return this.aggregation === aggregationType_1.AggregationType.COUNT && this.code === BY_ALL;
        };
        Aggregate.prototype.defineInitVal = function () {
            switch (this.aggregation) {
                case aggregationType_1.AggregationType.COUNT:
                    return '0';
                case aggregationType_1.AggregationType.AVG:
                    return '{ val: 0, count: 0 }';
                case aggregationType_1.AggregationType.CONCAT:
                    return '[]';
                case aggregationType_1.AggregationType.FIRST:
                case aggregationType_1.AggregationType.LAST: {
                    if (this.sorting) {
                        if (this.hasExtendedSorting()) {
                            return '{}';
                        }
                        else {
                            return 'undefined';
                        }
                    }
                    else {
                        return 'null';
                    }
                }
                case aggregationType_1.AggregationType.NTH: {
                    if (this.sorting) {
                        return '[]';
                    }
                    else {
                        return 'null';
                    }
                }
                case aggregationType_1.AggregationType.SUM:
                case aggregationType_1.AggregationType.MIN:
                case aggregationType_1.AggregationType.MAX:
                default:
                    return 'null';
            }
        };
        Aggregate.prototype.defineAggregationWithSorting = function (expObjDef) {
            var orderFillPropsDef;
            if (this.hasExtendedSorting()) {
                var orderFillProps = utils.reduce(this.sorting, function (props, orderBy) {
                    if (!orderBy.isOrderedByValue()) {
                        props.push(orderBy.id + ': ' + orderBy.code);
                    }
                    return props;
                }, []);
                orderFillProps.push('val: ' + (this.aggregation === aggregationType_1.AggregationType.CONCAT ? '__val__' : this.code));
                orderFillPropsDef = '{ ' + orderFillProps.join(', ') + ' }';
            }
            else {
                orderFillPropsDef = this.code;
            }
            if (this.aggregation === aggregationType_1.AggregationType.FIRST || this.aggregation === aggregationType_1.AggregationType.LAST) {
                return utils.format(aggregateFormatter_1.AggregateTemplates[this.aggregation + '_ORDER_BY'], utils.addIdSuffix(this.id, 'Comparator'), // TODO:: create at constructor
                expObjDef, orderFillPropsDef, this.parentGroupingId ? this.parentGroupingId + '.groupIndex' : 'index');
            }
            else if (this.aggregation === aggregationType_1.AggregationType.NTH) {
                if (this.hasDistinct) {
                    return utils.format(aggregateFormatter_1.AggregateTemplates.DISTINCT_NTH_ORDER_BY, expObjDef, orderFillPropsDef, this.defineValReference('Distinct'));
                }
                else {
                    return utils.format(aggregateFormatter_1.AggregateTemplates.NTH_ORDER_BY, expObjDef, orderFillPropsDef);
                }
            }
            else if (this.aggregation === aggregationType_1.AggregationType.CONCAT) {
                if (this.hasDistinct) {
                    return utils.format(aggregateFormatter_1.AggregateTemplates.DISTINCT_CONCAT, this.code, expObjDef, orderFillPropsDef, this.defineValReference('Distinct'));
                }
                else {
                    return utils.format(aggregateFormatter_1.AggregateTemplates.CONCAT, this.code, expObjDef, orderFillPropsDef);
                }
            }
        };
        Aggregate.prototype.defineSorting = function () {
            var expObjRef = this.defineExpObjRef();
            var comparatorId = utils.addIdSuffix(this.id, 'Comparator');
            var valRef;
            switch (this.aggregation) {
                case aggregationType_1.AggregationType.NTH: {
                    if (this.hasExtendedSorting()) {
                        valRef = sortingFormatter_1.SortingFromatter.getSortedValRefDefinition(expObjRef);
                    }
                    else {
                        valRef = '';
                    }
                    return sortingFormatter_1.SortingFromatter.getNthSortingOutputDefinition(expObjRef, comparatorId, valRef, (parseInt(this.getFirstArgument() || '1') - 1).toString());
                }
                case aggregationType_1.AggregationType.CONCAT: {
                    valRef = this.hasExtendedSorting() ? '.val' : '';
                    return sortingFormatter_1.SortingFromatter.getComplexSortingOutputDefinition(expObjRef, comparatorId, valRef);
                }
                default: return '';
            }
        };
        Aggregate.prototype.getFirstArgument = function () {
            return this.arguments[0] ? this.arguments[0].code : '';
        };
        return Aggregate;
    }(expression_1.Expression));
    exports.Aggregate = Aggregate;
    var BY_ALL = 'ALL';
});
