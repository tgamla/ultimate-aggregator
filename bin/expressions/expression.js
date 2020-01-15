"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../common/utils");
var expressionType_1 = require("../constants/expressionType");
var REG_EXPS = require("../constants/regexps");
var Expression = /** @class */ (function () {
    function Expression(type, rawExpression, queryQuotes, parentGroupingId) {
        if (parentGroupingId === void 0) { parentGroupingId = null; }
        this.type = type;
        this.id = utils.generateId();
        this.code = this.raw = Expression.convertToStr(rawExpression);
        this.groupIds = [];
        this.parentGroupingId = parentGroupingId;
        this.hasGroupIndex = false;
        this.hasIndex = false;
        this.normalizeCode(queryQuotes);
    }
    Expression.prototype.normalize = function () {
        this.normalized = this.code.replace(REG_EXPS.ANY_VALID_NAME, '"$1"').replace(/\s/gm, '');
    };
    Expression.prototype.equals = function (exp) {
        return this.type === exp.type && this.normalized === exp.normalized;
    };
    Expression.prototype.addGroupId = function (groupId) {
        if (groupId && this.groupIds.indexOf(groupId) === -1) {
            this.groupIds.push(groupId);
        }
    };
    Expression.prototype.getGroupingId = function () {
        return this.parentGroupingId || '__groupings__';
    };
    Expression.prototype.hasGroupId = function (groupId) {
        return utils.some(this.groupIds, function (thisGroupId) { return thisGroupId === groupId; });
    };
    Expression.prototype.isSelectiveType = function () {
        return !!(this.type === expressionType_1.ExpressionType.FIELD || this.type === expressionType_1.ExpressionType.AGGREGATE);
    };
    Expression.prototype.isGroupingExpression = function () {
        return this.type === expressionType_1.ExpressionType.GROUP_BY;
    };
    Expression.prototype.checkForIndex = function () {
        return REG_EXPS.SINGLE_INDEX.test(this.code);
    };
    Expression.prototype.handleGroupIndex = function () {
        var _this = this;
        if (this.parentGroupingId) {
            this.code = this.code.replace(REG_EXPS.GROUP_INDEX, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.hasGroupIndex = true;
                return args[1] + _this.parentGroupingId + '.groupIndex' + args[2];
            });
        }
    };
    Expression.prototype.defineValReference = function (suffix) {
        return (this.parentGroupingId || '__groupings__') + '.' +
            (suffix ? utils.addIdSuffix(this.id, suffix) : this.id);
    };
    Expression.isAnyUsingIndex = function (expressions) {
        return utils.some(expressions, function (exp) { return exp.hasIndex; });
    };
    // =========================================================================================================
    // ============================================ PROTECTED METHODS ============================================
    // =========================================================================================================
    Expression.prototype.validate = function () {
        if (!this.code) {
            throw utils.format('Expression of {0} type cannot be empty!', this.type, this.raw);
        }
        try {
            // tslint:disable-next-line:no-unused-expression
            new Function('return (' + this.code + ')');
        }
        catch (exc) {
            throw utils.format("Invalid expression of {0} type;\nConverted: ({1})\nOriginal: ({2})\n{3}", this.type, this.code, this.raw, exc);
        }
    };
    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================
    Expression.prototype.normalizeCode = function (queryQuotes) {
        this.replaceComments();
        this.replaceQuotes(queryQuotes);
        this.optimizeDotNotation(queryQuotes);
        this.code = this.code.trim().replace(/;\s*$/m, '');
    };
    Expression.prototype.replaceComments = function () {
        this.code = this.code.replace(REG_EXPS.COMMENTS, '');
    };
    Expression.prototype.replaceQuotes = function (queryQuotes) {
        this.code = this.code.replace(REG_EXPS.QUOTES, function (match) {
            var matchedQuote = match.substr(1, match.length - 2);
            var quoteId;
            if (!utils.some(queryQuotes, function (quote, id) {
                if (quote === matchedQuote) {
                    quoteId = id;
                    return true;
                }
            })) {
                quoteId = utils.generateId();
                queryQuotes[quoteId] = matchedQuote;
            }
            return ' __quotes__.' + quoteId + ' ';
        });
    };
    Expression.prototype.optimizeDotNotation = function (queryQuotes) {
        var propName;
        var foundMatch = false;
        this.code = this.code.replace(REG_EXPS.BRACKET_NOTATION, function (match) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            propName = queryQuotes[args[3]];
            if ((REG_EXPS.DOT.test(args[0]) || !REG_EXPS.JS_SYNTAXES.test(args[1])) && REG_EXPS.VALID_DOT_NOTATION_PROP_NAME.test(propName)) {
                foundMatch = true;
                // arg 1: bracket notation, arg 2: quote id
                return match.replace(args[2], '.' + propName);
            }
            return match; // full match
        });
        if (foundMatch) {
            this.optimizeDotNotation(queryQuotes);
        }
    };
    Expression.convertToStr = function (rawExpression) {
        switch (typeof rawExpression) {
            case 'function': throw new Error('Expression cannot be a function!\nfunction name:' + rawExpression.name + '\nfunction body:' + rawExpression.toString());
            case 'undefined': return 'undefined';
            case 'object': return 'null';
            case 'string': return rawExpression;
            default: return (rawExpression).toString();
        }
    };
    return Expression;
}());
exports.Expression = Expression;
