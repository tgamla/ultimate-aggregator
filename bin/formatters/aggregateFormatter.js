"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../common/utils");
var aggregateTemplates_1 = require("./templates/aggregateTemplates");
var AggregateFormatter = /** @class */ (function () {
    function AggregateFormatter() {
    }
    AggregateFormatter.defineAggregation = function (aggrType, expCode, expObjDef, distinctRef) {
        if (distinctRef === void 0) { distinctRef = ''; }
        return utils.format(aggregateTemplates_1.AggregateTemplates[aggrType], expCode, expObjDef, distinctRef);
    };
    AggregateFormatter.definePostProcessingAvg = function (expObjRef) {
        return expObjRef + " = " + expObjRef + ".val / (" + expObjRef + ".count || 1);";
    };
    AggregateFormatter.definePostProcessingConcat = function (expObjRef, delimiter, sortedValuesObjRef) {
        return "" + sortedValuesObjRef + expObjRef + " = " + expObjRef + ".join(" + delimiter + ");";
    };
    return AggregateFormatter;
}());
exports.AggregateFormatter = AggregateFormatter;
