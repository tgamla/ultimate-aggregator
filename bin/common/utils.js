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
    function forEach(source, iterator) {
        if (source instanceof Array || (typeof source === 'object' && source !== null)) {
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    iterator(source[prop], prop);
                }
            }
        }
        else if (source != null) {
            iterator(source, null);
        }
    }
    exports.forEach = forEach;
    function forEachRecursive(source, inner, iterator) {
        forEach(source[inner], function (elem, prop) {
            iterator(elem, prop);
            if (elem != null && typeof elem === 'object' && elem[inner]) {
                forEachRecursive(elem, inner, iterator);
            }
        });
    }
    exports.forEachRecursive = forEachRecursive;
    function reduce(source, iterator, accumulator) {
        forEach(source, function (val, prop) {
            accumulator = iterator(accumulator, val, prop);
        });
        return accumulator;
    }
    exports.reduce = reduce;
    function map(source, iterator) {
        var res = [];
        forEach(source, function (val, prop) {
            return res.push(iterator(val, prop));
        });
        return res;
    }
    exports.map = map;
    function reverseMap(source, iterator) {
        var reversedProperties = Object.keys(source).reverse();
        var res = [];
        forEach(reversedProperties, function (prop) {
            res.push(iterator(source[prop], prop));
        });
        return res;
    }
    exports.reverseMap = reverseMap;
    function find(source, predicate) {
        if (!isEmpty(source)) {
            for (var prop in source) {
                if (source.hasOwnProperty(prop) && predicate(source[prop], prop)) {
                    return source[prop];
                }
            }
        }
        return null;
    }
    exports.find = find;
    function returnFound(source, predicate) {
        if (!isEmpty(source)) {
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    var val = predicate(source[prop], prop);
                    if (val) {
                        return val;
                    }
                }
            }
        }
        return null;
    }
    exports.returnFound = returnFound;
    function some(source, predicate) {
        if (!isEmpty(source)) {
            for (var prop in source) {
                if (source.hasOwnProperty(prop) && predicate(source[prop], prop)) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.some = some;
    function deepCopy(source) {
        var res = copy(source);
        // TODO:: filter
        forEach(res, function (val, prop) {
            if (val && typeof val === 'object') {
                res[prop] = deepCopy(val);
            }
        });
        return res;
    }
    exports.deepCopy = deepCopy;
    function copy(source, output) {
        if (typeof source === 'object' && source !== null) {
            var copiedObj = void 0;
            if (output) {
                copiedObj = output;
            }
            else if (source instanceof Array) {
                copiedObj = [];
            }
            else {
                copiedObj = {};
            }
            // TODO:: Object.setPrototypeOf(copy, Object.getPrototypeOf(source));
            // tslint:disable-next-line
            copy['__proto__'] = Object.getPrototypeOf(source);
            return reduce(source, function (copied, val, prop) {
                copied[prop] = val;
                return copied;
            }, copiedObj);
        }
        else {
            return source;
        }
    }
    exports.copy = copy;
    function isEmpty(val) {
        return val == null ||
            (typeof val === 'object' && Object.keys(val).length === 0);
    }
    exports.isEmpty = isEmpty;
    function keysLength(source) {
        if (source !== null && typeof source === 'object') {
            return Object.keys(source).length;
        }
        else {
            return -1;
        }
    }
    exports.keysLength = keysLength;
    var currentId = 0;
    function generateId() {
        return formatId(++currentId);
    }
    exports.generateId = generateId;
    function denormalizeId(id) {
        return id.replace(/__(\d+)__/, '$1');
    }
    exports.denormalizeId = denormalizeId;
    var ID_TEMPLATE = '__{0}__';
    function formatId(id) {
        return format(ID_TEMPLATE, id.toString());
    }
    exports.formatId = formatId;
    function format(text) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (text || '').replace(/\{\d+}/gm, function (match) {
            return args[parseInt(match.substring(1, match.length - 1))];
        });
    }
    exports.format = format;
    function addIdSuffix(id, suffix) {
        return id.replace(/(__$)/, suffix + '$1');
    }
    exports.addIdSuffix = addIdSuffix;
    var PROTO_PROP_FLAGS = { enumerable: false };
    function encapsulate(obj) {
        Object.defineProperties(obj, reduce(obj, function (def, val, prop) {
            def[prop] = PROTO_PROP_FLAGS;
            return def;
        }, {}));
        Object.freeze(obj);
    }
    exports.encapsulate = encapsulate;
});
