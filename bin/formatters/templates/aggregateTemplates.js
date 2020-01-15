"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AggregateTemplates = /** @class */ (function () {
    function AggregateTemplates() {
    }
    AggregateTemplates.SUM = "    __val__ = {0};\n    if (__val__)\n        {1} = ({1} || 0) + __val__;";
    AggregateTemplates.DISTINCT_SUM = "    __val__ = {0};\n    if (__val__ && {2}[__val__] !== true) {\n        {1} = ({1} || 0) + __val__;\n        {2}[__val__] = true;\n    }";
    AggregateTemplates.MIN = "    __val__ = {0};\n    if (__val__ != null && ({1} > __val__ || {1} == null))\n        {1} = __val__;";
    AggregateTemplates.MAX = "    __val__ = {0};\n    if (__val__ != null && ({1} < __val__ || {1} == null))\n        {1} = __val__;";
    AggregateTemplates.FIRST = "    if ({2} === 1)\n        {1} = {0};";
    AggregateTemplates.FIRST_ORDER_BY = "    __val__ = {2};\n    if ({3} === 1 || {0}({1}, __val__) > 0)\n        {1} = __val__;";
    AggregateTemplates.LAST = "    {1} = {0};";
    AggregateTemplates.LAST_ORDER_BY = "    __val__ = {2};\n    if ({3} === 1 || {0}(__val__, {1}) > 0)\n        {1} = __val__;";
    AggregateTemplates.NTH = "    if ({2} == {3})\n        {1} = {0}";
    AggregateTemplates.DISTINCT_NTH = "    __val__ = {0};\n    if ({3}[__val__] !== true) {\n        if ({4} == {2})\n            {1} = __val__;\n        else {\n            {3}[__val__] = true;\n            {4}++;\n        }\n    }";
    AggregateTemplates.NTH_ORDER_BY = "    {0}.push({1});";
    AggregateTemplates.DISTINCT_NTH_ORDER_BY = "    __val__ = {1};\n    if ({2}[__val__] !== true) {\n        {0}.push(__val__);\n        {2}[__val__] = true;\n    }";
    AggregateTemplates.COUNT = "    if (({0}) != null)\n        {1}++;";
    AggregateTemplates.DISTINCT_COUNT = "    __val__ = {0};\n    if (__val__ != null && {2}[__val__] !== true) {\n        {1}++;\n        {2}[__val__] = true;\n    }";
    AggregateTemplates.AVG = "    __val__ = {0}\n    if (__val__ != null)\n        { {1}.count++; {1}.val += __val__; };";
    AggregateTemplates.DISTINCT_AVG = "    __val__ = {0}\n    if (__val__ != null && {2}[__val__] !== true) {\n        {1}.count++;\n        {1}.val += __val__;\n        {2}[__val__] = true;\n    };";
    AggregateTemplates.CONCAT = "    __val__ = {0};\n    if (__val__ != null)\n        {1}.push({2});";
    AggregateTemplates.DISTINCT_CONCAT = "    __val__ = {0};\n    if (__val__ != null && {3}[__val__] !== true) {\n        {1}.push({2});\n        {3}[__val__] = true;\n    }";
    return AggregateTemplates;
}());
exports.AggregateTemplates = AggregateTemplates;
