"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../common/utils");
var aggregate_1 = require("../expressions/aggregate");
var field_1 = require("../expressions/field");
var GroupingComposition = /** @class */ (function () {
    function GroupingComposition(groupingExpression) {
        this.id = groupingExpression ? groupingExpression.id : null;
        this.groupingExpression = groupingExpression;
        this.inner = {};
        this.expressions = [];
        this.hasBeenDefined = false;
    }
    GroupingComposition.prototype.getGroupingVariableDeclarations = function () {
        var _this = this;
        var isParentComplex = this.isComplex();
        var declarations = [];
        utils.forEach(this.inner, function (innerGroupingComp) {
            declarations = declarations.concat(innerGroupingComp.getGroupingDeclarations(isParentComplex, _this.id)[0]).concat(innerGroupingComp.getGroupingVariableDeclarations());
        });
        return declarations;
    };
    GroupingComposition.prototype.getGroupingDeclarations = function (isParentComplex, parentId) {
        var parentGrouping = parentId || '__groupings__';
        if (isParentComplex) {
            var groupingId = this.id;
            var innerGroupReference = parentGrouping + groupingId;
            return [
                innerGroupReference,
                innerGroupReference + ' = ' + parentGrouping + '.' + groupingId
            ];
        }
        else {
            return [parentGrouping];
        }
    };
    GroupingComposition.prototype.defineGroupings = function (groupMap, baseGroupings, isLastIteration, groupingIds, definedGroupings) {
        var _this = this;
        if (isLastIteration === void 0) { isLastIteration = true; }
        if (groupingIds === void 0) { groupingIds = ''; }
        if (definedGroupings === void 0) { definedGroupings = []; }
        return utils.map(this.inner, function (groupingComp, groupingId) {
            var baseGrouping = baseGroupings.inner[groupingId];
            var currentGroupingIds = groupingIds + groupingId;
            var parentGrouping = (baseGroupings.groupingExpression ? _this.id : '__groupings__') +
                (baseGroupings.isComplex() ? '.' + groupingId : '');
            var definition;
            if (!baseGrouping.hasBeenDefined) {
                var currentGroupMaps = groupMap[currentGroupingIds];
                definition = utils.format(GroupingComposition.GROUPING_DECLARATION_TEMPLATE, groupingComp.id, groupingComp.groupingExpression.valueId, groupingComp.groupingExpression.code, parentGrouping, GroupingComposition.defineGrouping(baseGrouping, currentGroupMaps), GroupingComposition.defineGroupIndexIncrementation(groupingComp), GroupingComposition.defineGroupRowAssignment(groupingComp));
                baseGrouping.hasBeenDefined = true;
                definedGroupings.push(groupingComp.id);
            }
            else if (definedGroupings.indexOf(groupingComp.id) === -1) {
                definition = utils.format(GroupingComposition.GROUPING_FETCH, groupingComp.id, groupingComp.groupingExpression.code, parentGrouping);
                definedGroupings.push(groupingComp.id);
            }
            return (definition || '') + '\n' + groupingComp.defineGroupings(groupMap, baseGrouping, isLastIteration, currentGroupingIds, definedGroupings);
        }).join('');
    };
    GroupingComposition.prototype.isComplex = function () {
        return !!(this.groupingExpression == null ||
            this.getPrimalAggregations().length + utils.keysLength(this.inner) > 0 ||
            this.hasNonAggregatedGroupedFields());
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
        return utils.some(this.expressions, function (exp) { return exp instanceof field_1.Field && exp.hasNonAggregatedFields && !!exp.grouping.length; });
    };
    GroupingComposition.prototype.hasFieldsWithGroupIndex = function () {
        return utils.some(this.expressions, function (exp) { return exp.hasGroupIndex; });
    };
    GroupingComposition.getComposition = function (expressions) {
        return expressions.reduce(function (groupingComposition, expression) {
            if (expression.isSelectiveType()) {
                var groupComp = expression.grouping.reduce(function (groupingComp, groupingExp) {
                    var innerGrpComp = groupingComp.inner[groupingExp.id];
                    if (innerGrpComp === undefined) {
                        groupingComp.inner[groupingExp.id] = innerGrpComp = new GroupingComposition(groupingExp);
                    }
                    return innerGrpComp;
                }, groupingComposition);
                groupComp.expressions.push(expression);
            }
            return groupingComposition;
        }, new GroupingComposition(null));
    };
    GroupingComposition.defineGrouping = function (baseGrouping, groupCompositions) {
        var props = [];
        var definition;
        // Adds declaration of inner groups
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
        return utils.format(GroupingComposition.OBJECT_COMPOSITION, definition);
    };
    GroupingComposition.defineGroupRowAssignment = function (groupingComp) {
        return groupingComp.hasNonAggregatedGroupedFields() ?
            "\n        " + groupingComp.id + ".row = row;" : '';
    };
    GroupingComposition.defineGroupIndexIncrementation = function (groupingComp) {
        return groupingComp.hasFieldsWithGroupIndex() ?
            "\n        " + groupingComp.id + ".groupIndex++;" : '';
    };
    GroupingComposition.GROUPING_DECLARATION_TEMPLATE = "    {1} = {2};\n    if ({3}.hasOwnProperty({1})) {\n        {0} = {3}[{1}];{5}{6}\n    }\n    else {\n        {0} = {3}[{1}] = {4};\n    }";
    GroupingComposition.GROUPING_FETCH = "    {0} = {2}[{1}];";
    GroupingComposition.OBJECT_COMPOSITION = "{ {0} }";
    return GroupingComposition;
}());
exports.GroupingComposition = GroupingComposition;
