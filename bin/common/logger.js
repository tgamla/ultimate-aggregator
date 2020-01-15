"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("./utils");
var Logger = /** @class */ (function () {
    function Logger(id, config) {
        this.queryName = config.queryName || utils.denormalizeId(id);
        this.logLevel = config.logLevel == null ? 2 : config.logLevel;
        this.throwingErrorsLevel = config.throwingErrorsLevel == null ? 0 : config.throwingErrorsLevel;
        this.debugObjectToJSON = config.debugObjectToJSON || false;
    }
    Logger.prototype.debugObject = function (msg, obj) {
        console.log(this.formatMessage('DEBUG Object', msg + ':'));
        console.log(this.formatObject(obj));
    };
    Logger.prototype.debug = function (msg) {
        console.log(this.formatMessage('DEBUG', msg));
    };
    Logger.prototype.log = function (msgCode, refObj) {
        if (refObj === void 0) { refObj = ''; }
        if (this.throwingErrorsLevel >= 3) {
            this.throwError(this.getMessage(msgCode, refObj));
        }
        if (this.logLevel >= 3) {
            console.log(this.formatMessage('Log', this.getMessage(msgCode, refObj)));
        }
    };
    Logger.prototype.warning = function (msgCode, refObj) {
        if (refObj === void 0) { refObj = ''; }
        if (this.throwingErrorsLevel >= 2) {
            this.throwError(this.getMessage(msgCode, refObj));
        }
        if (this.logLevel >= 2) {
            console.warn(this.formatMessage('Warning', this.getMessage(msgCode, refObj)));
        }
    };
    Logger.prototype.error = function (msgCode, refObj) {
        if (refObj === void 0) { refObj = ''; }
        if (this.throwingErrorsLevel >= 1) {
            this.throwError(this.getMessage(msgCode, refObj));
        }
        if (this.logLevel >= 1) {
            console.error(this.formatMessage('Error', this.getMessage(msgCode, refObj)));
        }
    };
    Logger.prototype.getMessage = function (msg, refObj) {
        var message = msg instanceof Error ? msg.message : (typeof msg === 'string' ? msg : MESSAGES[msg]);
        return refObj ? message + '\n' + this.formatObject(refObj) : message;
    };
    Logger.prototype.throwError = function (msg) {
        throw new Error(utils.format('Query({0}): {1}', this.queryName, msg));
    };
    Logger.prototype.formatMessage = function (type, msg) {
        return utils.format('Query({0}) {1}: {2}', this.queryName, type, msg);
    };
    Logger.prototype.formatObject = function (obj) {
        return obj === undefined ? '' :
            (this.debugObjectToJSON ? JSON.stringify(obj) : obj);
    };
    return Logger;
}());
exports.Logger = Logger;
var MessageCodes;
(function (MessageCodes) {
    MessageCodes[MessageCodes["UNGROUP_WITHIN_UNGROUP"] = 1] = "UNGROUP_WITHIN_UNGROUP";
    MessageCodes[MessageCodes["GROUP_WITHIN_UNGROUP"] = 2] = "GROUP_WITHIN_UNGROUP";
    MessageCodes[MessageCodes["GROUP_WITH_NO_GROUPING"] = 3] = "GROUP_WITH_NO_GROUPING";
    MessageCodes[MessageCodes["UNNECESSARY_GROUP_BY"] = 4] = "UNNECESSARY_GROUP_BY";
    MessageCodes[MessageCodes["INDEX_USED_IN_GROUP"] = 5] = "INDEX_USED_IN_GROUP";
    MessageCodes[MessageCodes["EMPTY_CONFIG"] = 6] = "EMPTY_CONFIG";
    MessageCodes[MessageCodes["UNSUPPORTED_DATA_TYPE"] = 7] = "UNSUPPORTED_DATA_TYPE";
    MessageCodes[MessageCodes["ANONYMOUS_FN_IN_CONTEXT"] = 8] = "ANONYMOUS_FN_IN_CONTEXT";
    MessageCodes[MessageCodes["ARRAY_IN_CONTEXT"] = 9] = "ARRAY_IN_CONTEXT";
    MessageCodes[MessageCodes["INCORRECT_REFERENCE_IN_CONTEXT"] = 10] = "INCORRECT_REFERENCE_IN_CONTEXT";
    MessageCodes[MessageCodes["EMPTY_REFERENCE_VALUE_IN_CONTEXT"] = 11] = "EMPTY_REFERENCE_VALUE_IN_CONTEXT";
    MessageCodes[MessageCodes["UNNECESSARY_OVERALL_GROUP_BY"] = 12] = "UNNECESSARY_OVERALL_GROUP_BY";
})(MessageCodes = exports.MessageCodes || (exports.MessageCodes = {}));
var MESSAGES = {
    1: 'Unnecessary Ungroup: Please consider replacing Ungroup with Array as selector, inasmuch Ungroups parent is Ungroup;',
    2: 'Unnecessary Group: Please consider replacing Group with Array as selector, inasmuch Groups outer scope is Ungroup;',
    3: 'Unnecessary Group: Please consider replacing Group with Array as selector, inasmuch Group doesn\'t have grouping;',
    4: 'Unnecessary grouping expression: Please consider removing grouping expression, inasmuch it is already part of outser scope grouping;',
    5: 'Field Expression that is being defined in grouped scope shouldn\'t use "index" variable!',
    6: 'Configuration has NOT been applied! config parameter has to be an Object type!',
    7: 'Unsupported data type passed to Query by "from" function!',
    8: 'Anonymous function cannot be passed to context, please consider givin it a name!',
    9: 'Array cannot be passed to conext as reference! Please pass it as second parameter and reference name as first.',
    10: 'Wrong type of reference has been passed to context;',
    11: 'Reference value passed to context is empty;',
    12: 'Unnecessary overall grouping in expression;'
};
