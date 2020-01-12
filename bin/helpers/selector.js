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
    var Selector = /** @class */ (function () {
        function Selector() {
            this.isLeaf = true;
            this.ungroupLabelDef = null;
            this.subSelectors = null;
        }
        return Selector;
    }());
    exports.Selector = Selector;
});
