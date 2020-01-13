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
        define(["require", "exports", "./basePrototypes/baseQuery", "./common/logger", "./common/utils", "./constants/expressionType", "./expressions/aggregate", "./expressions/expression", "./expressions/field", "./expressions/groupBy", "./expressions/orderBy", "./formatters/queryFomatter", "./group", "./helpers/groupComposition", "./helpers/groupingComposition", "./helpers/preProcess", "./helpers/selector", "./ungroup"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var baseQuery_1 = require("./basePrototypes/baseQuery");
    var logger_1 = require("./common/logger");
    var utils = require("./common/utils");
    var expressionType_1 = require("./constants/expressionType");
    var aggregate_1 = require("./expressions/aggregate");
    var expression_1 = require("./expressions/expression");
    var field_1 = require("./expressions/field");
    var groupBy_1 = require("./expressions/groupBy");
    var orderBy_1 = require("./expressions/orderBy");
    var queryFomatter_1 = require("./formatters/queryFomatter");
    var group_1 = require("./group");
    var groupComposition_1 = require("./helpers/groupComposition");
    var groupingComposition_1 = require("./helpers/groupingComposition");
    var preProcess_1 = require("./helpers/preProcess");
    var selector_1 = require("./helpers/selector");
    var ungroup_1 = require("./ungroup");
    var Query = /** @class */ (function (_super) {
        __extends(Query, _super);
        function Query(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this, 'Query') || this;
            _this._preFilter = null;
            _this.dataSource = [];
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
                if (!this.changed) {
                    this.bindFn();
                }
                return this;
            }
        };
        Query.prototype.removeContext = function (reference) {
            if (reference === undefined) {
                this.context = {};
                if (!this.changed) {
                    this.bindFn();
                }
                return this;
            }
            var refType = typeof reference;
            var hasChanged = false;
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
        Query.prototype.from = function (dataSource) {
            var hasTypeChanged;
            if (dataSource == null) {
                hasTypeChanged = !(this.dataSource instanceof Array);
                this.dataSource = [];
            }
            else if (typeof dataSource === 'object') {
                hasTypeChanged = this.compareDataSourceType(dataSource);
                this.dataSource = dataSource;
            }
            else {
                this.logger.warning(logger_1.MessageCodes.UNSUPPORTED_DATA_TYPE);
                hasTypeChanged = !(this.dataSource instanceof Array);
                this.dataSource = [];
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
        Query.prototype.execute = function (dataSource) {
            var _this = this;
            var workingData;
            if (dataSource instanceof Query) {
                workingData = dataSource.execute();
            }
            else if (this.dataSource instanceof Query) {
                workingData = this.dataSource.execute(dataSource);
            }
            else {
                workingData = dataSource === undefined ?
                    this.dataSource : dataSource;
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
            this.code = queryFomatter_1.QueryFormatter.defineFunction(this.defineAllDeclaration(), aggregationIterators, this.defineNonGroupedPostProcessing(), groupedResultSet, resultSet, this.defineComparators(), this.groupComposition.defineSorting(), this.debugLevel, this.hasAnyGroupDistinct());
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
            return !!(utils.keysLength(this.groupComposition.innerGroups));
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
            return queryFomatter_1.QueryFormatter.defineAllDeclarations(this.defineMainGroupingDeclaration(), this.defineAllVariableDeclarations());
        };
        Query.prototype.defineMainGroupingDeclaration = function () {
            return groupingComposition_1.GroupingComposition.defineGrouping(this.groupingComposition, this.groupMap['']);
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
                var isUsingIndex = expression_1.Expression.isAnyUsingIndex(currentLevelAggregations);
                var ungroupsDef = isLastIteration ? this.defineUngroups() : '';
                var groupingsDef = groupingCompByLvl.defineGroupings(this.groupMap, this.groupingComposition, isLastIteration);
                var aggregationDef = Query.defineExpAggregations(currentLevelAggregations);
                if (groupingsDef || ungroupsDef || aggregationDef) {
                    var postProcessing = isLastIteration ?
                        '' :
                        this.defineGroupsPostProcessing(maxLevel - level);
                    iterators.push(queryFomatter_1.QueryFormatter.defineAggregationIterator(groupingsDef, ungroupsDef, aggregationDef, postProcessing, isUsingIndex));
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
            var hasParentGrouping = !!(parentGrouping && parentGrouping.length);
            var sorting = this.parseSorting(group._orderBy);
            var filter = this.parseFilter(group._filter);
            var groupComposition = new groupComposition_1.GroupComposition(groupId, group._distinct, filter, grouping, sorting, isMain, isUngroup, hasParentGrouping);
            groupComposition.selection = this.parseSelection(select, groupComposition);
            groupComposition.expressions = this.allExpressions.filter(function (exp) { return exp.groupIds.indexOf(group.id) > -1; });
            return groupComposition;
        };
        Query.prototype.parseSelection = function (selection, groupComposition) {
            var _this = this;
            var selector = new selector_1.Selector();
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
        Query.prototype.addFunction = function (fn) {
            var fnName = fn['name']; // tslint:disable-line:no-string-literal
            var hasChangedContext;
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
            var groupingsDefinition = this.groupingComposition.defineGroupings(this.groupMap, this.groupingComposition);
            var nonGroupedFields = this.allExpressions.filter(function (exp) { return !exp.parentGroupingId && exp instanceof field_1.Field; });
            return queryFomatter_1.QueryFormatter.defineAggregationIterator(groupingsDefinition, '', this.defineResultSet(), '', expression_1.Expression.isAnyUsingIndex(nonGroupedFields));
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
                var innerGroupReference = groupingDeclarations[0] || '';
                var innerGroupDeclaration = groupingDeclarations[1];
                var innerLoops = _this.defineGroupedResultSet(groupingComp, postProcessingLvl, shouldFillResults, currentGroupingIds);
                var groupingsDeclaration = queryFomatter_1.QueryFormatter.defineGrouping(groupingId, innerGroupReference, iteratorName);
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
                    return queryFomatter_1.QueryFormatter.defineGroupedResultSet(innerGroupDeclaration, innerGroupReference, iteratorName, groupingsDeclaration, postProcessing, innerLoops, fillingResults);
                }
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
                preProcessing.push(queryFomatter_1.QueryFormatter.defineDistinctPreProcessing(containerReference));
            }
            if (preProcessing.length) {
                return queryFomatter_1.QueryFormatter.definePreProcessedPushTemplate(containerReference, Query.defineSelection(groupComposition.selection), preProcessing);
            }
            else {
                return queryFomatter_1.QueryFormatter.defineResultsPushTemplate(containerReference, Query.defineSelection(groupComposition.selection));
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
                        comparators.push(orderBy_1.OrderBy.defineGroupComparator(group));
                    }
                });
                return comparators;
            }, [])).join('\n');
        };
        Query.prototype.compareDataSourceType = function (dataSource) {
            return this.dataSource instanceof Array ?
                (dataSource instanceof Array) :
                !(dataSource instanceof Array);
        };
        Query.prototype.logExpressions = function () {
            var _this = this;
            utils.forEach(this.allExpressions, function (exp) {
                return _this.logger.debugObject('Expression', exp);
            });
        };
        Query.defineExpAggregations = function (expressions) {
            return utils.map(expressions, function (exp) {
                return exp.defineAggregation();
            }).join('\n');
        };
        Query.defineSelection = function (selector) {
            var subSelectors = selector.subSelectors;
            if (subSelectors instanceof expression_1.Expression) {
                return subSelectors.code;
            }
            else if (typeof subSelectors === 'string') {
                return subSelectors;
            }
            else if (subSelectors instanceof Array) {
                var expProps = utils.map(subSelectors, function (subSelector) {
                    return Query.defineSelection(subSelector);
                }).join(', ');
                return "[ " + expProps + " ]";
            }
            else {
                var expProps = utils.map(subSelectors, function (subSelector, groupId) {
                    return queryFomatter_1.QueryFormatter.defineProperty(groupId, Query.defineSelection(subSelector));
                }).join(', ');
                return "{ " + expProps + " }";
            }
        };
        return Query;
    }(baseQuery_1.BaseQuery));
    exports.Query = Query;
    var PRIVATE_PROP_FLAGS = { enumerable: false, writable: true };
    var QUERY_PRIVATE_PROPERTIES = {
        allExpressions: PRIVATE_PROP_FLAGS,
        changed: PRIVATE_PROP_FLAGS,
        code: PRIVATE_PROP_FLAGS,
        context: PRIVATE_PROP_FLAGS,
        datasource: PRIVATE_PROP_FLAGS,
        debugLevel: PRIVATE_PROP_FLAGS,
        fn: PRIVATE_PROP_FLAGS,
        groupComposition: PRIVATE_PROP_FLAGS,
        groupMap: PRIVATE_PROP_FLAGS,
        groupingComposition: PRIVATE_PROP_FLAGS,
        logger: PRIVATE_PROP_FLAGS,
        preFiltering: PRIVATE_PROP_FLAGS,
        quotes: PRIVATE_PROP_FLAGS
        // TODO::
    };
});
