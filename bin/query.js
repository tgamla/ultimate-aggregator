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
        define(["require", "exports", "./common/utils", "./common/logger", "./formatters/queryFomatter", "./prototypes/baseQuery", "./group", "./ungroup", "./expressions/expression", "./expressions/field", "./expressions/aggregate", "./expressions/groupBy", "./expressions/orderBy", "./helpers/groupComposition", "./helpers/groupingComposition", "./helpers/preProcess", "./constants/expressionType"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("./common/utils");
    var logger_1 = require("./common/logger");
    var queryFomatter_1 = require("./formatters/queryFomatter");
    var baseQuery_1 = require("./prototypes/baseQuery");
    var group_1 = require("./group");
    var ungroup_1 = require("./ungroup");
    var expression_1 = require("./expressions/expression");
    var field_1 = require("./expressions/field");
    var aggregate_1 = require("./expressions/aggregate");
    var groupBy_1 = require("./expressions/groupBy");
    var orderBy_1 = require("./expressions/orderBy");
    var groupComposition_1 = require("./helpers/groupComposition");
    var groupingComposition_1 = require("./helpers/groupingComposition");
    var preProcess_1 = require("./helpers/preProcess");
    var expressionType_1 = require("./constants/expressionType");
    var Query = /** @class */ (function (_super) {
        __extends(Query, _super);
        function Query(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this, 'Query') || this;
            _this._preFilter = null;
            _this.datasource = [];
            _this.allExpressions = null;
            _this.quotes = null;
            _this.fn = null;
            _this.changed = true;
            _this.context = {};
            _this.config(config);
            return _this.encapsulate();
        }
        Query.prototype.config = function (config) {
            if (config == null || typeof config !== 'object') {
                this.logger.warning(logger_1.MessageCodes.EMPTY_CONFIG);
                return this;
            }
            this.logger = new logger_1.Logger(this.id, config);
            this.debugLevel = config.debugLevel || 0;
            return this.applyChange();
        };
        Query.prototype.addContext = function (reference, value) {
            var _this = this;
            var hasChangedContext = false;
            if (reference instanceof Function) {
                if (this.addFunction(reference)) {
                    hasChangedContext = true;
                }
            }
            else if (reference instanceof Array) {
                this.logger.warning(logger_1.MessageCodes.ARRAY_IN_CONTEXT, reference);
            }
            else if (typeof reference === 'string') {
                this.context[reference] = value;
                hasChangedContext = true;
            }
            else if (typeof reference === 'object' && utils.keysLength(reference) > 0) {
                utils.forEach(reference, function (val, prop) {
                    hasChangedContext = true;
                    _this.context[prop] = val;
                });
            }
            else if (reference == null) {
                this.logger.warning(logger_1.MessageCodes.EMPTY_REFERENCE_VALUE_IN_CONTEXT, reference);
            }
            else {
                this.logger.warning(logger_1.MessageCodes.INCORRECT_REFERENCE_IN_CONTEXT, reference);
            }
            if (hasChangedContext) {
                return this.applyChange();
            }
            else {
                if (!this.changed)
                    this.bindFn();
                return this;
            }
        };
        Query.prototype.removeContext = function (reference) {
            if (reference === undefined) {
                this.context = {};
                if (!this.changed)
                    this.bindFn();
                return this;
            }
            var hasChanged = false;
            var refType = typeof reference;
            if (refType === 'string') {
                if (this.context.hasOwnProperty(reference)) {
                    hasChanged = true;
                    delete this.context[reference];
                }
                else {
                    // TODO:: log
                }
            }
            else if (refType === 'object' && reference != null) {
                utils.forEach(reference, function (prop) {
                    // TODO
                });
                // TODO:: log
            }
            else {
                // TODO:: log
            }
            return this.applyChange(hasChanged);
        };
        Query.prototype.preFilter = function (filter) {
            if (typeof filter === 'string') {
                if (this._preFilter !== filter) {
                    this._preFilter = filter;
                    this.preFiltering = new preProcess_1.PreProcess(this._preFilter);
                    return this.applyChange();
                }
            }
            else if (filter == null) {
                this._preFilter = null;
                this.preFiltering = null;
            }
            else {
                // TODO:: warning unacceptable filter type
            }
            return this;
        };
        Query.prototype.preOrderBy = function () {
            // TODO::
            return this.applyChange();
        };
        Query.prototype.define = function () {
            // TODO::
            return this.applyChange();
        };
        Query.prototype.select = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.applySelect(args[0]);
            return this.applyChange();
        };
        Query.prototype.from = function (datasource) {
            var hasTypeChanged;
            if (datasource == null) {
                hasTypeChanged = !(this.datasource instanceof Array);
                this.datasource = [];
            }
            else if (typeof datasource === 'object') {
                hasTypeChanged = this.compareDatasourceType(datasource);
                this.datasource = datasource;
            }
            else {
                this.logger.warning(logger_1.MessageCodes.UNSUPPORTED_DATA_TYPE);
                hasTypeChanged = !(this.datasource instanceof Array);
                this.datasource = [];
            }
            return this.applyChange(hasTypeChanged);
        };
        Query.prototype.distinct = function (apply) {
            return this.applyChange(this.applyDistinct(apply));
        };
        Query.prototype.groupBy = function (rawGrouping) {
            if (this.applyList(rawGrouping, '_groupBy')) {
                return this.applyChange();
            }
            else {
                return this;
            }
        };
        Query.prototype.totals = function () {
            // TODO::
            return this.applyChange();
        };
        Query.prototype.filter = function (rawFilter) {
            return this.applyChange(this.applyFilter(rawFilter));
        };
        Query.prototype.orderBy = function (rawSorting) {
            return this.applyChange(this.applyList(rawSorting, '_orderBy'));
        };
        Query.prototype.range = function (start, end) {
            // TODO::
            return this.applyChange();
        };
        Query.prototype.clone = function () {
            var copy = new Query();
            // TODO::
            return copy;
        };
        Query.prototype.toList = function () {
            // TODO:: if type changes
            return this.execute();
        };
        Query.prototype.toObject = function () {
            // TODO::
            return {};
        };
        Query.prototype.toValue = function () {
            // TODO::
            return null;
        };
        Query.prototype.execute = function (datasource) {
            var _this = this;
            var workingData;
            if (datasource instanceof Query) {
                workingData = datasource.execute();
            }
            else if (this.datasource instanceof Query) {
                workingData = this.datasource.execute(datasource);
            }
            else {
                workingData = datasource === undefined ?
                    this.datasource : datasource;
            }
            if (typeof workingData === 'object' && workingData.then instanceof Function) {
                return workingData.then(function (result) {
                    _this.execute(result);
                });
            }
            if (this._preFilter) {
                workingData = this.execPreFiltering(workingData);
            }
            return this.calculate(workingData);
        };
        Query.prototype.toString = function () {
            // TODO::
            return JSON.stringify(this);
        };
        Query.fromDefinition = function (definition) {
            var defObj;
            if (definition instanceof Object) {
                defObj = definition;
            }
            else if (typeof definition === 'string') {
                defObj = JSON.parse(definition);
                if (!(defObj instanceof Object)) {
                    // TODO::
                    throw new Error();
                }
            }
            else {
                // TODO::
                throw new Error();
            }
            var query = new Query();
            if (defObj._select) {
                query.select(defObj._select);
            }
            if (defObj._groupBy) {
                query.groupBy(defObj._groupBy);
            }
            // TODO::
            return query;
        };
        // =========================================================================================================
        // ============================================ PRIVATE METHODS ============================================
        // =========================================================================================================
        Query.prototype.encapsulate = function () {
            Object.defineProperties(this, QUERY_PRIVATE_PROPERTIES);
            // Object.seal(this); // TODO:: not working?
            return this;
        };
        Query.prototype.applyChange = function (applied) {
            if (applied === void 0) { applied = true; }
            if (applied) {
                this.changed = true;
            }
            return this;
        };
        Query.prototype.execPreFiltering = function (data) {
            var preFilterObj = this.preFiltering;
            try {
                if (preFilterObj.isNew) {
                    preFilterObj.createFunction(this.logger);
                }
                return preFilterObj.function(data);
            }
            catch (exc) {
                this.logger.error(exc);
            }
        };
        Query.prototype.calculate = function (data) {
            try {
                if (this.changed) {
                    // TODO:: error if no select has been defined!
                    this.init();
                    var mainGrouping = this.parseGrouping(this._groupBy, null);
                    this.groupComposition = this.createGroupComposition(this, mainGrouping);
                    this.groupMap = this.getGroupMap(this.groupComposition, {});
                    this.groupingComposition = groupingComposition_1.GroupingComposition.getComposition(this.allExpressions);
                    this.createFn();
                    // use for both single regexp:
                    // TODO:: replace double new lines with single
                    // TODO:: bring back Quotes!
                }
                // TODO:: if no dataset then trow warning
                return this.fn(data);
            }
            catch (exc) {
                this.logger.error(exc);
            }
            return [];
        };
        Query.prototype.init = function () {
            this.allExpressions = [];
            this.quotes = {};
            this.context.__quotes__ = this.quotes;
            if (this.debugLevel > 0) {
                this.context.__logger__ = this.logger;
            }
            else if (this.context.hasOwnProperty('__logger__')) {
                delete this.context.__logger__;
            }
        };
        Query.prototype.createFn = function () {
            var hasQueryGrouping = this.hasQueryGrouping();
            var aggregationIterators = this.defineAggregationIterators();
            var groupedResultSet = this.defineGroupedResultSet(this.groupingComposition, 1, true);
            var resultSet;
            if (!hasQueryGrouping) {
                if (this.hasAnySubGroup() || this.hasAnyPrimalAggregationNonOver()) {
                    resultSet = this.defineResultSet();
                }
                else {
                    resultSet = this.definePlainResultSet();
                }
            }
            this.code = queryFomatter_1.QueryFormatter.formatFunction(this.defineAllDeclaration(), aggregationIterators, this.defineNonGroupedPostProcessing(), groupedResultSet, resultSet, this.defineComparators(), this.groupComposition.defineSorting(), this.debugLevel, this.hasAnyGroupDistinct());
            if (this.debugLevel > 1) {
                this.logger.debugObject('Query', this);
                this.logExpressions();
                this.logger.debug(this.code);
            }
            this.bindFn();
        };
        Query.prototype.bindFn = function () {
            var params = Object.keys(this.context);
            params.push('data', this.code);
            var args = [];
            utils.forEach(this.context, function (arg) { return args.push(arg); });
            var fn = Function.apply(null, params);
            this.fn = Function.prototype.bind.apply(fn, [fn].concat(args));
        };
        Query.prototype.hasQueryGrouping = function () {
            return this.groupComposition.grouping.length > 0;
        };
        Query.prototype.hasAnyPrimalAggregationNonOver = function () {
            return utils.some(this.allExpressions, function (exp) { return exp instanceof aggregate_1.Aggregate && exp.isPrimalNonOver(); });
        };
        Query.prototype.hasAnySubGroup = function () {
            return utils.keysLength(this.groupComposition.innerGroups) ? true : false;
        };
        Query.prototype.hasAnyGroupDistinct = function (groupComposition) {
            var _this = this;
            if (groupComposition === void 0) { groupComposition = this.groupComposition; }
            if (groupComposition.distinct) {
                return true;
            }
            return utils.some(groupComposition.innerGroups, function (groupComp) { return _this.hasAnyGroupDistinct(groupComp); });
        };
        Query.prototype.defineAllDeclaration = function () {
            return queryFomatter_1.QueryFormatter.getAllDeclarationsDefinition(this.defineMainGroupingDeclaration(), this.defineAllVariableDeclarations());
        };
        Query.prototype.defineMainGroupingDeclaration = function () {
            return this.defineGrouping(this.groupingComposition, this.groupMap['']);
        };
        Query.prototype.isAnyUsingIndex = function (expressions) {
            return utils.some(expressions, function (exp) { return exp.hasIndex; });
        };
        Query.prototype.defineAllVariableDeclarations = function () {
            var groupings = this.allExpressions.filter(function (exp) { return exp.isGroupingExpression(); });
            var declarations = groupings.reduce(function (acc, exp) {
                acc.push(exp.id);
                acc.push(exp.valueId);
                return acc;
            }, []);
            declarations = declarations.concat(this.groupingComposition.getGroupingVariableDeclarations());
            declarations = declarations.concat(this.groupComposition.getGroupVariableDeclarations());
            return declarations.join(', ') + (declarations.length ? ',' : '');
        };
        Query.prototype.defineAggregationIterators = function () {
            var expsByLevel = this.getExpAggregationsByLevels().reverse();
            var maxLevel = expsByLevel.length || 1;
            var iterators = [];
            for (var level = 0; level < maxLevel; level++) {
                var isLastIteration = (level + 1) === maxLevel;
                var currentLevelAggregations = expsByLevel[level];
                var groupingCompByLvl = isLastIteration ?
                    this.groupingComposition :
                    groupingComposition_1.GroupingComposition.getComposition(currentLevelAggregations);
                var isUsingIndex = this.isAnyUsingIndex(currentLevelAggregations);
                var ungroupsDef = isLastIteration ? this.defineUngroups() : '';
                var groupingsDef = this.defineGroupings('', [], this.groupingComposition, groupingCompByLvl, isLastIteration);
                var aggregationDef = this.defineExpAggregations(currentLevelAggregations);
                if (groupingsDef || ungroupsDef || aggregationDef) {
                    var postProcessing = isLastIteration ?
                        '' :
                        this.defineGroupsPostProcessing(maxLevel - level);
                    iterators.push(queryFomatter_1.QueryFormatter.formatAggregationIterator(groupingsDef, ungroupsDef, aggregationDef, postProcessing, isUsingIndex));
                }
            }
            return iterators.join('\n\n');
        };
        Query.prototype.getExpAggregationsByLevels = function () {
            return utils.reduce(this.allExpressions, function (acc, exp) {
                if (exp instanceof aggregate_1.Aggregate) {
                    var currLevelExps = acc[exp.level - 1];
                    if (!currLevelExps) {
                        currLevelExps = acc[exp.level - 1] = [];
                    }
                    currLevelExps.push(exp);
                }
                return acc;
            }, []);
        };
        Query.prototype.defineUngroups = function () {
            var _this = this;
            return utils.map(this.getUngroups(this.groupComposition), function (groupComp) { return _this.defineResultSet(groupComp); }).join('\n');
        };
        Query.prototype.getUngroups = function (groupComposition) {
            var _this = this;
            return utils.reduce(groupComposition.innerGroups, function (acc, innerGroupComp) {
                acc = acc.concat(_this.getUngroups(innerGroupComp));
                if (innerGroupComp.isUngroup) {
                    acc.push(innerGroupComp);
                }
                return acc;
            }, []);
        };
        Query.prototype.defineGroupings = function (groupingIds, definedGroupings, baseGroupings, currentGroupings, isLastIteration) {
            var _this = this;
            return utils.map(currentGroupings.inner, function (groupingComp, groupingId) {
                var baseGrouping = baseGroupings.inner[groupingId];
                var currentGroupingIds = groupingIds + groupingId;
                var parentGrouping = (baseGroupings.groupingExpression ? currentGroupings.id : '__groupings__') +
                    (baseGroupings.isComplex() ? '.' + groupingId : '');
                var definition;
                if (!baseGrouping.hasBeenDefined) {
                    var currentGroupMaps = _this.groupMap[currentGroupingIds];
                    definition = utils.format(Query.GROUPING_DECLARATION_TEMPLATE, groupingComp.id, groupingComp.groupingExpression.valueId, groupingComp.groupingExpression.code, parentGrouping, _this.defineGrouping(baseGrouping, currentGroupMaps), _this.defineGroupIndexIncrementation(groupingComp), _this.defineGroupRowAssignment(groupingComp));
                    baseGrouping.hasBeenDefined = true;
                    definedGroupings.push(groupingComp.id);
                }
                else if (definedGroupings.indexOf(groupingComp.id) == -1) {
                    definition = utils.format(Query.GROUPING_FETCH, groupingComp.id, groupingComp.groupingExpression.code, parentGrouping);
                    definedGroupings.push(groupingComp.id);
                }
                return (definition || '') + '\n' + _this.defineGroupings(currentGroupingIds, definedGroupings, baseGrouping, groupingComp, isLastIteration);
            }).join('');
        };
        Query.prototype.defineGrouping = function (baseGrouping, groupCompositions) {
            var definition;
            var props = [];
            // Adds declarattion of inner groups
            utils.forEach(baseGrouping.inner, function (gComp) { return props.push(gComp.groupingExpression.id + ': {}'); });
            // Adds declaration of group expressions
            utils.forEach(baseGrouping.getAggregations(), function (exp) {
                props.push(exp.defineInitialProperty());
                if (exp.hasDistinct) {
                    props.push(exp.distinctProperty());
                }
            });
            if (baseGrouping.hasNonAggregatedGroupedFields()) {
                props.push('row: row');
            }
            if (baseGrouping.hasFieldsWithGroupIndex()) {
                props.push('groupIndex: 1');
            }
            utils.forEach(groupCompositions, function (groupComp) {
                if (groupComp.isUngroup) {
                    props.push(groupComp.id + ': []');
                }
            });
            definition = props.join(', ');
            return utils.format(Query.OBJECT_COMPOSITION, definition);
        };
        Query.prototype.defineGroupRowAssignment = function (groupingComp) {
            return groupingComp.hasNonAggregatedGroupedFields() ?
                '\n        ' + groupingComp.id + '.row = row;' : '';
        };
        Query.prototype.defineGroupIndexIncrementation = function (groupingComp) {
            return groupingComp.hasFieldsWithGroupIndex() ?
                '\n        ' + groupingComp.id + '.groupIndex++;' : '';
        };
        Query.prototype.defineExpAggregations = function (expressions) {
            return utils.map(expressions, function (exp) {
                return exp.defineAggregation();
            }).join('\n');
        };
        Query.prototype.defineGroupsPostProcessing = function (postProcessingLvl) {
            var expForPostProcessing = this.allExpressions.filter(function (exp) { return exp.level === postProcessingLvl && exp instanceof aggregate_1.Aggregate && exp.isPostProcessingType(); });
            if (expForPostProcessing.length) {
                var currentLvlGroupingComp = groupingComposition_1.GroupingComposition.getComposition(expForPostProcessing);
                return this.defineGroupedResultSet(currentLvlGroupingComp, postProcessingLvl, false);
            }
            else {
                return '';
            }
        };
        Query.prototype.createGroupComposition = function (group, grouping, parentGrouping) {
            if (grouping === void 0) { grouping = []; }
            if (parentGrouping === void 0) { parentGrouping = null; }
            var groupId = group.id;
            var select = group._select;
            var isMain = parentGrouping === null;
            var isUngroup = (group instanceof ungroup_1.Ungroup);
            var hasParentGrouping = parentGrouping && parentGrouping.length ? true : false;
            var sorting = this.parseSorting(group._orderBy);
            var filter = this.parseFilter(group._filter);
            var groupComposition = new groupComposition_1.GroupComposition(groupId, group._distinct, filter, grouping, sorting, isMain, isUngroup, hasParentGrouping);
            groupComposition.selection = this.parseSelection(select, groupComposition);
            groupComposition.expressions = this.allExpressions.filter(function (exp) { return exp.groupIds.indexOf(group.id) > -1; });
            return groupComposition;
        };
        Query.prototype.parseSelection = function (selection, groupComposition) {
            var _this = this;
            var selector = new groupComposition_1.Selector();
            var grouping;
            if (typeof selection === 'object' && selection !== null) {
                if (selection instanceof ungroup_1.Ungroup) {
                    if (groupComposition.isUngroup) {
                        selection = this.handleMeaninglessSelection(logger_1.MessageCodes.UNGROUP_WITHIN_UNGROUP, selection);
                    }
                    grouping = groupComposition.grouping;
                }
                else if (selection instanceof group_1.Group) {
                    grouping = this.parseGrouping(selection._groupBy, groupComposition.grouping);
                    if (groupComposition.isUngroup) {
                        if (grouping.length) {
                            throw 'Group with non empty grouping is not permitted within Ungroup!\n' + JSON.stringify(selection._select);
                        }
                        selection = this.handleMeaninglessSelection(logger_1.MessageCodes.GROUP_WITHIN_UNGROUP, selection);
                    }
                    else {
                        if (grouping.length) {
                            grouping = groupComposition.extendChildGrouping(this.logger, grouping);
                            if (grouping.length === groupComposition.grouping.length) {
                                selection = [selection._select];
                            }
                        }
                        else {
                            selection = this.handleMeaninglessSelection(logger_1.MessageCodes.GROUP_WITH_NO_GROUPING, selection);
                        }
                    }
                }
                if (selection instanceof group_1.Group || selection instanceof ungroup_1.Ungroup) {
                    var innerGroup = this.createGroupComposition(selection, grouping, groupComposition.grouping);
                    groupComposition.innerGroups.push(innerGroup);
                    selector.subSelectors = innerGroup.isUngroup ?
                        innerGroup.getUngroupReference() :
                        innerGroup.id;
                    selector.subSelectors += innerGroup.defineSorting();
                }
                else if (selection instanceof Array) {
                    selector.subSelectors = utils.reduce(selection, function (subSelectors, subSelection) {
                        subSelectors.push(_this.parseSelection(subSelection, groupComposition));
                        return subSelectors;
                    }, []);
                }
                else {
                    selector.subSelectors = utils.reduce(selection, function (subSelectors, subSelection, subFieldName) {
                        subSelectors[subFieldName] = _this.parseSelection(subSelection, groupComposition);
                        return subSelectors;
                    }, {});
                }
                selector.isLeaf = false;
            }
            else {
                var startingLevel = groupComposition.isUngroup ? 1 : 0;
                selector.subSelectors = new field_1.Field(this.logger, selection, this.quotes, this.allExpressions, groupComposition.id, groupComposition.grouping, groupComposition.isUngroup, startingLevel);
            }
            return selector;
        };
        Query.prototype.handleMeaninglessSelection = function (msgCode, selection) {
            this.logger.log(msgCode, selection._select);
            return [selection._select];
        };
        Query.prototype.parseGrouping = function (rawGrouping, parentGrouping) {
            var _this = this;
            return utils.reduce(rawGrouping, function (accGrouping, groupBy) {
                var groupExp = new groupBy_1.GroupBy(groupBy, _this.quotes, _this.allExpressions, groupBy_1.GroupBy.getLastGroupingId(parentGrouping, accGrouping));
                if (!groupExp.isOverallGrouping()) {
                    accGrouping.push(groupExp);
                }
                return accGrouping;
            }, []);
        };
        Query.prototype.parseSorting = function (rawSorting) {
            var _this = this;
            return utils.map(rawSorting, function (rawOrderBy) {
                return new orderBy_1.OrderBy(rawOrderBy, _this.quotes, _this.allExpressions);
            });
        };
        Query.prototype.parseFilter = function (filter) {
            return filter ?
                new expression_1.Expression(expressionType_1.ExpressionType.FILTER, filter, this.quotes) :
                null;
        };
        Query.prototype.findGroupingComposition = function (groupingComposition, groupingId) {
            var _this = this;
            if (groupingComposition.id === groupingId) {
                return groupingComposition;
            }
            return utils.returnFound(groupingComposition.inner, function (inner) { return _this.findGroupingComposition(inner, groupingId); });
        };
        Query.prototype.addFunction = function (fn) {
            var hasChangedContext;
            var fnName = fn['name'];
            if (!fnName || fnName === 'anonymous') {
                this.logger.warning(logger_1.MessageCodes.ANONYMOUS_FN_IN_CONTEXT, fn);
                hasChangedContext = false;
            }
            else {
                hasChangedContext = this.context.hasOwnProperty(fnName);
                this.context[fnName] = fn;
            }
            return hasChangedContext;
        };
        Query.prototype.getGroupMap = function (groupComposition, accumulator) {
            var _this = this;
            var currGroupingIds = groupComposition.grouping.map(function (exp) { return exp.id; }).join('');
            if (!accumulator[currGroupingIds]) {
                accumulator[currGroupingIds] = [];
            }
            utils.forEach(groupComposition.innerGroups, function (innerGroup) {
                _this.getGroupMap(innerGroup, accumulator);
            });
            accumulator[currGroupingIds].push(groupComposition);
            return accumulator;
        };
        Query.prototype.defineNonGroupedPostProcessing = function () {
            return this.allExpressions.reduce(function (def, exp) {
                if (exp instanceof aggregate_1.Aggregate && exp.isPostProcessingType() && !exp.grouping.length) {
                    def += exp.definePostProcessing() + '\n';
                }
                return def;
            }, '');
        };
        Query.prototype.definePlainResultSet = function () {
            var groupingsDefinition = this.defineGroupings('', [], this.groupingComposition, this.groupingComposition, true);
            var nonGroupedFields = this.allExpressions.filter(function (exp) { return !exp.parentGroupingId && exp instanceof field_1.Field; });
            return queryFomatter_1.QueryFormatter.formatAggregationIterator(groupingsDefinition, '', this.defineResultSet(), '', this.isAnyUsingIndex(nonGroupedFields));
        };
        Query.prototype.defineGroupedResultSet = function (parentGroupingComposition, postProcessingLvl, shouldFillResults, groupingIds) {
            var _this = this;
            if (groupingIds === void 0) { groupingIds = ''; }
            var isParentComplex = parentGroupingComposition.isComplex();
            return utils.reverseMap(parentGroupingComposition.inner, function (groupingComp) {
                var iteratorName = groupingComp.groupingExpression.iteratorId;
                var groupingId = groupingComp.id;
                var currentGroupingIds = groupingIds + groupingId;
                var currentGroupCompositions = _this.groupMap[currentGroupingIds];
                var groupingDeclarations = groupingComp.getGroupingDeclarations(isParentComplex, parentGroupingComposition.id);
                var innerGroupReference = groupingDeclarations[0];
                var innerGroupDeclaration = groupingDeclarations[1];
                var groupingsDeclaration = utils.format(Query.GROUPING_VAR_DECLARATION, groupingId, innerGroupReference || '', iteratorName);
                var innerLoops = _this.defineGroupedResultSet(groupingComp, postProcessingLvl, shouldFillResults, currentGroupingIds);
                var fillingResults;
                if (shouldFillResults && currentGroupCompositions) {
                    fillingResults = '';
                    utils.forEach(currentGroupCompositions, function (currentGroupComp) {
                        if (!currentGroupComp.isUngroup) {
                            fillingResults += _this.defineResultSet(currentGroupComp);
                        }
                        fillingResults += '\n';
                        var subSelectionCotainersDeclaration = utils.map(currentGroupComp.getSubGroups(), function (innerGroup) {
                            return innerGroup.getInitVariable() + ';';
                        }).join('\n');
                        groupingsDeclaration += '\n' + subSelectionCotainersDeclaration;
                    });
                }
                var postProcessing = _this.defineExpressionsPostProcessing(groupingComp.expressions, postProcessingLvl);
                if (postProcessing || innerLoops || fillingResults) {
                    return queryFomatter_1.QueryFormatter.formatGroupedResultSet(innerGroupDeclaration, innerGroupReference || '', iteratorName, groupingsDeclaration, postProcessing, innerLoops, fillingResults);
                }
                else
                    return '';
            }).join('\n');
        };
        Query.prototype.defineResultSet = function (groupComposition) {
            if (groupComposition === void 0) { groupComposition = this.groupComposition; }
            var containerReference = groupComposition.isMain ?
                '__results__' :
                (groupComposition.isUngroup ? groupComposition.getUngroupReference() : groupComposition.id);
            var preProcessing = [];
            if (groupComposition.filter) {
                preProcessing.push('(' + groupComposition.filter.code + ')');
            }
            if (groupComposition.distinct) {
                preProcessing.push(utils.format('!{0}({1}, out)', queryFomatter_1.QueryFormatter.DISTINCT_FN_NAME, containerReference));
            }
            if (preProcessing.length) {
                return utils.format(Query.RESULTS_PREPROCESSED_PUSH_TEMPLATE, containerReference, this.defineSelection(groupComposition.selection), preProcessing.join(' && '));
            }
            else {
                return utils.format(Query.RESULTS_PUSH_TEMPLATE, containerReference, this.defineSelection(groupComposition.selection));
            }
        };
        Query.prototype.defineSelection = function (selector) {
            var _this = this;
            var subSelectors = selector.subSelectors;
            if (subSelectors instanceof expression_1.Expression) {
                return subSelectors.code;
            }
            else if (typeof subSelectors === 'string') {
                return subSelectors;
            }
            else if (subSelectors instanceof Array) {
                var expProps = utils.map(subSelectors, function (subSelector) {
                    return _this.defineSelection(subSelector);
                }).join(', ');
                return utils.format('[ {0} ]', expProps);
            }
            else {
                var expProps = utils.map(subSelectors, function (subSelector, groupId) {
                    return utils.format(Query.PROPEERTY_DEFINITION, groupId, _this.defineSelection(subSelector));
                }).join(', ');
                return utils.format('{ {0} }', expProps);
            }
        };
        Query.prototype.defineExpressionsPostProcessing = function (expressions, processingLvl) {
            return utils.reduce(expressions, function (acc, exp) {
                if (processingLvl === exp.level && exp instanceof aggregate_1.Aggregate) {
                    acc += exp.definePostProcessing();
                }
                return acc;
            }, '');
        };
        Query.prototype.defineComparators = function () {
            var _this = this;
            return utils.reduce(this.allExpressions, function (comparators, exp) {
                if (exp instanceof aggregate_1.Aggregate) {
                    var comparatorDef = exp.defineSortingComparator();
                    if (comparatorDef) {
                        comparators.push(comparatorDef);
                    }
                }
                return comparators;
            }, []).concat(utils.reduce(this.groupMap, function (comparators, groups) {
                utils.forEach(groups, function (group) {
                    if (group.hasSorting()) {
                        comparators.push(_this.defineGroupComparator(group));
                    }
                });
                return comparators;
            }, [])).join('\n');
        };
        Query.prototype.defineGroupComparator = function (group) {
            return utils.format("function {0}(out, __outB__) {\n{1}\n}", utils.addIdSuffix(group.id, 'Comparator'), orderBy_1.OrderBy.defineComparator(group.sorting));
        };
        Query.prototype.compareDatasourceType = function (datasource) {
            return this.datasource instanceof Array ?
                (datasource instanceof Array) :
                !(datasource instanceof Array);
        };
        Query.prototype.logExpressions = function () {
            var _this = this;
            utils.forEach(this.allExpressions, function (exp) {
                return _this.logger.debugObject('Expression', exp);
            });
        };
        Query.GROUPING_DECLARATION_TEMPLATE = "    {1} = {2};\n    if ({3}.hasOwnProperty({1})) {\n        {0} = {3}[{1}];{5}{6}\n    }\n    else {\n        {0} = {3}[{1}] = {4};\n    }";
        Query.GROUPING_FETCH = "    {0} = {2}[{1}];";
        Query.OBJECT_COMPOSITION = "{ {0} }";
        Query.GROUPING_VAR_DECLARATION = '    {0} = {1}[{2}];';
        Query.RESULTS_PUSH_TEMPLATE = '{0}.push({1});';
        Query.RESULTS_PREPROCESSED_PUSH_TEMPLATE = "out = {1};\nif ({2})\n    {0}.push({1});";
        Query.PROPEERTY_DEFINITION = '"{0}": {1}';
        return Query;
    }(baseQuery_1.BaseQuery));
    exports.Query = Query;
    var PRIVATE_PROP_FLAGS = { enumerable: false, writable: true };
    var QUERY_PRIVATE_PROPERTIES = {
        datasource: PRIVATE_PROP_FLAGS,
        changed: PRIVATE_PROP_FLAGS,
        logger: PRIVATE_PROP_FLAGS,
        allExpressions: PRIVATE_PROP_FLAGS,
        context: PRIVATE_PROP_FLAGS,
        debugLevel: PRIVATE_PROP_FLAGS,
        fn: PRIVATE_PROP_FLAGS,
        groupComposition: PRIVATE_PROP_FLAGS,
        groupMap: PRIVATE_PROP_FLAGS,
        groupingComposition: PRIVATE_PROP_FLAGS,
        quotes: PRIVATE_PROP_FLAGS,
        code: PRIVATE_PROP_FLAGS,
        preFiltering: PRIVATE_PROP_FLAGS
        // TODO::
    };
});
