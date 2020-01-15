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
Object.defineProperty(exports, "__esModule", { value: true });
var baseQuery_1 = require("./baseQuery");
var BaseGroup = /** @class */ (function (_super) {
    __extends(BaseGroup, _super);
    function BaseGroup(type) {
        var selections = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            selections[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, type) || this;
        _this._uniformed = false;
        _this.applySelect.apply(_this, selections);
        _this.encapsulate();
        return _this;
    }
    BaseGroup.prototype.uniformed = function (apply) {
        this._uniformed = !!(apply);
        return this;
    };
    BaseGroup.prototype.copyTo = function (copy) {
        _super.prototype.copyTo.call(this, copy);
        copy.uniformed(this._uniformed);
    };
    return BaseGroup;
}(baseQuery_1.BaseQuery));
exports.BaseGroup = BaseGroup;
