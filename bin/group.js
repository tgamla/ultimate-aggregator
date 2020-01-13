var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./basePrototypes/baseGroup"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var baseGroup_1 = require("./basePrototypes/baseGroup");
    var Group = /** @class */ (function (_super) {
        __extends(Group, _super);
        function Group() {
            var selections = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                selections[_i] = arguments[_i];
            }
            return _super.apply(this, ['Group'].concat(selections)) || this;
        }
        Group.prototype.by = function (grouping) {
            this.applyList(grouping, '_groupBy');
            return this;
        };
        Group.prototype.clone = function () {
            var copied = new Group(this._select);
            _super.prototype.copyTo.call(this, copied);
            copied.by(this._groupBy);
            return copied;
        };
        return Group;
    }(baseGroup_1.BaseGroup));
    exports.Group = Group;
});
