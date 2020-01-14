import { Logger } from '../common/logger';
import { Expression } from '../expressions/expression';
export declare class PreProcess {
    filter: Expression;
    isNew: boolean;
    function: Function;
    private readonly rawExpression;
    private readonly quotes;
    constructor(rawExpression: string);
    createFunction(logger: Logger): void;
}
