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
    private readonly _rawExpression: any;
    private readonly _argument: string | number;
    private _distinct: boolean;
    private _over: string[];
    private _orderBy: string[];

    constructor(type: Type, rawExpression: any, argExpression?: string) {
        this.id = utils.generateId();
        this.type = type;
        this._rawExpression = (rawExpression).toString();
        this._argument = argExpression;
    }

    distinct(apply: boolean): AggregateFunction {
        this._distinct = !!(apply);
        return this;
    }

    over(grouping: string | string[]): AggregateFunction {
        this._over = AggregateFunction.getList(grouping);
        return this;
    }

    orderBy(sorting: string | string[]): AggregateFunction {
        this._orderBy = AggregateFunction.getList(sorting);
        return this;
    }

    toString(/* TODO:: use logger or singleton logger */): string {
        const fnType = this.type.toString();
        const fnExpression = this._argument ? this._rawExpression + ', ' + this._argument : this._rawExpression;
        const overArgs = this.defineOver();
        const orderByArgs = this.defineOrderBy();
        const distinct = this._distinct ? 'DISTINCT' : '';

        return `${fnType}(${distinct} ${fnExpression})${overArgs}${orderByArgs}`;
    }

    valueOf(/* TODO:: use logger or singleton logger */): string {
        return this.toString();
    }

    private defineOver(): string {
        if (this._over) {
            const overArgs = this._over.join(', ');
            return `OVER(${overArgs})`;
        }

        return '';
    }

    private defineOrderBy(): string {
        if (this._orderBy) {
            const orderByArgs = this._orderBy.join(', ');
            return `ORDER_BY(${orderByArgs})`;
        }

        return '';
    }

    private static getList(list: string | string[]): string[] {
        return list instanceof Array ? list :
            (typeof list === 'string' ? [ list ] : null);
    }
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
