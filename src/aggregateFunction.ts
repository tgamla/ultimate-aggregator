import * as utils from './common/utils';

export function count(rawExpression): AggregateFunction {
    return new AggregateFunction(Type.COUNT, rawExpression);
}

export function sum(rawExpression): AggregateFunction {
    return new AggregateFunction(Type.SUM, rawExpression);
}

export function avg(rawExpression): AggregateFunction {
    return new AggregateFunction(Type.AVG, rawExpression);
}

export function min(rawExpression): AggregateFunction {
    return new AggregateFunction(Type.MIN, rawExpression);
}

export function max(rawExpression): AggregateFunction {
    return new AggregateFunction(Type.MAX, rawExpression);
}

export function first(rawExpression): AggregateFunction {
    return new AggregateFunction(Type.FIRST, rawExpression);
}

export function last(rawExpression): AggregateFunction {
    return new AggregateFunction(Type.LAST, rawExpression);
}

export function nth(rawExpression, no): AggregateFunction {
    return new AggregateFunction(Type.NTH, rawExpression, no);
}

export function concat(rawExpression, delimiter): AggregateFunction {
    return new AggregateFunction(Type.CONCAT, rawExpression, delimiter);
}

export class AggregateFunction implements IAggregateFunction {
    private id: string;
    private type: Type;
    private _rawExpression: any;
    private _argument: string | number;
    private _distinct: boolean;
    private _over: Array<string>;
    private _orderBy: Array<string>;

    constructor(type: Type, rawExpression: any, argExpression?: string) {
        this.id = utils.generateId();
        this.type = type;
        this._rawExpression = (rawExpression).toString();
        this._argument = argExpression;
    }

    public distinct(apply: boolean): AggregateFunction {
        this._distinct = apply ? true : false;
        return this;
    }

    public over(grouping: string | Array<string>): AggregateFunction {
        this._over = AggregateFunction.getList(grouping);
        return this;
    }

    public orderBy(sorting: string | Array<string>): AggregateFunction {
        this._orderBy = AggregateFunction.getList(sorting);
        return this;
    }

    public toString(/* TODO:: use logger or singleton logger */): string {
        return utils.format(AggregateFunction.FUNCTION_TEMPLATE,
            this.type.toString(),
            this._argument ? this._rawExpression + ', ' + this._argument : this._rawExpression,
            this.defineOver(),
            this.defineOrderBy(),
            this._distinct ? 'DISTINCT' : '',
            );
    }

    public valueOf(/* TODO:: use logger or singleton logger */): string {
        return this.toString();
    }

    private static getList(list: string | Array<string>): Array<string> {
        return list instanceof Array ? list :
            (typeof list === 'string' ? [ list ] : null);
    }

    private defineOver(): string {
        return this._over ?
            utils.format(AggregateFunction.DIRECTIVE_TEMPLATE, 'OVER', this._over.join(', ')) :
            '';
    }

    private defineOrderBy(): string {
        return this._orderBy ?
            utils.format(AggregateFunction.DIRECTIVE_TEMPLATE, 'ORDER_BY', this._orderBy.join(', ')) :
            '';
    }

    private static FUNCTION_TEMPLATE = '{0}({4} {1}){2}{3}';
    private static DIRECTIVE_TEMPLATE = '{0}({1})';
}

export enum Type {
    COUNT = 'COUNT',
    SUM = 'SUM',
    AVG = 'AVG',
    MIN = 'MIN',
    MAX = 'MAX',
    FIRST = 'FIRST',
    LAST = 'LAST',
    NTH = 'NTH',
    CONCAT = 'CONCAT'
}