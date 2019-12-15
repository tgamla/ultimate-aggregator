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
        define(["require", "exports", "../common/utils", "./expression", "./groupBy", "./orderBy", "../common/formatter", "../helpers/aggregateParser", "../constants/aggregationType", "../constants/expressionType"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var expression_1 = require("./expression");
    var groupBy_1 = require("./groupBy");
    var orderBy_1 = require("./orderBy");
    var formatter_1 = require("../common/formatter");
    var aggregateParser_1 = require("../helpers/aggregateParser");
    var aggregationType_1 = require("../constants/aggregationType");
    var expressionType_1 = require("../constants/expressionType");
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
                    return utils.format(AggregationTemplates.DISTINCT_NTH, this.code, expObjDef, nthNo, this.defineValReference('Distinct'), this.defineValReference('DistinctLength'));
                }
                else {
                    return utils.format(AggregationTemplates.NTH, this.code, expObjDef, this.hasGroupIndex ? this.parentGroupingId + '.groupIndex' : 'index', nthNo);
                }
            }
            else if (this.aggregation === aggregationType_1.AggregationType.CONCAT) {
                if (this.hasDistinct) {
                    return utils.format(AggregationTemplates.DISTINCT_CONCAT, this.code, expObjDef, '__val__', this.defineValReference('Distinct'));
                }
                else {
                    return utils.format(AggregationTemplates.CONCAT, this.code, expObjDef, '__val__');
                }
            }
            else if (this.aggregation === aggregationType_1.AggregationType.FIRST) {
                return utils.format(AggregationTemplates.FIRST, this.code, expObjDef, this.hasGroupIndex ? this.parentGroupingId + '.groupIndex' : 'index');
            }
            else {
                if (this.hasDistinct) {
                    return AggregationTemplates.format('DISTINCT_' + this.aggregation, this.code, expObjDef, this.defineValReference('Distinct'));
                }
                else {
                    return AggregationTemplates.format(this.aggregation, this.code, expObjDef);
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
                    return utils.format(PostProcessingTemplates.AVG, this.defineExpObjRef());
                }
                case aggregationType_1.AggregationType.CONCAT: {
                    var sorting = this.sorting ?
                        this.defineSorting() : '';
                    var delimiter = this.getFirstArgument() || '", "';
                    return utils.format(PostProcessingTemplates.CONCAT, this.defineExpObjRef(), delimiter, sorting);
                }
            }
            return '';
        };
        Aggregate.prototype.defineSortingComparator = function () {
            if (this.sorting) {
                return utils.format("\nfunction {0}(x, y) {\n    return {1};\n}\n", utils.addIdSuffix(this.id, 'Comparator'), this.defineComparision(this.sorting));
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
            return AggregationTemplates['DISTINCT_' + this.aggregation] ? true : false;
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
                return utils.format(AggregationTemplates[this.aggregation + '_ORDER_BY'], utils.addIdSuffix(this.id, 'Comparator'), // TODO:: create at constructor
                expObjDef, orderFillPropsDef, this.parentGroupingId ? this.parentGroupingId + '.groupIndex' : 'index');
            }
            else if (this.aggregation === aggregationType_1.AggregationType.NTH) {
                if (this.hasDistinct) {
                    return utils.format(AggregationTemplates.DISTINCT_NTH_ORDER_BY, expObjDef, orderFillPropsDef, this.defineValReference('Distinct'));
                }
                else {
                    return utils.format(AggregationTemplates.NTH_ORDER_BY, expObjDef, orderFillPropsDef);
                }
            }
            else if (this.aggregation === aggregationType_1.AggregationType.CONCAT) {
                if (this.hasDistinct) {
                    return utils.format(AggregationTemplates.DISTINCT_CONCAT, this.code, expObjDef, orderFillPropsDef, this.defineValReference('Distinct'));
                }
                else {
                    return utils.format(AggregationTemplates.CONCAT, this.code, expObjDef, orderFillPropsDef);
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
                        valRef = utils.format('{0} = {0} ? {0}.val : null;', expObjRef);
                    }
                    else {
                        valRef = '';
                    }
                    return utils.format("{0} = {0}.sort({1})[{3}];\n{2}", expObjRef, comparatorId, valRef, (parseInt(this.getFirstArgument() || '1') - 1).toString());
                }
                case aggregationType_1.AggregationType.CONCAT: {
                    valRef = this.hasExtendedSorting() ? '.val' : '';
                    return utils.format("__val__ = {0}.sort({1});\n__tempRes__ = [];\n__length__ = __val__.length;\nfor (__i__ = 0; __i__ < __length__; __i__++) {\n    __tempRes__.push(__val__[__i__]{2});\n}\n{0} = __tempRes__;\n", expObjRef, comparatorId, valRef);
                }
                default: return '';
            }
        };
        Aggregate.prototype.defineComparision = function (sorting) {
            var hasExtendedSorting = this.hasExtendedSorting();
            var comparisions = utils.reduce(sorting, function (acc, orderBy) {
                var compareVal;
                if (hasExtendedSorting) {
                    compareVal = '.' + (orderBy.isOrderedByValue() ? 'val' : orderBy.id);
                }
                else {
                    compareVal = '';
                }
                var isASC = orderBy.isAscending();
                return utils.format(acc, formatter_1.QueryFormatter.formatComparision('{0}', (isASC ? 'x' : 'y') + compareVal, (isASC ? 'y' : 'x') + compareVal));
            }, '{0}');
            return utils.format(comparisions, '0');
        };
        Aggregate.prototype.getFirstArgument = function () {
            return this.arguments[0] ? this.arguments[0].code : '';
        };
        return Aggregate;
    }(expression_1.Expression));
    exports.Aggregate = Aggregate;
    var AggregationTemplates = /** @class */ (function () {
        function AggregationTemplates() {
        }
        AggregationTemplates.format = function (aggrType, expCode, expObjDef, distinctRef) {
            if (distinctRef === void 0) { distinctRef = ''; }
            return utils.format(AggregationTemplates[aggrType], expCode, expObjDef, distinctRef);
        };
        AggregationTemplates.SUM = "    __val__ = {0};\n    if (__val__)\n        {1} = ({1} || 0) + __val__;";
        AggregationTemplates.DISTINCT_SUM = "    __val__ = {0};\n    if (__val__ && {2}[__val__] !== true) {\n        {1} = ({1} || 0) + __val__;\n        {2}[__val__] = true;\n    }";
        AggregationTemplates.MIN = "    __val__ = {0};\n    if (__val__ != null && ({1} > __val__ || {1} == null))\n        {1} = __val__;";
        AggregationTemplates.MAX = "    __val__ = {0};\n    if (__val__ != null && ({1} < __val__ || {1} == null))\n        {1} = __val__;";
        AggregationTemplates.FIRST = "    if ({2} === 1)\n        {1} = {0};";
        AggregationTemplates.FIRST_ORDER_BY = "    __val__ = {2};\n    if ({3} === 1 || {0}({1}, __val__) > 0)\n        {1} = __val__;";
        AggregationTemplates.LAST = "    {1} = {0};";
        AggregationTemplates.LAST_ORDER_BY = "    __val__ = {2};\n    if ({3} === 1 || {0}(__val__, {1}) > 0)\n        {1} = __val__;";
        AggregationTemplates.NTH = "    if ({2} == {3})\n        {1} = {0}";
        AggregationTemplates.DISTINCT_NTH = "    __val__ = {0};\n    if ({3}[__val__] !== true) {\n        if ({4} == {2})\n            {1} = __val__;\n        else {\n            {3}[__val__] = true;\n            {4}++;\n        }\n    }";
        AggregationTemplates.NTH_ORDER_BY = "    {0}.push({1});";
        AggregationTemplates.DISTINCT_NTH_ORDER_BY = "    __val__ = {1};\n    if ({2}[__val__] !== true) {\n        {0}.push(__val__);\n        {2}[__val__] = true;\n    }";
        AggregationTemplates.COUNT = "    if (({0}) != null)\n        {1}++;";
        AggregationTemplates.DISTINCT_COUNT = "    __val__ = {0};\n    if (__val__ != null && {2}[__val__] !== true) {\n        {1}++;\n        {2}[__val__] = true;\n    }";
        AggregationTemplates.AVG = "    __val__ = {0}\n    if (__val__ != null)\n        { {1}.count++; {1}.val += __val__; };";
        AggregationTemplates.DISTINCT_AVG = "    __val__ = {0}\n    if (__val__ != null && {2}[__val__] !== true) {\n        {1}.count++;\n        {1}.val += __val__;\n        {2}[__val__] = true;\n    };";
        AggregationTemplates.CONCAT = "    __val__ = {0};\n    if (__val__ != null)\n        {1}.push({2});";
        AggregationTemplates.DISTINCT_CONCAT = "    __val__ = {0};\n    if (__val__ != null && {3}[__val__] !== true) {\n        {1}.push({2});\n        {3}[__val__] = true;\n    }";
        return AggregationTemplates;
    }());
    var PostProcessingTemplates;
    (function (PostProcessingTemplates) {
        PostProcessingTemplates["AVG"] = "{0} = {0}.val / ({0}.count || 1);";
        PostProcessingTemplates["CONCAT"] = "{2}{0} = {0}.join({1});";
    })(PostProcessingTemplates || (PostProcessingTemplates = {}));
    var BY_ALL = 'ALL';
});
