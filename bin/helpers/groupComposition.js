(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../common/utils", "../common/logger"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var logger_1 = require("../common/logger");
    var GroupComposition = /** @class */ (function () {
        function GroupComposition(groupId, distinct, filter, grouping, sorting, isMain, isUngroup, hasParentGrouping) {
            if (isMain === void 0) { isMain = false; }
            if (isUngroup === void 0) { isUngroup = false; }
            if (hasParentGrouping === void 0) { hasParentGrouping = false; }
            this.id = groupId;
            this.distinct = distinct;
            this.filter = filter;
            this.grouping = grouping;
            this.sorting = sorting;
            this.outputType = OutputType.AS_LIST;
            this.innerGroups = [];
            this.isMain = isMain;
            this.isUngroup = isUngroup;
            this.hasParentGrouping = hasParentGrouping;
        }
        GroupComposition.prototype.getInitVariable = function () {
            var initValue;
            switch (this.outputType) {
                case OutputType.AS_LIST:
                    initValue = '[]';
                    break;
                case OutputType.AS_OBJECT:
                    initValue = '{}';
                    break;
                default: initValue = 'null';
            }
            ;
            return utils.format('{0} = {1}', this.id, initValue);
        };
        GroupComposition.prototype.isSubSelectorGroup = function () {
            return !this.isMain && !this.isUngroup;
        };
        GroupComposition.prototype.hasSorting = function () {
            return this.sorting.length > 0;
        };
        GroupComposition.prototype.getSubGroups = function () {
            return this.innerGroups.filter(function (innerGroup) { return !innerGroup.isUngroup; });
        };
        GroupComposition.prototype.getUngroupReference = function () {
            var directGrouping = this.grouping[this.grouping.length - 1];
            var groupingId = directGrouping ? directGrouping.id : '__groupings__';
            return groupingId + '.' + this.id;
        };
        GroupComposition.prototype.extendChildGrouping = function (logger, grouping) {
            var _this = this;
            var childGrouping = utils.copy(this.grouping);
            utils.forEach(grouping, function (groupBy) {
                var matchParentsGroupBy = utils.some(_this.grouping, function (parentGroupBy) {
                    return parentGroupBy.equals(groupBy);
                });
                if (matchParentsGroupBy) {
                    logger.log(logger_1.MessageCodes.UNNECESSARY_GROUP_BY, groupBy.raw);
                }
                else {
                    childGrouping.push(groupBy);
                }
            });
            return childGrouping;
        };
        GroupComposition.prototype.defineSorting = function () {
            return this.hasSorting() ?
                '.sort(' + utils.addIdSuffix(this.id, 'Comparator') + ')' :
                '';
        };
        return GroupComposition;
    }());
    exports.GroupComposition = GroupComposition;
    var Selector = /** @class */ (function () {
        function Selector() {
            this.isLeaf = true;
            this.ungroupLabelDef = null;
            this.subSelectors = null;
        }
        return Selector;
    }());
    exports.Selector = Selector;
    var OutputType;
    (function (OutputType) {
        OutputType[OutputType["AS_LIST"] = 0] = "AS_LIST";
        OutputType[OutputType["AS_OBJECT"] = 1] = "AS_OBJECT";
        OutputType[OutputType["AS_VALUE"] = 2] = "AS_VALUE";
    })(OutputType = exports.OutputType || (exports.OutputType = {}));
});
