import { BaseGroup } from './basePrototypes/baseGroup';
import { BaseQuery } from './basePrototypes/baseQuery';
import { Logger, MessageCodes } from './common/logger';
import * as utils from './common/utils';
import { ExpressionType } from './constants/expressionType';
import { Aggregate } from './expressions/aggregate';
import { Expression, IQuotes } from './expressions/expression';
import { Field } from './expressions/field';
import { GroupBy, Grouping } from './expressions/groupBy';
import { OrderBy, Sorting } from './expressions/orderBy';
import { QueryFormatter } from './formatters/queryFomatter';
import { Group } from './group';
import { GroupComposition, IGroupMap } from './helpers/groupComposition';
import { GroupingComposition } from './helpers/groupingComposition';
import { PreProcess } from './helpers/preProcess';
import { Selector } from './helpers/selector';
import { IConfig } from './interfaces/iConfig';
import { IQuery } from './interfaces/iQuery';
import { Ungroup } from './ungroup';

export class Query<T> extends BaseQuery<Query<T>> implements IQuery<T> {
    _preFilter: string;
    private preFiltering: PreProcess;

    private dataSource: any;
    private changed: boolean;

    private context: { __logger__?: Logger; __quotes__?: IQuotes; string?: string };
    private logger: Logger;
    private debugLevel: number;

    private groupMap: IGroupMap;
    private groupComposition: GroupComposition;
    private groupingComposition: GroupingComposition;
    private allExpressions: Expression[];
    private quotes: IQuotes;
    private fn: Function;
    private code: string;

    constructor(config: IConfig = {}) {
        super('Query');
        this._preFilter = null;
        this.dataSource = [];
        this.allExpressions = null;
        this.quotes = null;
        this.fn = null;
        this.changed = true;
        this.context = {};
        this.config(config);

        return this.encapsulate();
    }

    config(config: IConfig): Query<T> {
        if (config == null || typeof config !== 'object') {
            this.logger.warning(MessageCodes.EMPTY_CONFIG);
            return this;
        }
        this.logger = new Logger(this.id, config);
        this.debugLevel = config.debugLevel || 0;

        return this.applyChange();
    }

    addContext(reference: object|Function|string, value?: any): Query<T> {
        let hasChangedContext: boolean = false;

        if (reference instanceof Function) {
            if (this.addFunction(reference)) {
                hasChangedContext = true;
            }
        }
        else if (reference instanceof Array) {
            this.logger.warning(MessageCodes.ARRAY_IN_CONTEXT, reference);
        }
        else if (typeof reference === 'string') {
            this.context[reference] = value;
            hasChangedContext = true;
        }
        else if (typeof reference === 'object' && utils.keysLength(reference) > 0) {
            utils.forEach(reference, (val, prop) => {
                hasChangedContext = true;
                this.context[prop] = val;
            });
        }
        else if (reference == null) {
            this.logger.warning(MessageCodes.EMPTY_REFERENCE_VALUE_IN_CONTEXT, reference);
        }
        else {
            this.logger.warning(MessageCodes.INCORRECT_REFERENCE_IN_CONTEXT, reference);
        }

        if (hasChangedContext) {
            return this.applyChange();
        }
        else {
            if (!this.changed) {
                this.bindFn();
            }

            return this;
        }
    }

    removeContext(reference: string | object): Query<T> {
        if (reference === undefined) {
            this.context = {};
            if (!this.changed) {
                this.bindFn();
            }

            return this;
        }

        const refType = typeof reference;
        let hasChanged = false;

        if (refType === 'string') {
            if (this.context.hasOwnProperty(<string>reference)) {
                hasChanged = true;
                delete this.context[<string>reference];
            }
            else {
                // TODO:: log
            }
        }
        else if (refType === 'object' && reference != null) {
            utils.forEach(reference, (prop) => {
                // TODO
            });
            // TODO:: log
        }
        else {
            // TODO:: log
        }

        return this.applyChange(hasChanged);
    }

    preFilter(filter?: /* TODO:: Function | */ string): Query<T> {
        if (typeof filter === 'string') {
            if (this._preFilter !== filter) {
                this._preFilter = filter;
                this.preFiltering = new PreProcess(this._preFilter);
                return this.applyChange();
            }
        }
        else if (filter == null) {
            this._preFilter = null;
            this.preFiltering = null;
        }
        else {
            // TODO:: warning unacceptable filter type
        }
        return this;
    }

    preOrderBy(): Query<T> {
        // TODO::
        return this.applyChange();
    }

    define(): Query<T> {
        // TODO::
        return this.applyChange();
    }

    select(...args: any[]): Query<T> {
        this.applySelect(args[0]);
        return this.applyChange();
    }

    from(dataSource?: any): Query<T> {
        let hasTypeChanged: boolean;

        if (dataSource == null) {
            hasTypeChanged = !(this.dataSource instanceof Array);
            this.dataSource = [];
        }
        else if (typeof dataSource === 'object') {
            hasTypeChanged = this.compareDataSourceType(dataSource);
            this.dataSource = dataSource;
        }
        else {
            this.logger.warning(MessageCodes.UNSUPPORTED_DATA_TYPE);
            hasTypeChanged = !(this.dataSource instanceof Array);
            this.dataSource = [];
        }

        return this.applyChange(hasTypeChanged);
    }

    distinct(apply?: boolean): Query<T> {
        return this.applyChange(this.applyDistinct(apply));
    }

    groupBy(rawGrouping?: string | string[]): Query<T> {
        if (this.applyList(rawGrouping, '_groupBy')) {
            return this.applyChange();
        }
        else {
            return this;
        }
    }

    totals(): Query<T> {
        // TODO::
        return this.applyChange();
    }

    filter(rawFilter?: string): Query<T> {
        return this.applyChange(this.applyFilter(rawFilter));
    }

    orderBy(rawSorting?: string | string[]): Query<T> {
        return this.applyChange(this.applyList(rawSorting, '_orderBy'));
    }

    range(start: number, end?: number): Query<T> {
        // TODO::
        return this.applyChange();
    }

    clone(): Query<T> {
        const copy: Query<T> = new Query();
        // TODO::
        return copy;
    }

    toList(): T {
        // TODO:: if type changes
        return this.execute();
    }

    toObject(): T {
        // TODO::
        return <T>{};
    }

    toValue(): any {
        // TODO::
        return null;
    }

    execute(dataSource?: any): T {
        let workingData: any;

        if (dataSource instanceof Query) {
            workingData = dataSource.execute();
        }
        else if (this.dataSource instanceof Query) {
            workingData = this.dataSource.execute(dataSource);
        }
        else {
            workingData = dataSource === undefined ?
                this.dataSource : dataSource;
        }

        if (typeof workingData === 'object' && workingData.then instanceof Function) {
            return workingData.then((result) => {
                this.execute(result);
            });
        }

        if (this._preFilter) {
            workingData = this.execPreFiltering(workingData);
        }

        return this.calculate(workingData);
    }

    toString(): string {
        // TODO::
        return JSON.stringify(this);
    }

    static fromDefinition<T>(definition: string | Object): Query<T> {
        let defObj: BaseQuery<Query<T>>;

        if (definition instanceof Object) {
            defObj = <BaseQuery<Query<T>>>definition;
        }
        else if (typeof definition === 'string') {
            defObj = JSON.parse(definition);

            if (!(defObj instanceof Object)) {
                // TODO::
                throw new Error();
            }
        }
        else {
            // TODO::
            throw new Error();
        }

        const query: Query<T> = new Query<T>();

        if (defObj._select) {
            query.select(defObj._select);
        }

        if (defObj._groupBy) {
            query.groupBy(defObj._groupBy);
        }

        // TODO::

        return query;
    }

    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================

    protected encapsulate(): Query<T> {
        Object.defineProperties(
            this,
            QUERY_PRIVATE_PROPERTIES
        );
        // Object.seal(this); // TODO:: not working?
        return this;
    }

    private applyChange(applied: boolean = true): Query<T> {
        if (applied) {
            this.changed = true;
        }
        return this;
    }

    private execPreFiltering(data: any): any[] | Object {
        const preFilterObj = this.preFiltering;
        try {
            if (preFilterObj.isNew) {
                preFilterObj.createFunction(this.logger);
            }

            return preFilterObj.function(data);
        }
        catch(exc) {
            this.logger.error(exc);
        }
    }

    private calculate(data: any): T {
        try {
            if (this.changed) {
                // TODO:: error if no select has been defined!
                this.init();
                const mainGrouping: Grouping = this.parseGrouping(this._groupBy, null);
                this.groupComposition = this.createGroupComposition(this, mainGrouping);
                this.groupMap = this.getGroupMap(this.groupComposition, {});
                this.groupingComposition = GroupingComposition.getComposition(this.allExpressions);
                this.createFn();

                // use for both single regexp:
                // TODO:: replace double new lines with single
                // TODO:: bring back Quotes!
            }
            // TODO:: if no dataset then trow warning
            return this.fn(data);
        } catch (exc) {
            this.logger.error(exc);
        }

        return <any>[];
    }

    private init(): void {
        this.allExpressions = [];
        this.quotes = {};
        this.context.__quotes__ = this.quotes;
        if (this.debugLevel > 0) {
            this.context.__logger__ = this.logger;
        }
        else if (this.context.hasOwnProperty('__logger__')) {
            delete this.context.__logger__;
        }
    }

    private createFn() {
        const hasQueryGrouping: boolean = this.hasQueryGrouping();
        const aggregationIterators: string = this.defineAggregationIterators();
        const groupedResultSet: string = this.defineGroupedResultSet(this.groupingComposition, 1, true);
        let resultSet: string;

        if (!hasQueryGrouping) {
            if (this.hasAnySubGroup() || this.hasAnyPrimalAggregationNonOver()) {
                resultSet = this.defineResultSet();
            }
            else {
                resultSet = this.definePlainResultSet();
            }
        }

        this.code = QueryFormatter.defineFunction(
            this.defineAllDeclaration(),
            aggregationIterators,
            this.defineNonGroupedPostProcessing(),
            groupedResultSet,
            resultSet,
            this.defineComparators(),
            this.groupComposition.defineSorting(),
            this.debugLevel,
            this.hasAnyGroupDistinct()
        );

        if (this.debugLevel > 1) {
            this.logger.debugObject('Query', this);
            this.logExpressions();
            this.logger.debug(this.code);
        }

        this.bindFn();
    }

    private bindFn(): void {
        const params: string[] = Object.keys(this.context);
        params.push('data', this.code);

        const args: any[] = [];
        utils.forEach(this.context, (arg) => args.push(arg));

        const fn = Function.apply(null, params);
        this.fn = Function.prototype.bind.apply(fn, [fn].concat(args));
    }

    private hasQueryGrouping(): boolean {
        return this.groupComposition.grouping.length > 0;
    }

    private hasAnyPrimalAggregationNonOver(): boolean {
        return utils.some<Expression>(this.allExpressions, (exp) => exp instanceof Aggregate && exp.isPrimalNonOver());
    }

    private hasAnySubGroup(): boolean {
        return !!(utils.keysLength(this.groupComposition.innerGroups));
    }

    private hasAnyGroupDistinct(groupComposition: GroupComposition = this.groupComposition): boolean {
        if (groupComposition.distinct) {
            return true;
        }
        return utils.some<GroupComposition>(groupComposition.innerGroups, (groupComp) => this.hasAnyGroupDistinct(groupComp));
    }

    private defineAllDeclaration(): string {
        return QueryFormatter.defineAllDeclarations(
            this.defineMainGroupingDeclaration(),
            this.defineAllVariableDeclarations()
        );
    }

    private defineMainGroupingDeclaration(): string {
        return GroupingComposition.defineGrouping(this.groupingComposition, this.groupMap['']);
    }

    private defineAllVariableDeclarations(): string {
        const groupings: Grouping = <Grouping>this.allExpressions.filter((exp) => exp.isGroupingExpression());

        let declarations = groupings.reduce((acc, exp) => {
            acc.push(exp.id);
            acc.push(exp.valueId);
            return acc;
        }, []);

        declarations = declarations.concat(
            this.groupingComposition.getGroupingVariableDeclarations()
        );

        declarations = declarations.concat(
            this.groupComposition.getGroupVariableDeclarations()
        );

        return declarations.join(', ') + (declarations.length ? ',' : '');
    }

    private defineAggregationIterators(): string {
        const expsByLevel: Aggregate[][] = this.getExpAggregationsByLevels().reverse();
        const maxLevel: number = expsByLevel.length || 1;
        const iterators: string[] = [];

        for (let level = 0; level < maxLevel; level++) {
            const isLastIteration: boolean = (level + 1) === maxLevel;
            const currentLevelAggregations: Aggregate[] = expsByLevel[level];
            const groupingCompByLvl: GroupingComposition = isLastIteration ?
                this.groupingComposition :
                GroupingComposition.getComposition(currentLevelAggregations);
            const isUsingIndex: boolean = Expression.isAnyUsingIndex(currentLevelAggregations);
            const ungroupsDef: string = isLastIteration ? this.defineUngroups() : '';
            const groupingsDef: string = groupingCompByLvl.defineGroupings(this.groupMap, this.groupingComposition, isLastIteration);
            const aggregationDef: string = Query.defineExpAggregations(currentLevelAggregations);

            if (groupingsDef || ungroupsDef || aggregationDef) {
                const postProcessing: string = isLastIteration ?
                    '' :
                    this.defineGroupsPostProcessing(maxLevel - level);

                iterators.push(
                    QueryFormatter.defineAggregationIterator(
                        groupingsDef,
                        ungroupsDef,
                        aggregationDef,
                        postProcessing,
                        isUsingIndex
                    ),
                );
            }
        }

        return iterators.join('\n\n');
    }

    private getExpAggregationsByLevels(): Aggregate[][] {
        return utils.reduce<Expression, Aggregate[][]>(this.allExpressions, (acc, exp) => {
            if (exp instanceof Aggregate) {
                let currLevelExps = acc[exp.level - 1];
                if (!currLevelExps) {
                    currLevelExps = acc[exp.level - 1] = [];
                }
                currLevelExps.push(exp);
            }
            return acc;
        }, []);
    }

    private defineUngroups(): string {
        return utils.map(
            this.getUngroups(this.groupComposition),
            (groupComp: GroupComposition) => this.defineResultSet(groupComp)
        ).join('\n');
    }

    private getUngroups(groupComposition: GroupComposition): GroupComposition[] {
        return utils.reduce<GroupComposition, GroupComposition[]>(groupComposition.innerGroups, (acc, innerGroupComp) => {
            acc = acc.concat(
                this.getUngroups(innerGroupComp)
            );
            if (innerGroupComp.isUngroup) {
                acc.push(innerGroupComp);
            }
            return acc;
        }, []);
    }

    private defineGroupsPostProcessing(postProcessingLvl: number): string {
        const expForPostProcessing: Aggregate[] = <Aggregate[]>this.allExpressions.filter(
                (exp) => exp.level === postProcessingLvl && exp instanceof Aggregate && exp.isPostProcessingType()
            );
        if (expForPostProcessing.length) {
            const currentLvlGroupingComp = GroupingComposition.getComposition(expForPostProcessing);
            return this.defineGroupedResultSet(currentLvlGroupingComp, postProcessingLvl, false);
        }
        else {
            return '';
        }
    }

    private createGroupComposition(group: BaseQuery<Query<T> | Group | Ungroup>, grouping: Grouping = [], parentGrouping: Grouping = null): GroupComposition {
        const groupId: string = group.id;
        const select: any = group._select;
        const isMain: boolean = parentGrouping === null;
        const isUngroup: boolean = (group instanceof Ungroup);
        const hasParentGrouping: boolean = !!(parentGrouping && parentGrouping.length);
        const sorting: Sorting = this.parseSorting(group._orderBy);
        const filter: Expression = this.parseFilter(group._filter);
        const groupComposition: GroupComposition = new GroupComposition(groupId, group._distinct, filter, grouping, sorting, isMain, isUngroup, hasParentGrouping);
        groupComposition.selection = this.parseSelection(select, groupComposition);
        groupComposition.expressions = this.allExpressions.filter((exp: Expression) => exp.groupIds.indexOf(group.id) > -1);
        return groupComposition;
    }

    private parseSelection(selection: any, groupComposition: GroupComposition): Selector {
        const selector = new Selector();
        let grouping: Grouping;

        if (typeof selection === 'object' && selection !== null) {
            if (selection instanceof Ungroup) {
                if (groupComposition.isUngroup) {
                    selection = this.handleMeaninglessSelection(MessageCodes.UNGROUP_WITHIN_UNGROUP, selection);
                }

                grouping = groupComposition.grouping;
            }
            else if (selection instanceof Group) {
                grouping = this.parseGrouping(selection._groupBy, groupComposition.grouping);

                if (groupComposition.isUngroup) {
                    if (grouping.length) {
                        throw 'Group with non empty grouping is not permitted within Ungroup!\n' + JSON.stringify((<Group>selection)._select);
                    }
                    selection = this.handleMeaninglessSelection(MessageCodes.GROUP_WITHIN_UNGROUP, selection);
                }
                else {
                    if (grouping.length) {
                        grouping = groupComposition.extendChildGrouping(this.logger, grouping);
                        if (grouping.length === groupComposition.grouping.length) {
                            selection = [(<Group>selection)._select];
                        }
                    }
                    else {
                        selection = this.handleMeaninglessSelection(MessageCodes.GROUP_WITH_NO_GROUPING, selection);
                    }
                }
            }

            if (selection instanceof Group || selection instanceof Ungroup) {
                const innerGroup: GroupComposition = this.createGroupComposition(selection, grouping, groupComposition.grouping);
                groupComposition.innerGroups.push(innerGroup);
                selector.subSelectors = innerGroup.isUngroup ?
                    innerGroup.getUngroupReference() :
                    innerGroup.id;
                selector.subSelectors += innerGroup.defineSorting();
            }
            else if (selection instanceof Array) {
                selector.subSelectors = utils.reduce(selection, (subSelectors, subSelection) => {
                    subSelectors.push(this.parseSelection(subSelection, groupComposition));
                    return subSelectors;
                }, []);
            }
            else {
                selector.subSelectors = utils.reduce(selection, (subSelectors, subSelection, subFieldName) => {
                    subSelectors[subFieldName] = this.parseSelection(subSelection, groupComposition);
                    return subSelectors;
                }, {});
            }

            selector.isLeaf = false;
        }
        else {
            const startingLevel = groupComposition.isUngroup ? 1 : 0;
            selector.subSelectors = new Field(
                this.logger,
                selection,
                this.quotes,
                this.allExpressions,
                groupComposition.id,
                groupComposition.grouping,
                groupComposition.isUngroup,
                startingLevel
            );
        }

        return selector;
    }

    private handleMeaninglessSelection(msgCode: number, selection: BaseGroup<Group | Ungroup>): any[] {
        this.logger.log(msgCode, selection._select);
        return [selection._select];
    }

    private parseGrouping(rawGrouping: string[], parentGrouping: Grouping): Grouping {
        return utils.reduce<string, Grouping>(
            rawGrouping,
            (accGrouping, groupBy) => {
                const groupExp: GroupBy = new GroupBy(
                    groupBy,
                    this.quotes,
                    this.allExpressions,
                    GroupBy.getLastGroupingId(parentGrouping, accGrouping)
                    );

                if (!groupExp.isOverallGrouping()) {
                    accGrouping.push(groupExp);
                }

                return accGrouping;
            },
            []);
    }

    private parseSorting(rawSorting: string[]): Sorting {
        return utils.map<string, OrderBy>(
            rawSorting,
            (rawOrderBy) =>
                new OrderBy(
                    rawOrderBy,
                    this.quotes,
                    this.allExpressions
                    )
            );
    }

    private parseFilter(filter: string): Expression {
        return filter ?
            new Expression(ExpressionType.FILTER, filter, this.quotes) :
            null;
    }

    private addFunction(fn: Function): boolean {
        const fnName: string = fn['name']; // tslint:disable-line:no-string-literal
        let hasChangedContext: boolean;

        if (!fnName || fnName === 'anonymous') {
            this.logger.warning(MessageCodes.ANONYMOUS_FN_IN_CONTEXT, fn);
            hasChangedContext = false;
        }
        else {
            hasChangedContext = this.context.hasOwnProperty(fnName);
            this.context[fnName] = fn;
        }

        return hasChangedContext;
    }

    private getGroupMap(groupComposition: GroupComposition, accumulator: IGroupMap): IGroupMap {
        const currGroupingIds: string = groupComposition.grouping.map((exp) => exp.id).join('');
        if (!accumulator[currGroupingIds]) {
            accumulator[currGroupingIds] = [];
        }
        utils.forEach<GroupComposition>(groupComposition.innerGroups, (innerGroup: GroupComposition) => {
            this.getGroupMap(innerGroup, accumulator);
        });
        accumulator[currGroupingIds].push(groupComposition);
        return accumulator;
    }

    private defineNonGroupedPostProcessing(): string {
        return this.allExpressions.reduce((def: string, exp: Expression) => {
            if (exp instanceof Aggregate && exp.isPostProcessingType() && !exp.grouping.length) {
                def += exp.definePostProcessing() + '\n';
            }
            return def;
        }, '');
    }

    private definePlainResultSet(): string {
        const groupingsDefinition: string = this.groupingComposition.defineGroupings(
            this.groupMap,
            this.groupingComposition
        );

        const nonGroupedFields = this.allExpressions.filter((exp) => !exp.parentGroupingId && exp instanceof Field);

        return QueryFormatter.defineAggregationIterator(
            groupingsDefinition,
            '',
            this.defineResultSet(),
            '',
            Expression.isAnyUsingIndex(nonGroupedFields)
        );
    }

    private defineGroupedResultSet(
        parentGroupingComposition: GroupingComposition,
        postProcessingLvl: number,
        shouldFillResults: boolean,
        groupingIds: string = ''
    ): string {
        const isParentComplex = parentGroupingComposition.isComplex();

        return utils.reverseMap(parentGroupingComposition.inner, (groupingComp: GroupingComposition) => {
            const iteratorName: string = groupingComp.groupingExpression.iteratorId;
            const groupingId: string = groupingComp.id;
            const currentGroupingIds = groupingIds + groupingId;
            const currentGroupCompositions: GroupComposition[] = this.groupMap[currentGroupingIds];
            const groupingDeclarations: string[] = groupingComp.getGroupingDeclarations(
                isParentComplex,
                parentGroupingComposition.id
            );
            const innerGroupReference: string = groupingDeclarations[0] || '';
            const innerGroupDeclaration: string = groupingDeclarations[1];

            const innerLoops: string = this.defineGroupedResultSet(
                groupingComp,
                postProcessingLvl,
                shouldFillResults,
                currentGroupingIds
            );

            let groupingsDeclaration: string = QueryFormatter.defineGrouping(
                groupingId,
                innerGroupReference,
                iteratorName
            );

            let fillingResults: string;

            if (shouldFillResults && currentGroupCompositions) {
                fillingResults = '';

                utils.forEach<GroupComposition>(currentGroupCompositions, (currentGroupComp) => {
                    if (!currentGroupComp.isUngroup) {
                        fillingResults += this.defineResultSet(currentGroupComp);
                    }
                    fillingResults += '\n';

                    const subSelectionCotainersDeclaration: string = utils.map(currentGroupComp.getSubGroups(), (innerGroup: GroupComposition) =>
                        innerGroup.getInitVariable() + ';'
                    ).join('\n');

                    groupingsDeclaration += '\n' + subSelectionCotainersDeclaration;
                });
            }

            const postProcessing: string = this.defineExpressionsPostProcessing(groupingComp.expressions, postProcessingLvl);

            if (postProcessing || innerLoops || fillingResults) {
                return QueryFormatter.defineGroupedResultSet(
                    innerGroupDeclaration,
                    innerGroupReference,
                    iteratorName,
                    groupingsDeclaration,
                    postProcessing,
                    innerLoops,
                    fillingResults
                );
            }

            return '';
        }).join('\n');
    }

    private defineResultSet(groupComposition: GroupComposition = this.groupComposition): string {
        const containerReference: string = groupComposition.isMain ?
            '__results__' :
            (groupComposition.isUngroup ? groupComposition.getUngroupReference() : groupComposition.id);
        const preProcessing: string[] = [];

        if (groupComposition.filter) {
            preProcessing.push('(' + groupComposition.filter.code + ')');
        }

        if (groupComposition.distinct) {
            preProcessing.push(QueryFormatter.defineDistinctPreProcessing(containerReference));
        }

        if (preProcessing.length) {
            return QueryFormatter.definePreProcessedPushTemplate(
                containerReference,
                Query.defineSelection(groupComposition.selection),
                preProcessing
            );
        }
        else {
            return QueryFormatter.defineResultsPushTemplate(
                containerReference,
                Query.defineSelection(groupComposition.selection)
            );
        }
    }

    private defineExpressionsPostProcessing(expressions: Expression[], processingLvl: number): string {
        return utils.reduce<Expression, string>(expressions, (acc, exp) => {
            if (processingLvl === exp.level && exp instanceof Aggregate) {
                acc += exp.definePostProcessing();
            }
            return acc;
        }, '');
    }

    private defineComparators(): string {
        return utils.reduce<Expression, string[]>(this.allExpressions, (comparators, exp) => {
            if (exp instanceof Aggregate) {
                const comparatorDef: string = exp.defineSortingComparator();
                if (comparatorDef) {
                    comparators.push(comparatorDef);
                }
            }
            return comparators;
        }, []).concat(
            utils.reduce<GroupComposition[], string[]>(this.groupMap, (comparators, groups) => {
                utils.forEach(groups, (group: GroupComposition) => {
                    if (group.hasSorting()) {
                        comparators.push(OrderBy.defineGroupComparator(group));
                    }
                });
                return comparators;
            }, [])
        ).join('\n');
    }

    private compareDataSourceType(dataSource: any): boolean {
        return this.dataSource instanceof Array ?
            (dataSource instanceof Array) :
            !(dataSource instanceof Array);
    }

    private logExpressions(): void {
        utils.forEach(this.allExpressions, (exp) =>
            this.logger.debugObject('Expression', exp)
        );
    }

    private static defineExpAggregations(expressions: Aggregate[]): string {
        return utils.map<Aggregate, string>(expressions, (exp: Aggregate) =>
            exp.defineAggregation()
        ).join('\n');
    }

    private static defineSelection(selector: Selector): string {
        const subSelectors = selector.subSelectors;

        if (subSelectors instanceof Expression) {
            return (<Expression>subSelectors).code;
        }
        else if (typeof subSelectors === 'string') {
            return subSelectors;
        }
        else if (subSelectors instanceof Array) {
            const expProps: string = utils.map<Selector, string>(subSelectors, (subSelector) =>
                Query.defineSelection(subSelector)
            ).join(', ');

            return `[ ${expProps} ]`;
        }
        else { // default type is object
            const expProps: string = utils.map<Selector, string>(subSelectors, (subSelector, groupId: string) =>
                QueryFormatter.defineProperty(groupId, Query.defineSelection(subSelector))
            ).join(', ');

            return `{ ${expProps} }`;
        }
    }
}

const PRIVATE_PROP_FLAGS = { enumerable: false, writable: true };
const QUERY_PRIVATE_PROPERTIES = {
    allExpressions: PRIVATE_PROP_FLAGS,
    changed: PRIVATE_PROP_FLAGS,
    code: PRIVATE_PROP_FLAGS,
    context: PRIVATE_PROP_FLAGS,
    datasource: PRIVATE_PROP_FLAGS,
    debugLevel: PRIVATE_PROP_FLAGS,
    fn: PRIVATE_PROP_FLAGS,
    groupComposition: PRIVATE_PROP_FLAGS,
    groupMap: PRIVATE_PROP_FLAGS,
    groupingComposition: PRIVATE_PROP_FLAGS,
    logger: PRIVATE_PROP_FLAGS,
    preFiltering: PRIVATE_PROP_FLAGS,
    quotes: PRIVATE_PROP_FLAGS
// TODO::
};
