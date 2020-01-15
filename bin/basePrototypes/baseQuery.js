"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aggregateFunction_1 = require("../aggregateFunction");
var utils = require("../common/utils");
var BaseQuery = /** @class */ (function () {
    function BaseQuery(type) {
        this.id = utils.generateId();
        this.type = type;
        this._select = null;
        this._filter = null;
        this._distinct = false;
        this._groupBy = [];
        this._orderBy = [];
        this._asList = true;
        this.encapsulate();
    }
    BaseQuery.prototype.distinct = function (apply) {
        this.applyDistinct(apply);
        return this;
    };
    BaseQuery.prototype.filter = function (rawFilter) {
        this.applyFilter(rawFilter);
        return this;
    };
    BaseQuery.prototype.range = function (length, start) {
        // TODO::
        return this;
    };
    BaseQuery.prototype.orderBy = function (rawSorting) {
        this.applyList(rawSorting, '_orderBy');
        return this;
    };
    BaseQuery.prototype.asObject = function (propertyExpression) {
        // TODO::
        // If propertyExpression not defined then use indexing as in Array
        return this;
    };
    BaseQuery.prototype.asList = function () {
        // TODO::
        return this;
    };
    BaseQuery.prototype.asValue = function (propName) {
        // TODO::
        // If propName && selector is non primitive then thro warning/error
        return this;
    };
    BaseQuery.prototype.getDefinition = function () {
        return {
            id: this.id,
            type: this.type,
            select: this._select,
            filter: this._filter,
            distinct: this._distinct,
            groupBy: this._groupBy,
            orderBy: this._orderBy,
            asList: this._asList
        };
    };
    BaseQuery.prototype.encapsulate = function () {
        // TODO::
    };
    BaseQuery.prototype.applySelect = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._select = utils.map(args, function (arg) { return _this.copySelect(arg); })[0]; // TODO:: remove index slector
    };
    BaseQuery.prototype.applyList = function (rawList, appliedListRef) {
        var appliedList = this[appliedListRef];
        var hasAnyChanged = false;
        if (rawList == null) {
            if (appliedList.length !== 0) {
                this[appliedListRef] = [];
                hasAnyChanged = true;
            }
        }
        else if (typeof rawList === 'string') {
            if (appliedList.length !== 1 && rawList !== appliedList[0]) {
                this[appliedListRef] = [rawList];
                hasAnyChanged = true;
            }
        }
        else if (rawList instanceof Array) {
            var newList_1 = [];
            if (utils.some(rawList, function (element, index) {
                if (typeof element === 'string') {
                    if (!hasAnyChanged) {
                        hasAnyChanged = element !== appliedList[index];
                    }
                    newList_1.push(element);
                    return false;
                }
                // TODO:: warning
                return true;
            })) {
                hasAnyChanged = false;
            }
            else if (hasAnyChanged || newList_1.length !== appliedList.length) {
                this[appliedListRef] = newList_1;
                hasAnyChanged = true;
            }
        }
        else {
            // TODO:: warning
        }
        return hasAnyChanged;
    };
    BaseQuery.prototype.applyDistinct = function (apply) {
        if (apply === void 0) { apply = false; }
        var newVal = !!(apply);
        if (this._distinct === newVal) {
            return false;
        }
        this._distinct = newVal;
        return true;
    };
    BaseQuery.prototype.applyFilter = function (rawFilter) {
        if (this._filter !== rawFilter) {
            this._filter = rawFilter;
            return true;
        }
        return false;
    };
    BaseQuery.prototype.copyTo = function (copy) {
        copy.orderBy(this._orderBy)
            .filter(this._filter)
            .distinct(this._distinct);
    };
    BaseQuery.prototype.copySelect = function (selection) {
        var _this = this;
        if (typeof selection === 'object' && selection != null) {
            if (selection instanceof aggregateFunction_1.AggregateFunction) {
                return selection.toString();
            }
            else if (selection.clone instanceof Function) {
                return selection.clone();
            }
            else if (selection instanceof Array) {
                return utils.reduce(selection, function (acc, val) {
                    acc.push(_this.copySelect(val));
                    return acc;
                }, []);
            }
            else {
                return utils.reduce(selection, function (acc, val, prop) {
                    acc[prop] = _this.copySelect(val);
                    return acc;
                }, {});
            }
        }
        return selection;
    };
    return BaseQuery;
}());
exports.BaseQuery = BaseQuery;
