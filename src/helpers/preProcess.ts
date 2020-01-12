import { Logger } from '../common/logger';
import { ExpressionType } from '../constants/expressionType';
import { Expression, IQuotes } from '../expressions/expression';

export class PreProcess {
    filter: Expression;
    isNew: boolean;
    function: Function;

    private readonly rawExpression: string;
    private readonly quotes: IQuotes;

    constructor(rawExpression: string) {
        this.isNew = true;
        this.rawExpression = rawExpression;
        this.quotes = {};
    }

    createFunction(logger: Logger): void {
        this.filter = new Expression(
            ExpressionType.FILTER,
            this.rawExpression,
            this.quotes
            );

        if (this.filter.code === '') {
            logger.log('Pre filter expression is empty.'); // TODO:: move to MessageCodes
        }

        const fn = new Function(
            '__quotes__',
            'data',
`var __results__ = [], prop, row;
for (prop in data) {
    row = data[prop];
    if ((${this.filter.code}))
        __results__.push(row);
}

return __results__;`
        );

        this.function = Function.prototype.bind.apply(fn, [fn, this.quotes]);

        this.isNew = false;
    }
}
