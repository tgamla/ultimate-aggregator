import * as utils from "../common/utils";
import { Logger } from '../common/logger';
import { Expression, Quotes, ExpressionRegExps } from './expression';
import { GroupBy, Grouping } from './groupBy';
import { Sorting, OrderBy } from './orderBy';
import { AggregationParser } from '../helpers/aggregateParser';
import { AggregationType } from '../constants/aggregationType';
import { ExpressionType } from '../constants/expressionType';
import { AggregateFromatter, AggregateTemplates } from '../formatters/aggregateFormatter';
import { SortingFromatter } from '../formatters/sortingFormatter';


export class Aggregate extends Expression {

    public level: number;
    public aggregation: AggregationType;
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
        aggregation: AggregationType,
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
        return this.aggregation === AggregationType.CONCAT || this.aggregation === AggregationType.AVG ||
            (this.sorting && this.aggregation === AggregationType.NTH);
    }

    public getValRef(): string {
        return (this.hasExtendedSorting() && (this.aggregation === AggregationType.FIRST || this.aggregation === AggregationType.LAST)) ? '.val' : '';
    }

    public defineInitialProperty(): string {
        return this.id + ': ' + this.defineInitVal();
    }

    public distinctProperty(): string {
        var distinctLength = (this.aggregation === AggregationType.NTH && !this.sorting && this.hasDistinct) ?
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
            else if (this.aggregation === AggregationType.NTH) {
                var nthNo: string = this.getFirstArgument() || '1';
                if (this.hasDistinct) {
                    return utils.format(AggregateTemplates.DISTINCT_NTH,
                        this.code,
                        expObjDef,
                        nthNo,
                        this.defineValReference('Distinct'),
                        this.defineValReference('DistinctLength')
                    );
                }
                else {
                    return utils.format(AggregateTemplates.NTH,
                        this.code,
                        expObjDef,
                        this.hasGroupIndex ? this.parentGroupingId + '.groupIndex' : 'index',
                        nthNo
                    );
                }
            }
            else if (this.aggregation === AggregationType.CONCAT) {
                if (this.hasDistinct) {
                    return utils.format(AggregateTemplates.DISTINCT_CONCAT, this.code, expObjDef, '__val__', this.defineValReference('Distinct'));
                }
                else {
                    return utils.format(AggregateTemplates.CONCAT, this.code, expObjDef, '__val__');
                }
            }
            else if (this.aggregation === AggregationType.FIRST) {
                return utils.format(AggregateTemplates.FIRST,
                    this.code,
                    expObjDef,
                    this.hasGroupIndex ? this.parentGroupingId + '.groupIndex' : 'index'
                    );
            }
            else {
                if (this.hasDistinct) {
                    return AggregateFromatter.getAggrDefinition('DISTINCT_' + this.aggregation, this.code, expObjDef, this.defineValReference('Distinct'));
                }
                else {
                    return AggregateFromatter.getAggrDefinition(this.aggregation, this.code, expObjDef);
                }
            }
    }

    public definePostProcessing(): string {
        switch(this.aggregation) {
            case AggregationType.NTH: {
                if (this.sorting) {
                    return this.defineSorting();
                }
            } break;
            case AggregationType.AVG: {
                return AggregateFromatter.getPostProcessingAvgDefinition(
                    this.defineExpObjRef()
                );
            }
            case AggregationType.CONCAT: {
                var sorting: string = this.sorting ?
                    this.defineSorting() : '';
                var delimiter: string = this.getFirstArgument() || '", "';

                return AggregateFromatter.getPostProcessingConcatDefinition(
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
            return SortingFromatter.getSortingFnDefinition(
                utils.addIdSuffix(this.id, 'Comparator'),
                this.sorting,
                this.hasExtendedSorting()
            );
        }
        
    }

    public defineExpObjRef(): string {
        return this.getGroupingId() + '.' + this.id;
    }

    public handleGroupIndex(): void {
        super.handleGroupIndex();

        if (!this.hasGroupIndex && this.parentGroupingId && (
            this.aggregation == AggregationType.FIRST ||
            (this.sorting && this.aggregation === AggregationType.LAST) ||
            (this.aggregation === AggregationType.NTH && !this.sorting && !this.hasDistinct)
        )) {
            this.hasGroupIndex = true;
        }
    }

    public static canHaveSorting(aggrType: string): boolean {
        return aggrType === AggregationType.CONCAT || aggrType === AggregationType.FIRST || aggrType === AggregationType.LAST || aggrType === AggregationType.NTH;
    }

    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================

    private fillDefault(): void {
        if (
            this.aggregation === AggregationType.COUNT &&
            (!this.code || this.code === 'true' || this.code === '*')
        ) {
            this.code = BY_ALL;
        }
    }

    private parseDistinct(logger: Logger): void {
        if (AggregationType[this.aggregation]) {
            this.code = this.code.replace(ExpressionRegExps.DISTINCT, (...args) => {
                this.hasDistinct = true;
                return args[2]; // Following character after DISTINCT
            });
        }

        if (this.hasDistinct) {
            if (this.aggregation === AggregationType.COUNT && this.code === BY_ALL) {
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
        return AggregateTemplates['DISTINCT_' + this.aggregation] ? true : false;
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
                    this.aggregation === AggregationType.FIRST ||
                    (this.aggregation === AggregationType.NTH && !this.sorting && !this.hasDistinct) ||
                    (this.sorting && this.aggregation === AggregationType.LAST)
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
        return this.aggregation === AggregationType.COUNT && this.code === BY_ALL;
    }

    private defineInitVal(): string {
        switch (this.aggregation) {
            case AggregationType.COUNT:
                return '0';
            case AggregationType.AVG:
                return '{ val: 0, count: 0 }';
            case AggregationType.CONCAT:
                return '[]';
            case AggregationType.FIRST:
            case AggregationType.LAST: {
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
            case AggregationType.NTH: {
                if (this.sorting) {
                    return '[]';
                }
                else {
                    return 'null';
                }
            }
            case AggregationType.SUM:
            case AggregationType.MIN:
            case AggregationType.MAX:
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
            orderFillProps.push('val: ' + (this.aggregation === AggregationType.CONCAT ? '__val__' : this.code));
            orderFillPropsDef = '{ ' + orderFillProps.join(', ') + ' }';
        }
        else {
            orderFillPropsDef = this.code;
        }

        if (this.aggregation === AggregationType.FIRST || this.aggregation === AggregationType.LAST) {
            return utils.format(
                AggregateTemplates[this.aggregation + '_ORDER_BY'],
                utils.addIdSuffix(this.id, 'Comparator'), // TODO:: create at constructor
                expObjDef,
                orderFillPropsDef,
                this.parentGroupingId ? this.parentGroupingId + '.groupIndex' : 'index'
            );
        }
        else if (this.aggregation === AggregationType.NTH) {
            if (this.hasDistinct) {
                return utils.format(
                    AggregateTemplates.DISTINCT_NTH_ORDER_BY,
                    expObjDef,
                    orderFillPropsDef,
                    this.defineValReference('Distinct')
                );
            }
            else {
                return utils.format(
                    AggregateTemplates.NTH_ORDER_BY,
                    expObjDef,
                    orderFillPropsDef
                );
            }
        }
        else if (this.aggregation === AggregationType.CONCAT) {
            if (this.hasDistinct) {
                return utils.format(AggregateTemplates.DISTINCT_CONCAT, this.code, expObjDef, orderFillPropsDef, this.defineValReference('Distinct'));
            }
            else {
                return utils.format(AggregateTemplates.CONCAT, this.code, expObjDef, orderFillPropsDef);
            }
        }
    }

    private defineSorting(): string {
        var expObjRef: string = this.defineExpObjRef();
        var comparatorId: string = utils.addIdSuffix(this.id, 'Comparator');
        var valRef: string;

        switch(this.aggregation) {
            case AggregationType.NTH: {
                if (this.hasExtendedSorting()) {
                    valRef = SortingFromatter.getSortedValRefDefinition(expObjRef);
                }
                else {
                    valRef = '';
                }

                return SortingFromatter.getNthSortingOutputDefinition(
                    expObjRef,
                    comparatorId,
                    valRef,
                    (parseInt(this.getFirstArgument() || '1') - 1).toString()
                );
            }
            case AggregationType.CONCAT: {
                valRef = this.hasExtendedSorting() ? '.val' : '';

                return SortingFromatter.getComplexSortingOutputDefinition(
                    expObjRef,
                    comparatorId,
                    valRef
                );
            }
            default: return '';
        }
    }

    private getFirstArgument(): string {
        return this.arguments[0] ? this.arguments[0].code : '';
    }
}

const BY_ALL = 'ALL';
