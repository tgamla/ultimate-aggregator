import * as utils from "../common/utils";
import { Logger, MessageCodes } from '../common/logger';
import { Expression, Type as ExpressionType, Quotes, ExpressionRegExps } from '../prototypes/expression';
import { GroupBy, Grouping } from './groupBy';
import { Sorting, OrderBy } from './orderBy';
import { QueryFormatter } from '../common/formatter';

export class Aggregate extends Expression {

    public level: number;
    public aggregation: Aggregation;
    public isPrimalAggregation: boolean;
    public arguments: Array<Expression>;
    public groupIds: Array<string>;
    public grouping: Grouping;
    public sorting: Sorting;
    public innerExpressions: Array<Aggregate>;
    public hasGroupByOver: boolean;
    public hasDistinct: boolean;
    
    constructor(
        logger: Logger,
        rawExpression: any,
        aggregation: Aggregation,
        queryQuotes: Quotes,
        queryExpressions: Array<Expression>,
        groupId: string = null,
        grouping: Grouping = [],
        level: number = 0,
        isPrimalAggregation: boolean = false,
        args: Array<string> = null,
        over: Grouping = null,
        sorting: Sorting = null
    ) {
        var groupingId: string = over && !over.length ? null : GroupBy.getLastGroupingId(grouping, over);
        super(ExpressionType.AGGREGATE, rawExpression, queryQuotes, groupingId);
        this.aggregation = aggregation;
        this.level = level;
        this.isPrimalAggregation = isPrimalAggregation;
        this.arguments = utils.map(args, (arg) => new Expression(ExpressionType.ARGUMENT, arg, queryQuotes));
        this.grouping = over ? over : utils.copy(grouping);
        this.sorting = sorting;
        this.hasGroupByOver = over ? true : false;
        this.hasDistinct = false;
        this.innerExpressions = new Array<Aggregate>();

        this.parseDistinct(logger);
        this.fillDefault();

        AggregationParser.parse(this, logger, queryExpressions, queryQuotes, grouping, groupId);

        this.handleGroupIndex();
        this.normalize();
        this.validate();
        this.addGroupId(groupId);

        var sibling = this.findSibling(queryExpressions);
        if (sibling) {
            return sibling;
        }

        this.handleIndex();
        this.matchSorting();

        if (queryExpressions) {
            queryExpressions.push(this);
        }
    }

    public equals(aggregate: Aggregate): boolean {
        return super.equals(aggregate) && this.hasDistinct === aggregate.hasDistinct && this.aggregation === aggregate.aggregation &&
            (GroupBy.compareGrouping(this.grouping, aggregate.grouping) && OrderBy.compareSorting(this.sorting, aggregate.sorting));
    }

    public isPrimalNonOver(): boolean {
        return !this.hasGroupByOver && this.isPrimalAggregation;
    }

    public isPostProcessingType(): boolean {
        return this.aggregation === Aggregation.CONCAT || this.aggregation === Aggregation.AVG ||
            (this.sorting && this.aggregation === Aggregation.NTH);
    }

    public getValRef(): string {
        return (this.hasExtendedSorting() && (this.aggregation === Aggregation.FIRST || this.aggregation === Aggregation.LAST)) ? '.val' : '';
    }

    public defineInitialProperty(): string {
        return this.id + ': ' + this.defineInitVal();
    }

    public distinctProperty(): string {
        var distinctLength = (this.aggregation === Aggregation.NTH && !this.sorting && this.hasDistinct) ?
            (', ' + utils.addIdSuffix(this.id, 'DistinctLength') + ': 1') : '';
        return utils.addIdSuffix(this.id, 'Distinct') + ': {}' + distinctLength;
    }

    public defineAggregation(): string {
            var expObjDef: string = this.defineExpObjRef();

            if (this.countByAll()) {
                return expObjDef + '++;';
            }
            else if (this.sorting) {
                return this.defineAggregationWithSorting(expObjDef);
            }
            else if (this.aggregation === Aggregation.NTH) {
                var nthNo: string = this.getFirstArgument() || '1';
                if (this.hasDistinct) {
                    return utils.format(AggregationTemplates.DISTINCT_NTH,
                        this.code,
                        expObjDef,
                        nthNo,
                        this.defineValReference('Distinct'),
                        this.defineValReference('DistinctLength')
                        );
                }
                else {
                    return utils.format(AggregationTemplates.NTH,
                        this.code,
                        expObjDef,
                        this.hasGroupIndex ? this.parentGroupingId + '.groupIndex' : 'index',
                        nthNo
                        );
                }
            }
            else if (this.aggregation === Aggregation.CONCAT) {
                if (this.hasDistinct) {
                    return utils.format(AggregationTemplates.DISTINCT_CONCAT, this.code, expObjDef, '__val__', this.defineValReference('Distinct'));
                }
                else {
                    return utils.format(AggregationTemplates.CONCAT, this.code, expObjDef, '__val__');
                }
            }
            else if (this.aggregation === Aggregation.FIRST) {
                return utils.format(AggregationTemplates.FIRST,
                    this.code,
                    expObjDef,
                    this.hasGroupIndex ? this.parentGroupingId + '.groupIndex' : 'index'
                    );
            }
            else {
                if (this.hasDistinct) {
                    return AggregationTemplates.format('DISTINCT_' + this.aggregation, this.code, expObjDef, this.defineValReference('Distinct'));
                }
                else {
                    return AggregationTemplates.format(this.aggregation, this.code, expObjDef);
                }
            }
    }

    public definePostProcessing(): string {
        switch(this.aggregation) {
            case Aggregation.NTH: {
                if (this.sorting) {
                    return this.defineSorting();
                }
            } break;
            case Aggregation.AVG: {
                return utils.format(PostProcessingTemplates.AVG,
                    this.defineExpObjRef()
                );
            }
            case Aggregation.CONCAT: {
                var sorting: string = this.sorting ?
                    this.defineSorting() : '';
                var delimiter: string = this.getFirstArgument() || '", "';

                return utils.format(PostProcessingTemplates.CONCAT,
                    this.defineExpObjRef(),
                    delimiter,
                    sorting
                );
            }
        }

        return '';
    }

    public defineSortingComparator(): string {
        if (this.sorting) {
            return utils.format(
`
function {0}(x, y) {
    return {1};
}
`,
                    utils.addIdSuffix(this.id, 'Comparator'),
                    this.defineComparision(this.sorting)
                )
        }
        
    }

    public defineExpObjRef(): string {
        return this.getGroupingId() + '.' + this.id;
    }

    public handleGroupIndex(): void {
        super.handleGroupIndex();

        if (!this.hasGroupIndex && this.parentGroupingId && (
            this.aggregation == Aggregation.FIRST ||
            (this.sorting && this.aggregation === Aggregation.LAST) ||
            (this.aggregation === Aggregation.NTH && !this.sorting && !this.hasDistinct)
        )) {
            this.hasGroupIndex = true;
        }
    }

    public static canHaveSorting(aggrType: string): boolean {
        return aggrType === Aggregation.CONCAT || aggrType === Aggregation.FIRST || aggrType === Aggregation.LAST || aggrType === Aggregation.NTH;
    }

    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================

    private fillDefault(): void {
        if (
            this.aggregation === Aggregation.COUNT &&
            (!this.code || this.code === 'true' || this.code === '*')
        ) {
            this.code = BY_ALL;
        }
    }

    private parseDistinct(logger: Logger): void {
        if (Aggregation[this.aggregation]) {
            this.code = this.code.replace(ExpressionRegExps.DISTINCT, (...args) => {
                this.hasDistinct = true;
                return args[2]; // Following character after DISTINCT
            });
        }

        if (this.hasDistinct) {
            if (this.aggregation === Aggregation.COUNT && this.code === BY_ALL) {
                this.hasDistinct = false;
                logger.warning(utils.format('Distinct cannot be used along with COUNT by all values;\n', this.raw));
            }
            else if (!this.canHaveDistinct()) {
                this.hasDistinct = false;
                logger.log(utils.format('Unnecessary DISTINCT, distinct do NOT apply on {0} expression type;\n{1}', this.type, this.raw));
            }
        }
    }

    private canHaveDistinct(): boolean {
        return AggregationTemplates['DISTINCT_' + this.aggregation] ? true : false;
    }

    private findSibling(queryExpressions: Array<Expression>): Aggregate {
        var sibling: Aggregate = utils.find<Aggregate>(queryExpressions, (exp) => exp.equals(this));

        if (sibling) {
            if (this.level > sibling.level) {
                sibling.level = this.level;
            }
            sibling.addGroupId(this.groupIds[0]);
        }

        return sibling;
    }

    private handleIndex(): void {
        if (
            (
                !this.parentGroupingId &&
                (
                    this.aggregation === Aggregation.FIRST ||
                    (this.aggregation === Aggregation.NTH && !this.sorting && !this.hasDistinct) ||
                    (this.sorting && this.aggregation === Aggregation.LAST)
                )
            ) ||
            this.checkIndex()
        ) {
            this.hasIndex = true;
        };
    }

    private matchSorting(): void {
        utils.forEach<OrderBy>(this.sorting, (orderBy) => orderBy.compareToAggregation(this));
    }

    private hasExtendedSorting(): boolean {
        return utils.some<OrderBy>(this.sorting, (orderBy) => !orderBy.isOrderedByValue());
    }

    private countByAll(): boolean {
        return this.aggregation === Aggregation.COUNT && this.code === BY_ALL;
    }

    private defineInitVal(): string {
        switch (this.aggregation) {
            case Aggregation.COUNT:
                return '0';
            case Aggregation.AVG:
                return '{ val: 0, count: 0 }';
            case Aggregation.CONCAT:
                return '[]';
            case Aggregation.FIRST:
            case Aggregation.LAST: {
                if (this.sorting) {
                    if (this.hasExtendedSorting()) {
                        return '{}';
                    }
                    else {
                        return 'undefined';
                    }
                }
                else {
                    return 'null';
                }
            }
            case Aggregation.NTH: {
                if (this.sorting) {
                    return '[]';
                }
                else {
                    return 'null';
                }
            }
            case Aggregation.SUM:
            case Aggregation.MIN:
            case Aggregation.MAX:
            default:
                return 'null';
        }
    }

    private defineAggregationWithSorting(expObjDef: string): string {
        var orderFillPropsDef: string;

        if (this.hasExtendedSorting()) {
            var orderFillProps = utils.reduce(this.sorting, (props, orderBy: OrderBy) => {
                if (!orderBy.isOrderedByValue()) {
                    props.push(orderBy.id + ': ' + orderBy.code);
                }
                return props;
            }, []);
            orderFillProps.push('val: ' + (this.aggregation === Aggregation.CONCAT ? '__val__' : this.code));
            orderFillPropsDef = '{ ' + orderFillProps.join(', ') + ' }';
        }
        else {
            orderFillPropsDef = this.code;
        }

        if (this.aggregation === Aggregation.FIRST || this.aggregation === Aggregation.LAST) {
            return utils.format(
                AggregationTemplates[this.aggregation + '_ORDER_BY'],
                utils.addIdSuffix(this.id, 'Comparator'), // TODO:: create at constructor
                expObjDef,
                orderFillPropsDef,
                this.parentGroupingId ? this.parentGroupingId + '.groupIndex' : 'index'
            );
        }
        else if (this.aggregation === Aggregation.NTH) {
            if (this.hasDistinct) {
                return utils.format(
                    AggregationTemplates.DISTINCT_NTH_ORDER_BY,
                    expObjDef,
                    orderFillPropsDef,
                    this.defineValReference('Distinct')
                );
            }
            else {
                return utils.format(
                    AggregationTemplates.NTH_ORDER_BY,
                    expObjDef,
                    orderFillPropsDef
                );
            }
        }
        else if (this.aggregation === Aggregation.CONCAT) {
            if (this.hasDistinct) {
                return utils.format(AggregationTemplates.DISTINCT_CONCAT, this.code, expObjDef, orderFillPropsDef, this.defineValReference('Distinct'));
            }
            else {
                return utils.format(AggregationTemplates.CONCAT, this.code, expObjDef, orderFillPropsDef);
            }
        }
    }

    private defineSorting(): string {
        var expObjRef: string = this.defineExpObjRef();
        var comparatorId: string = utils.addIdSuffix(this.id, 'Comparator');
        var valRef: string;

        switch(this.aggregation) {
            case Aggregation.NTH: {
                if (this.hasExtendedSorting()) {
                    valRef = utils.format('{0} = {0} ? {0}.val : null;', expObjRef);
                }
                else {
                    valRef = ''
                }

                return utils.format(
`{0} = {0}.sort({1})[{3}];
{2}`,
                    expObjRef,
                    comparatorId,
                    valRef,
                    (parseInt(this.getFirstArgument() || '1') - 1).toString()
                );
            }
            case Aggregation.CONCAT: {
                valRef = this.hasExtendedSorting() ? '.val' : '';

                return utils.format(
`__val__ = {0}.sort({1});
__tempRes__ = [];
__length__ = __val__.length;
for (__i__ = 0; __i__ < __length__; __i__++) {
    __tempRes__.push(__val__[__i__]{2});
}
{0} = __tempRes__;
`,
                    expObjRef,
                    comparatorId,
                    valRef
                );
            }
            default: return '';
        }
    }

    private defineComparision(sorting: Sorting): string {
        var hasExtendedSorting: boolean = this.hasExtendedSorting();

        var comparisions = utils.reduce(sorting, (acc: string, orderBy: OrderBy) => {
            var compareVal: string;

            if (hasExtendedSorting) {
                compareVal = '.' + (orderBy.isOrderedByValue() ? 'val' : orderBy.id);
            }
            else {
                compareVal = '';
            }

            var isASC: boolean = orderBy.isAscending();

            return utils.format(
                acc,
                QueryFormatter.formatComparision(
                    '{0}',
                    (isASC ? 'x' : 'y') + compareVal,
                    (isASC ? 'y' : 'x') + compareVal
                )
            );
        }, '{0}');

        return utils.format(comparisions, '0');
    }

    private getFirstArgument(): string {
        return this.arguments[0] ? this.arguments[0].code : '';
    }
}

export abstract class AggregationParser {
    public static parse(expression: Aggregate, logger: Logger, queryExpressions: Array<Expression>, queryQuotes: Quotes, grouping: Grouping, groupId: string, isWithinUngroup: boolean = false) {
        var match: RegExpMatchArray = expression.code.match(ExpressionRegExps.AGGREGATION);

        while(match) {
            var aggrArgs: DirectiveArguments = this.parseArguments(match);
            var optionalArgs: Array<string> = aggrArgs.slice(1, aggrArgs.length);
            var aggrType: string = match[2].toUpperCase();
            var lastProcessedIndex: number;
            var isPrimal: boolean = expression.type === ExpressionType.FIELD;

            if (!aggrArgs.endIndex) {
                logger.error(utils.format('Missing closing bracket for {0} aggregation:\n{1}', aggrType, match.input));
            }
            else {
                lastProcessedIndex = aggrArgs.endIndex;
            }

            var groupingOver: Grouping;
            var expressionsOver: Array<Expression>;
            var nonMatchedGrouping: Grouping;
            var requiresGroupingCompatibility: boolean = isPrimal && !isWithinUngroup && grouping.length ? true : false;
            var overArgs: DirectiveArguments = this.parseAggregationDirective(
                expression,
                logger,
                match,
                aggrType,
                lastProcessedIndex,
                ExpressionType.GROUP_BY
            );

            if (overArgs) {
                lastProcessedIndex = overArgs.endIndex;

                if (requiresGroupingCompatibility) {
                    nonMatchedGrouping = [];

                    expressionsOver = overArgs.reduce((expressions, arg: string) => {
                        var groupByExpr: Expression = new Expression(
                            ExpressionType.GROUP_BY,
                            arg,
                            queryQuotes,
                            GroupBy.getLastGroupingId(<Grouping>expressions)
                            );
                        groupByExpr.normalize();
    
                        if (!GroupBy.isOverall(groupByExpr)) {
                            if (requiresGroupingCompatibility && !utils.some<GroupBy>(grouping, (groupBy) => groupBy.equals(groupByExpr))) {
                                throw 'Primal aggregation cannot have grouping that exceeds over outer scope non empty grouping!\n' + (expression.code.substring(aggrStartIndex, lastProcessedIndex + 1));
                            }
                            expressions.push(groupByExpr);
                        }
                        return expressions;
                    }, []);
    
                    groupingOver = AggregationParser.matchGroupings(queryExpressions, queryQuotes, grouping, expressionsOver, nonMatchedGrouping);
                }
                else {
                    groupingOver = overArgs.reduce((groupingAcc: Grouping, arg: string) => {
                        var groupExpr: GroupBy = new GroupBy(
                            arg,
                            queryQuotes,
                            queryExpressions,
                            GroupBy.getLastGroupingId(groupingAcc)
                            );
    
                        if (!groupExpr.isOverallGrouping()) {
                            groupingAcc.push(groupExpr);
                        }
                        return groupingAcc;
                    }, []);
                }

                if (overArgs.length > 1 && overArgs.length > groupingOver.length) {
                    logger.log(MessageCodes.UNNECESSARY_OVERALL_GROUP_BY, expression.code.substring(aggrStartIndex, lastProcessedIndex + 1));
                }
            }

            var sorting: Sorting;
            var orderByArgs: DirectiveArguments = this.parseAggregationDirective(
                expression,
                logger,
                match,
                aggrType,
                lastProcessedIndex,
                ExpressionType.ORDER_BY
            );

            if (orderByArgs) {
                lastProcessedIndex = orderByArgs.endIndex;

                sorting = orderByArgs.reduce((sortingAcc, arg: string) => {
                    var orderExpr: OrderBy = new OrderBy(arg, queryQuotes, queryExpressions, GroupBy.getLastGroupingId(grouping));
                    if (orderExpr.normalized === '' && orderByArgs.length > 1) {
                        logger.error(utils.format('Argument expression is empty for {0} clause after {1} aggregation:\n{2}', ExpressionType.ORDER_BY, aggrType, match.input));
                    }
                    else {
                        sortingAcc.push(orderExpr);
                    }
                    return sortingAcc;
                }, []);
            }

            var innerExpr: Aggregate = new Aggregate(
                logger,
                aggrArgs[0],
                Aggregation[aggrType],
                queryQuotes,
                queryExpressions,
                groupId,
                grouping,
                expression.level + 1,
                isPrimal,
                optionalArgs,
                groupingOver,
                sorting
            );

            expression.innerExpressions.push(innerExpr);

            var aggrStartIndex: number = match.index + match[1].length;
            var groupingRefDefinition = requiresGroupingCompatibility && nonMatchedGrouping && nonMatchedGrouping.length ?
                GroupBy.defineGroupingReference(nonMatchedGrouping, grouping) + '.' + innerExpr.id :
                (<Aggregate>innerExpr).defineExpObjRef();

            expression.code = expression.code.replace(
                expression.code.substring(aggrStartIndex, lastProcessedIndex + 1),
                groupingRefDefinition + innerExpr.getValRef()
            );

            match = expression.code.match(ExpressionRegExps.AGGREGATION);
        }
    }

    private static parseAggregationDirective(
        expression: Aggregate,
        logger: Logger,
        aggrMatch: RegExpMatchArray,
        aggrType: string,
        startIndex: number,
        directiveType: ExpressionType
    ): DirectiveArguments {

        var codeToAnalyse = expression.code.substring(startIndex, expression.code.length);
        var directiveMatch = codeToAnalyse.match(ExpressionRegExps[directiveType]);
        var parsedArgs: DirectiveArguments;
        
        if (directiveMatch) {
            parsedArgs = this.parseArguments(directiveMatch);
            if (!parsedArgs.endIndex) {
                logger.error(utils.format('No closing bracket for {0} clause after {1} aggregation:\n{2}', directiveType, aggrType, aggrMatch.input));
            }
            parsedArgs.endIndex += startIndex;

            if (directiveType === ExpressionType.ORDER_BY && !Aggregate.canHaveSorting(aggrType)) {
                logger.warning(utils.format('{0} directive will not be taken into account for {1} aggregation please consider removing such directive or changing aggregation type:\n{2}', directiveType, aggrType, aggrMatch.input));
                return parsedArgs;
            }
        }

        return parsedArgs;
    }

    private static parseArguments(match: RegExpMatchArray): DirectiveArguments {
        var i,
            openingBrackets = 1,
            commaIndex = 0,
            code = match.input,
            codeLenght = code.length,
            matchLength = match[0].length,
            openBracketIndex = match.index + matchLength,
            aggregationArgs = new DirectiveArguments();

        for (i = openBracketIndex; i < codeLenght; i++) {
            switch(code[i]) {
                case '[': // Semicolon can be used in Array constructor.
                case '(': openingBrackets++; break;
                case ']': openingBrackets--; break;
                case ')': {
                    if (openingBrackets === 1) {
                        aggregationArgs.push(code.substring(commaIndex || openBracketIndex, i));
                        aggregationArgs.endIndex = i;
                        return aggregationArgs;
                    }
                    else {
                        openingBrackets--;
                    }
                } break;
                case ',': {
                    if (openingBrackets === 1) {
                        aggregationArgs.push(code.substring(commaIndex || openBracketIndex, i));
                        commaIndex = i + 1;
                    }
                } break;
            }
        }
        return aggregationArgs;
    }

    private static matchGroupings(queryExpressions: Array<Expression>, queryQuotes: Quotes, grouping: Grouping, overExpressions: Array<Expression>, nonMatchedGrouping: Grouping): Grouping {
        var overGrouping = [];
        var parentGroupingId = null;
        var chainMatches = true;

        utils.forEach<Expression>(overExpressions, (overExp, index) => {
            var groupBy: GroupBy = grouping[index];

            if (!chainMatches || !groupBy || !groupBy.equals(overExp)) {
                chainMatches = false;
                var groupBy = new GroupBy(
                    overExp.raw,
                    queryQuotes,
                    queryExpressions,
                    parentGroupingId
                );
                nonMatchedGrouping.push(groupBy);
            }

            parentGroupingId = groupBy.id;
            overGrouping.push(groupBy);
        });

        return overGrouping;
    }
}

export enum Aggregation {
    COUNT = 'COUNT',
    SUM = 'SUM',
    AVG = 'AVG',
    MIN = 'MIN',
    MAX = 'MAX',
    CONCAT = 'CONCAT',
    FIRST = 'FIRST',
    LAST = 'LAST',
    NTH = 'NTH'
}

class DirectiveArguments extends Array<string> {
    public endIndex: number;

    constructor() {
        super();
        this.endIndex = 0;
    }
}

abstract class AggregationTemplates {
    public static format(aggrType: string, expCode: string, expObjDef: string, distinctRef: string = ''): string {
        return utils.format(
            AggregationTemplates[aggrType],
            expCode,
            expObjDef,
            distinctRef
        );
    }

    public static SUM =
`    __val__ = {0};
    if (__val__)
        {1} = ({1} || 0) + __val__;`;
    public static DISTINCT_SUM =
`    __val__ = {0};
    if (__val__ && {2}[__val__] !== true) {
        {1} = ({1} || 0) + __val__;
        {2}[__val__] = true;
    }`;
    public static MIN =
`    __val__ = {0};
    if (__val__ != null && ({1} > __val__ || {1} == null))
        {1} = __val__;`;
    public static MAX =
`    __val__ = {0};
    if (__val__ != null && ({1} < __val__ || {1} == null))
        {1} = __val__;`;
    public static FIRST =
`    if ({2} === 1)
        {1} = {0};`
    public static FIRST_ORDER_BY =
`    __val__ = {2};
    if ({3} === 1 || {0}({1}, __val__) > 0)
        {1} = __val__;`
    public static LAST =
`    {1} = {0};`;
    public static LAST_ORDER_BY =
`    __val__ = {2};
    if ({3} === 1 || {0}(__val__, {1}) > 0)
        {1} = __val__;`;
    public static NTH =
`    if ({2} == {3})
        {1} = {0}`;
    public static DISTINCT_NTH =
`    __val__ = {0};
    if ({3}[__val__] !== true) {
        if ({4} == {2})
            {1} = __val__;
        else {
            {3}[__val__] = true;
            {4}++;
        }
    }`;
    public static NTH_ORDER_BY =
`    {0}.push({1});`;
    public static DISTINCT_NTH_ORDER_BY =
`    __val__ = {1};
    if ({2}[__val__] !== true) {
        {0}.push(__val__);
        {2}[__val__] = true;
    }`;
    public static COUNT =
`    if (({0}) != null)
        {1}++;`;
    public static DISTINCT_COUNT =
`    __val__ = {0};
    if (__val__ != null && {2}[__val__] !== true) {
        {1}++;
        {2}[__val__] = true;
    }`;
    public static AVG =
`    __val__ = {0}
    if (__val__ != null)
        { {1}.count++; {1}.val += __val__; };`;
    public static DISTINCT_AVG =
`    __val__ = {0}
    if (__val__ != null && {2}[__val__] !== true) {
        {1}.count++;
        {1}.val += __val__;
        {2}[__val__] = true;
    };`;
    public static CONCAT =
`    __val__ = {0};
    if (__val__ != null)
        {1}.push({2});`;
    public static DISTINCT_CONCAT =
`    __val__ = {0};
    if (__val__ != null && {3}[__val__] !== true) {
        {1}.push({2});
        {3}[__val__] = true;
    }`;
}

enum PostProcessingTemplates {
    AVG = '{0} = {0}.val / ({0}.count || 1);',
    CONCAT = '{2}{0} = {0}.join({1});'
}

const BY_ALL = 'ALL';
