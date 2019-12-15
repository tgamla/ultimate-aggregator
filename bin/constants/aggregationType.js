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
    var AggregationType;
    (function (AggregationType) {
        AggregationType["COUNT"] = "COUNT";
        AggregationType["SUM"] = "SUM";
        AggregationType["AVG"] = "AVG";
        AggregationType["MIN"] = "MIN";
        AggregationType["MAX"] = "MAX";
        AggregationType["CONCAT"] = "CONCAT";
        AggregationType["FIRST"] = "FIRST";
        AggregationType["LAST"] = "LAST";
        AggregationType["NTH"] = "NTH";
    })(AggregationType = exports.AggregationType || (exports.AggregationType = {}));
});
