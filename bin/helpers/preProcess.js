"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expressionType_1 = require("../constants/expressionType");
var expression_1 = require("../expressions/expression");
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
        var fn = new Function('__quotes__', 'data', "var __results__ = [], prop, row;\nfor (prop in data) {\n    row = data[prop];\n    if ((" + this.filter.code + "))\n        __results__.push(row);\n}\n\nreturn __results__;");
        this.function = Function.prototype.bind.apply(fn, [fn, this.quotes]);
        this.isNew = false;
    };
    return PreProcess;
}());
exports.PreProcess = PreProcess;
