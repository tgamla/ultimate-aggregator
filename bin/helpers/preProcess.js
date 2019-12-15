(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../common/utils", "../expressions/expression", "../constants/expressionType"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require("../common/utils");
    var expression_1 = require("../expressions/expression");
    var expressionType_1 = require("../constants/expressionType");
    var PreProcess = /** @class */ (function () {
        function PreProcess(rawExpression) {
            this.isNew = true;
            this.rawExpression = rawExpression;
            this.quotes = {};
        }
        PreProcess.prototype.createFunction = function (logger) {
            this.filter = new expression_1.Expression(expressionType_1.ExpressionType.FILTER, this.rawExpression, this.quotes);
            if (this.filter.code === '') {
                logger.log('Pre filter expression is empty.'); // TODO:: move to MessageCodes
            }
            var fn = new Function('__quotes__', 'data', utils.format("var __results__ = [], prop, row;\nfor (prop in data) {\n    row = data[prop];\n    if (({0}))\n        __results__.push(row);\n}\n\nreturn __results__;", this.filter.code));
            this.function = Function.prototype.bind.apply(fn, [fn, this.quotes]);
            this.isNew = false;
        };
        return PreProcess;
    }());
    exports.PreProcess = PreProcess;
});
