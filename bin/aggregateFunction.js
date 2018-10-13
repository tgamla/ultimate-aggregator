(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./common/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("./common/utils");
    function count(rawExpression) {
        return new AggregateFunction(Type.COUNT, rawExpression);
    }
    exports.count = count;
    function sum(rawExpression) {
        return new AggregateFunction(Type.SUM, rawExpression);
    }
    exports.sum = sum;
    function avg(rawExpression) {
        return new AggregateFunction(Type.AVG, rawExpression);
    }
    exports.avg = avg;
    function min(rawExpression) {
        return new AggregateFunction(Type.MIN, rawExpression);
    }
    exports.min = min;
    function max(rawExpression) {
        return new AggregateFunction(Type.MAX, rawExpression);
    }
    exports.max = max;
    function first(rawExpression) {
        return new AggregateFunction(Type.FIRST, rawExpression);
    }
    exports.first = first;
    function last(rawExpression) {
        return new AggregateFunction(Type.LAST, rawExpression);
    }
    exports.last = last;
    function nth(rawExpression, no) {
        return new AggregateFunction(Type.NTH, rawExpression, no);
    }
    exports.nth = nth;
    function concat(rawExpression, delimiter) {
        return new AggregateFunction(Type.CONCAT, rawExpression, delimiter);
    }
    exports.concat = concat;
    var AggregateFunction = /** @class */ (function () {
        function AggregateFunction(type, rawExpression, argExpression) {
            this.id = utils.generateId();
            this.type = type;
            this._rawExpression = (rawExpression).toString();
            this._argument = argExpression;
        }
        AggregateFunction.prototype.distinct = function (apply) {
            this._distinct = apply ? true : false;
            return this;
        };
        AggregateFunction.prototype.over = function (grouping) {
            this._over = AggregateFunction.getList(grouping);
            return this;
        };
        AggregateFunction.prototype.orderBy = function (sorting) {
            this._orderBy = AggregateFunction.getList(sorting);
            return this;
        };
        AggregateFunction.prototype.toString = function () {
            return utils.format(AggregateFunction.FUNCTION_TEMPLATE, this.type.toString(), this._argument ? this._rawExpression + ', ' + this._argument : this._rawExpression, this.defineOver(), this.defineOrderBy(), this._distinct ? 'DISTINCT' : '');
        };
        AggregateFunction.prototype.valueOf = function () {
            return this.toString();
        };
        AggregateFunction.getList = function (list) {
            return list instanceof Array ? list :
                (typeof list === 'string' ? [list] : null);
        };
        AggregateFunction.prototype.defineOver = function () {
            return this._over ?
                utils.format(AggregateFunction.DIRECTIVE_TEMPLATE, 'OVER', this._over.join(', ')) :
                '';
        };
        AggregateFunction.prototype.defineOrderBy = function () {
            return this._orderBy ?
                utils.format(AggregateFunction.DIRECTIVE_TEMPLATE, 'ORDER_BY', this._orderBy.join(', ')) :
                '';
        };
        AggregateFunction.FUNCTION_TEMPLATE = '{0}({4} {1}){2}{3}';
        AggregateFunction.DIRECTIVE_TEMPLATE = '{0}({1})';
        return AggregateFunction;
    }());
    exports.AggregateFunction = AggregateFunction;
    var Type;
    (function (Type) {
        Type["COUNT"] = "COUNT";
        Type["SUM"] = "SUM";
        Type["AVG"] = "AVG";
        Type["MIN"] = "MIN";
        Type["MAX"] = "MAX";
        Type["FIRST"] = "FIRST";
        Type["LAST"] = "LAST";
        Type["NTH"] = "NTH";
        Type["CONCAT"] = "CONCAT";
    })(Type = exports.Type || (exports.Type = {}));
});
