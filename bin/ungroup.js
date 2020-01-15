"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var baseGroup_1 = require("./basePrototypes/baseGroup");
var Ungroup = /** @class */ (function (_super) {
    __extends(Ungroup, _super);
    function Ungroup() {
        var selections = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            selections[_i] = arguments[_i];
        }
        return _super.apply(this, __spreadArrays(['Ungroup'], selections)) || this;
    }
    Ungroup.prototype.clone = function () {
        var copied = new Ungroup(this._select);
        _super.prototype.copyTo.call(this, copied);
        return copied;
    };
    return Ungroup;
}(baseGroup_1.BaseGroup));
exports.Ungroup = Ungroup;
