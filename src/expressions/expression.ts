import * as utils from '../common/utils';
import { ExpressionType } from '../constants/expressionType';
import * as REG_EXPS from '../constants/regexps';

export class Expression {

    id: string;
    type: ExpressionType;
    level: number;
    raw: string;
    code: string;
    normalized: string;
    groupIds: string[];
    parentGroupingId: string;
    hasIndex: boolean;
    hasGroupIndex: boolean;

    constructor(
        type: ExpressionType,
        rawExpression: any,
        queryQuotes: IQuotes,
        parentGroupingId: string = null
    ) {
        this.type = type;
        this.id = utils.generateId();
        this.code = this.raw = Expression.convertToStr(rawExpression);
        this.groupIds = [];
        this.parentGroupingId = parentGroupingId;
        this.hasGroupIndex = false;
        this.hasIndex = false;

        this.normalizeCode(queryQuotes);
    }

    normalize(): void {
        this.normalized = this.code.replace(REG_EXPS.ANY_VALID_NAME, '"$1"').replace(/\s/gm, '');
    }

    equals(exp: Expression): boolean {
        return this.type === exp.type && this.normalized === exp.normalized;
    }

    addGroupId(groupId: string): void {
        if (groupId && this.groupIds.indexOf(groupId) === -1) {
            this.groupIds.push(groupId);
        }
    }

    getGroupingId(): string {
        return this.parentGroupingId || '__groupings__';
    }

    hasGroupId(groupId): boolean {
        return utils.some(this.groupIds, (thisGroupId) => thisGroupId === groupId);
    }

    isSelectiveType(): boolean {
        return !!(this.type === ExpressionType.FIELD || this.type === ExpressionType.AGGREGATE);
    }

    isGroupingExpression(): boolean {
        return this.type === ExpressionType.GROUP_BY;
    }

    checkForIndex(): boolean {
        return REG_EXPS.SINGLE_INDEX.test(this.code);
    }

    handleGroupIndex(): void {
        if (this.parentGroupingId) {
            this.code = this.code.replace(REG_EXPS.GROUP_INDEX, (...args) => {
                this.hasGroupIndex = true;
                return args[1] + this.parentGroupingId + '.groupIndex' + args[2];
            });
        }
    }

    defineValReference(suffix?: string): string {
        return (this.parentGroupingId || '__groupings__') + '.' +
            (suffix ? utils.addIdSuffix(this.id, suffix) : this.id);
    }

    static isAnyUsingIndex(expressions: Expression[]) {
        return utils.some<Expression>(expressions, (exp) => exp.hasIndex);
    }

    // =========================================================================================================
    // ============================================ PROTECTED METHODS ============================================
    // =========================================================================================================

    protected validate() {
        if (!this.code) {
            throw utils.format(
                'Expression of {0} type cannot be empty!',
                this.type,
                this.raw
            );
        }

        try {
            // tslint:disable-next-line:no-unused-expression
            new Function('return (' + this.code + ')');
        }
        catch (exc) {
            throw utils.format(
`Invalid expression of {0} type;
Converted: ({1})
Original: ({2})
{3}`,
                this.type,
                this.code,
                this.raw,
                exc
            );
        }
    }

    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================

    private normalizeCode(queryQuotes: IQuotes) {
        this.replaceComments();
        this.replaceQuotes(queryQuotes);
        this.optimizeDotNotation(queryQuotes);
        this.code = this.code.trim().replace(/;\s*$/m, '');
    }

    private replaceComments() {
        this.code = this.code.replace(REG_EXPS.COMMENTS, '');
    }

    private replaceQuotes(queryQuotes: IQuotes) {
        this.code = this.code.replace(REG_EXPS.QUOTES, (match) => {
            const matchedQuote = match.substr(1, match.length - 2);
            let quoteId;

            if (!utils.some(queryQuotes, (quote, id) => {
                if (quote === matchedQuote) {
                    quoteId = id;
                    return true;
                }
            })) {
                quoteId = utils.generateId();
                queryQuotes[quoteId] = matchedQuote;
            }

            return  ' __quotes__.' + quoteId + ' ';
        });
    }

    private optimizeDotNotation(queryQuotes: IQuotes): void {
        let propName;
        let foundMatch = false;

        this.code = this.code.replace(REG_EXPS.BRACKET_NOTATION, (match: string, ...args: any[]) => {
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
    }

    private static convertToStr(rawExpression: any): string {
        switch(typeof rawExpression) {
            case 'function': throw new Error('Expression cannot be a function!\nfunction name:' + rawExpression.name + '\nfunction body:' + rawExpression.toString());
            case 'undefined': return 'undefined';
            case 'object': return 'null';
            case 'string': return rawExpression;
            default: return (rawExpression).toString();
        }
    }
}

export interface IQuotes {
    string?: string;
}
