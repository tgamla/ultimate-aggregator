import * as utils from '../common/utils';
import { Expression, Quotes, Type as ExpressionType } from '../prototypes/expression'
import { Logger } from '../common/logger';

export class PreProcess {
    public filter: Expression;
    public isNew: boolean;
    public function: Function;

    private rawExpression: string;
    private quotes: Quotes;

    constructor(rawExpression: string) {
        this.isNew = true;
        this.rawExpression = rawExpression;
        this.quotes = {};
    }

    public createFunction(logger: Logger): void {
        this.filter = new Expression(
            ExpressionType.FILTER,
            this.rawExpression,
            this.quotes
            );
        
        if (this.filter.code === '') {
            logger.log('Pre filter expression is empty.'); // TODO:: move to MessageCodes
        }

        var fn = new Function(
            '__quotes__',
            'data',
            utils.format(
`var __results__ = [], prop, row;
for (prop in data) {
    row = data[prop];
    if (({0}))
        __results__.push(row);
}

return __results__;`,
            this.filter.code
            )
        );

        this.function = Function.prototype.bind.apply(fn, [fn, this.quotes]);

        this.isNew = false;
    }
}