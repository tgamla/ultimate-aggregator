"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aggregateFunction_1 = require("./aggregateFunction");
exports.AggregateFunction = aggregateFunction_1.AggregateFunction;
exports.avg = aggregateFunction_1.avg;
exports.concat = aggregateFunction_1.concat;
exports.count = aggregateFunction_1.count;
exports.first = aggregateFunction_1.first;
exports.last = aggregateFunction_1.last;
exports.max = aggregateFunction_1.max;
exports.min = aggregateFunction_1.min;
exports.nth = aggregateFunction_1.nth;
exports.sum = aggregateFunction_1.sum;
exports.AggregateFunctionType = aggregateFunction_1.Type;
var group_1 = require("./group");
exports.Group = group_1.Group;
var query_1 = require("./query");
exports.Query = query_1.Query;
var ungroup_1 = require("./ungroup");
exports.Ungroup = ungroup_1.Ungroup;
function query(config) { return new query_1.Query(config); }
exports.query = query;
function group(selection) { return new group_1.Group(selection); }
exports.group = group;
function ungroup(selection) { return new ungroup_1.Ungroup(selection); }
exports.ungroup = ungroup;
function aggregateFunction(type, rawExpression, argExpression) {
    return new aggregateFunction_1.AggregateFunction(type, rawExpression, argExpression);
}
exports.aggregateFunction = aggregateFunction;
