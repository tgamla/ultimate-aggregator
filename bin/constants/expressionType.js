(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExpressionType;
    (function (ExpressionType) {
        ExpressionType["FIELD"] = "FIELD";
        ExpressionType["AGGREGATE"] = "AGGREGATE";
        ExpressionType["GROUP_BY"] = "GROUP_BY";
        ExpressionType["ORDER_BY"] = "ORDER_BY";
        ExpressionType["FILTER"] = "FILTER";
        ExpressionType["ARGUMENT"] = "ARGUMENT";
    })(ExpressionType = exports.ExpressionType || (exports.ExpressionType = {}));
});
