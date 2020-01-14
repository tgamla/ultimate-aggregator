import { ExpressionType } from '../constants/expressionType';
export declare class Expression {
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
    constructor(type: ExpressionType, rawExpression: any, queryQuotes: IQuotes, parentGroupingId?: string);
    normalize(): void;
    equals(exp: Expression): boolean;
    addGroupId(groupId: string): void;
    getGroupingId(): string;
    hasGroupId(groupId: any): boolean;
    isSelectiveType(): boolean;
    isGroupingExpression(): boolean;
    checkForIndex(): boolean;
    handleGroupIndex(): void;
    defineValReference(suffix?: string): string;
    static isAnyUsingIndex(expressions: Expression[]): boolean;
    protected validate(): void;
    private normalizeCode(queryQuotes);
    private replaceComments();
    private replaceQuotes(queryQuotes);
    private optimizeDotNotation(queryQuotes);
    private static convertToStr(rawExpression);
}
export interface IQuotes {
    string?: string;
}
