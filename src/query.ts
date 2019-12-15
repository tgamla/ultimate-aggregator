import * as utils from './common/utils';
import { Logger, MessageCodes } from './common/logger';
import { QueryFormatter } from './common/formatter';
import { BaseQuery } from './prototypes/baseQuery';
import { Group } from './group';
import { Ungroup } from './ungroup';
import { Expression, Quotes, Type as ExpressionType } from './prototypes/expression';
import { Field } from './expressions/field';
import { Aggregate } from './expressions/aggregate';
import { GroupBy, Grouping } from './expressions/groupBy';
import { OrderBy, Sorting } from './expressions/orderBy';
import { GroupComposition, Selector } from './helpers/groupComposition';
import { GroupingComposition } from './helpers/groupingComposition';
import { PreProcess } from './helpers/preProcess';
import { BaseGroup } from './prototypes/baseGroup';

export class Query extends BaseQuery<Query> implements IQuery {
    public _preFilter: string;
    private preFiltering: PreProcess;

    private datasource: any;
    private changed: boolean;

    private context: { __logger__?: Logger; __quotes__?: Quotes; string?: string };
    private logger: Logger;
    private debugLevel: number;

    private groupMap: GroupMap;
    private groupComposition: GroupComposition;
    private groupingComposition: GroupingComposition;
    private allExpressions: Array<Expression>;
    private quotes: Quotes;
    private fn: Function;
    private code: string;

    constructor(config: IConfig = {}) {
        super('Query');
        this._preFilter = null;
        this.datasource = [];
        this.allExpressions = null;
        this.quotes = null;
        this.fn = null;
        this.changed = true;
        this.context = {};
        this.config(config);

        return this.encapsulate();
    }

    config(config: IConfig): Query {
        if (config == null || typeof config !== 'object') {
            this.logger.warning(MessageCodes.EMPTY_CONFIG);
            return this;
        }
        this.logger = new Logger(this.id, config);
        this.debugLevel = config.debugLevel || 0;
        
        return this.applyChange();
    }

    addContext(reference: Object|Function|string, value?: any): Query {
        var hasChangedContext: boolean = false;

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
            if (!this.changed)
                this.bindFn();
            return this;
        }
    }

    removeContext(reference: string | object): Query {
        if (reference === undefined) {
            this.context = {};
            if (!this.changed)
                this.bindFn();
            return this;
        }

        var hasChanged = false;
        var refType = typeof reference;
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

    preFilter(filter?: /* TODO:: Function | */ string): Query {
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

    preOrderBy(): Query {
        // TODO::
        return this.applyChange();
    }

    define(): Query {
        // TODO::
        return this.applyChange();
    }

    select(...args: Array<any>): Query {
        this.applySelect(args[0]);
        return this.applyChange();
    }

    from(datasource?: any): Query {
        var hasTypeChanged: boolean;

        if (datasource == null) {
            hasTypeChanged = !(this.datasource instanceof Array);
            this.datasource = [];
        }
        else if (typeof datasource === 'object') {
            hasTypeChanged = this.compareDatasourceType(datasource);
            this.datasource = datasource;
        }
        else {
            this.logger.warning(MessageCodes.UNSUPPORTED_DATA_TYPE);
            hasTypeChanged = !(this.datasource instanceof Array);
            this.datasource = [];
        }

        return this.applyChange(hasTypeChanged);
    }

    distinct(apply?: boolean): Query {
        return this.applyChange(this.applyDistinct(apply));
    }

    groupBy(rawGrouping?: string | Array<string>): Query {
        if (this.applyList(rawGrouping, '_groupBy')) {
            return this.applyChange();
        }
        else {
            return this;
        }
    }

    totals(): Query {
        // TODO::
        return this.applyChange();
    }

    filter(rawFilter?: string): Query {
        return this.applyChange(this.applyFilter(rawFilter));
    }

    orderBy(rawSorting?: string | Array<string>): Query {
        return this.applyChange(this.applyList(rawSorting, '_orderBy'));
    }

    range(start: number, end?: number): Query {
        // TODO::
        return this.applyChange();
    }

    clone(): Query {
        var copy: Query = new Query();
        // TODO::
        return copy;
    }

    toList(): Array<any> {
        // TODO:: if type changes
        return this.execute();
    }

    toObject(): Object {
        // TODO::
        return {};
    }

    toValue(): any {
        // TODO::
        return null;
    }

    execute(datasource?: any): any {
        var workingData: any;

        if (datasource instanceof Query) {
            workingData = datasource.execute();
        }
        else if (this.datasource instanceof Query) {
            workingData = this.datasource.execute(datasource);
        }
        else {
            workingData = datasource === undefined ?
                this.datasource : datasource;
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

    static fromDefinition(definition: string | Object): Query {
        var defObj: BaseQuery<Query>;

        if (definition instanceof Object) {
            defObj = <BaseQuery<Query>>definition;
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

        var query: Query = new Query();
        
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

    protected encapsulate(): Query {
        Object.defineProperties(
            this,
            QUERY_PRIVATE_PROPERTIES
        );
        // Object.seal(this); // TODO:: not working?
        return this;
    }

    private applyChange(applied: boolean = true): Query {
        if (applied) {
            this.changed = true;
        }
        return this;
    }

    private execPreFiltering(data: any): Array<any>|Object {
        var preFilterObj = this.preFiltering;
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

    private calculate(data: any): Array<any> {
        try {
            if (this.changed) {
                // TODO:: error if no select has been defined!
                this.init();
                var mainGrouping: Grouping = this.parseGrouping(this._groupBy, null);
                this.groupComposition = this.createGroupComposition(this, mainGrouping);
                this.groupMap = this.getGroupMap(this.groupComposition, {});
                this.groupingComposition = this.createGroupingComposition(this.allExpressions);
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

        return [];
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
        var hasQueryGrouping: boolean = this.hasQueryGrouping();
        var aggregationIterators: string = this.defineAggregationIterators();
        var groupedResultSet: string = this.defineGroupedResultSet(this.groupingComposition, 1, true);
        var resultSet: string;

        if (!hasQueryGrouping) {
            if (this.hasAnySubGroup() || this.hasAnyPrimalAggregationNonOver()) {
                resultSet = this.defineResultSet();
            }
            else {
                resultSet = this.definePlainResultSet();
            }
        }

        this.code = QueryFormatter.formatFunction(
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
        var params: Array<string> = Object.keys(this.context);
        params.push('data', this.code);
        
        var args: Array<any> = [];
        utils.forEach(this.context, (arg) => args.push(arg));

        var fn = Function.apply(null, params);
        this.fn = Function.prototype.bind.apply(fn, [fn].concat(args));
    }

    private hasQueryGrouping(): boolean {
        return this.groupComposition.grouping.length > 0;
    }

    private hasAnyPrimalAggregationNonOver(): boolean {
        return utils.some<Expression>(this.allExpressions, exp => exp instanceof Aggregate && exp.isPrimalNonOver());
    }

    private hasAnySubGroup(): boolean {
        return utils.keysLength(this.groupComposition.innerGroups) ? true : false;
    }

    private hasAnyGroupDistinct(groupComposition: GroupComposition = this.groupComposition): boolean {
        if (groupComposition.distinct) {
            return true;
        }
        return utils.some<GroupComposition>(groupComposition.innerGroups, (groupComp) => this.hasAnyGroupDistinct(groupComp));
    }

    private defineAllDeclaration(): string {
        return utils.format(
`var __results__ = [],
    __groupings__ = {0},
    __val__, __length__, __i__,
    {1}
    prop, row, out, index = 1;`,
            this.defineMainGroupingDeclaration(),
            this.defineAllVariableDeclarations()
        );
    }

    private defineMainGroupingDeclaration(): string {
        return this.defineGrouping(this.groupingComposition, this.groupMap['']);
    }

    private isAnyUsingIndex(expressions: Array<Expression>) {
        return utils.some<Expression>(expressions, (exp) => exp.hasIndex);
    }

    private defineAllVariableDeclarations(): string {
        var groupings: Grouping = <Grouping>this.allExpressions.filter((exp) => exp.isGroupingExpression());

        var declarations = groupings.reduce((acc, exp) => {
            acc.push(exp.id);
            acc.push(exp.valueId);
            return acc;
        }, []);

        declarations = declarations.concat(
            this.groupingComposition.getGroupingVariableDeclarations()
        );

        declarations = declarations.concat(
            this.getGroupVariableDeclarations(this.groupComposition)
        )

        return declarations.join(', ') + (declarations.length ? ',' : '');
    }

    private getGroupVariableDeclarations(groupComposition: GroupComposition): Array<string> {
        return utils.reduce<GroupComposition, Array<string>>(groupComposition.innerGroups, (declarations, group) => {
            if (group.isSubSelectorGroup()) {
                if (group.hasParentGrouping) {
                    declarations.push(group.id);
                }
                else {
                    declarations.push(group.getInitVariable());
                }
            }
            return declarations.concat(this.getGroupVariableDeclarations(group));
        }, []);
    }

    private defineAggregationIterators(): string {
        var expsByLevel: Array<Array<Aggregate>> = this.getExpAggregationsByLevels().reverse();
        var maxLevel: number = expsByLevel.length || 1;
        var iterators: Array<string> = [];

        for (var level = 0; level < maxLevel; level++) {
            var isLastIteration: boolean = (level + 1) === maxLevel;
            var currentLevelAggregations: Array<Aggregate> = expsByLevel[level];
            var groupingCompByLvl: GroupingComposition = isLastIteration ?
                this.groupingComposition :
                this.createGroupingComposition(currentLevelAggregations);
            var isUsingIndex: boolean = this.isAnyUsingIndex(currentLevelAggregations);
            var ungroupsDef: string = isLastIteration ? this.defineUngroups() : '';
            var groupingsDef: string = this.defineGroupings('', [], this.groupingComposition, groupingCompByLvl, isLastIteration);
            var aggregationDef: string = this.defineExpAggregations(currentLevelAggregations);

            if (groupingsDef || ungroupsDef || aggregationDef) {
                var postProcessing: string = isLastIteration ?
                    '' :
                    this.defineGroupsPostProcessing(maxLevel - level);

                iterators.push(
                    QueryFormatter.formatAggregationIterator(
                        groupingsDef,
                        ungroupsDef,
                        aggregationDef,
                        postProcessing,
                        isUsingIndex
                    )
                );
            }
        }
        
        return iterators.join('\n\n');
    }

    private getExpAggregationsByLevels(): Array<Array<Aggregate>> {
        return utils.reduce<Expression, Array<Array<Aggregate>>>(this.allExpressions, (acc, exp) => {
            if (exp instanceof Aggregate) {
                var currLevelExps = acc[exp.level - 1];
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

    private getUngroups(groupComposition: GroupComposition): Array<GroupComposition> {
        return utils.reduce<GroupComposition, Array<GroupComposition>>(groupComposition.innerGroups, (acc, innerGroupComp) => {
            acc = acc.concat(
                this.getUngroups(innerGroupComp)
            );
            if (innerGroupComp.isUngroup) {
                acc.push(innerGroupComp);
            }
            return acc;
        }, []);
    }

    private defineGroupings(
        groupingIds: string,
        definedGroupings: Array<string>,
        baseGroupings: GroupingComposition,
        currentGroupings: GroupingComposition,
        isLastIteration: boolean
    ): string {
        return utils.map(currentGroupings.inner, (groupingComp: GroupingComposition, groupingId: string) => {
            var baseGrouping: GroupingComposition = baseGroupings.inner[groupingId];
            var currentGroupingIds: string = groupingIds + groupingId;
            var parentGrouping = (baseGroupings.groupingExpression ? currentGroupings.id : '__groupings__') +
                    (baseGroupings.isComplex() ? '.' + groupingId : '');
            var definition: string;

            if (!baseGrouping.hasBeenDefined) {
                var currentGroupMaps = this.groupMap[currentGroupingIds];
                
                definition = utils.format(Query.GROUPING_DECLARATION_TEMPLATE,
                    groupingComp.id,
                    groupingComp.groupingExpression.valueId,
                    groupingComp.groupingExpression.code,
                    parentGrouping,
                    this.defineGrouping(baseGrouping, currentGroupMaps),
                    this.defineGroupIndexIncrementation(groupingComp),
                    this.defineGroupRowAssignment(groupingComp)
                );

                baseGrouping.hasBeenDefined = true;
                definedGroupings.push(groupingComp.id);
            }
            else if (definedGroupings.indexOf(groupingComp.id) == -1) {
                definition = utils.format(Query.GROUPING_FETCH,
                    groupingComp.id,
                    groupingComp.groupingExpression.code,
                    parentGrouping
                );

                definedGroupings.push(groupingComp.id);
            }

            return (definition || '') + '\n' + this.defineGroupings(currentGroupingIds, definedGroupings, baseGrouping, groupingComp, isLastIteration);
        }).join('');
    }
    private static GROUPING_DECLARATION_TEMPLATE: string =
`    {1} = {2};
    if ({3}.hasOwnProperty({1})) {
        {0} = {3}[{1}];{5}{6}
    }
    else {
        {0} = {3}[{1}] = {4};
    }`;
    private static GROUPING_FETCH: string = `    {0} = {2}[{1}];`;

    private static OBJECT_COMPOSITION: string = `{ {0} }`;
    private defineGrouping(baseGrouping: GroupingComposition, groupCompositions: Array<GroupComposition>): string {
        var definition: string;
        var props: Array<string> = [];

        // Adds declarattion of inner groups
        utils.forEach<GroupingComposition>(baseGrouping.inner,
            (gComp) => props.push(gComp.groupingExpression.id + ': {}')
        );
        // Adds declaration of group expressions
        utils.forEach<Aggregate>(baseGrouping.getAggregations(), (exp) => {
            props.push(exp.defineInitialProperty());
            if (exp.hasDistinct) {
                props.push(exp.distinctProperty());
            }
        });
        
        if (baseGrouping.hasNonAggregatedGroupedFields()) {
            props.push('row: row');
        }

        if (baseGrouping.hasFieldsWithGroupIndex()) {
            props.push('groupIndex: 1');
        }

        utils.forEach<GroupComposition>(groupCompositions, (groupComp: GroupComposition) => {
            if (groupComp.isUngroup) {
                props.push(groupComp.id + ': []');
            }
        });

        definition = props.join(', ');

        return utils.format(Query.OBJECT_COMPOSITION, definition);
    }

    private defineGroupRowAssignment(groupingComp: GroupingComposition): string {
        return groupingComp.hasNonAggregatedGroupedFields() ?
            '\n        ' + groupingComp.id + '.row = row;' : '';
    }

    private defineGroupIndexIncrementation(groupingComp: GroupingComposition): string {
        return groupingComp.hasFieldsWithGroupIndex() ?
            '\n        ' + groupingComp.id + '.groupIndex++;' : '';
    }

    private defineExpAggregations(expressions: Array<Aggregate>): string {
        return utils.map<Aggregate, string>(expressions, (exp: Aggregate) => 
            exp.defineAggregation()
        ).join('\n');
    }

    private defineGroupsPostProcessing(postProcessingLvl: number): string {
        var expForPostProcessing: Array<Aggregate> = <Array<Aggregate>>this.allExpressions.filter(
            (exp) => exp.level === postProcessingLvl && exp instanceof Aggregate && exp.isPostProcessingType()
            );
        if (expForPostProcessing.length) {
            var currentLvlGroupingComp = this.createGroupingComposition(expForPostProcessing);
            return this.defineGroupedResultSet(currentLvlGroupingComp, postProcessingLvl, false);
        }
        else {
            return '';
        }
    }

    private createGroupComposition(group: BaseQuery<Query | Group | Ungroup>, grouping: Grouping = [], parentGrouping: Grouping = null): GroupComposition {
        var groupId: string = (<Query>group).id;
        var select: any = group._select;
        var isMain: boolean = parentGrouping === null;
        var isUngroup: boolean = (group instanceof Ungroup);
        var hasParentGrouping: boolean = parentGrouping && parentGrouping.length ? true : false;
        var sorting: Sorting = this.parseSorting(group._orderBy);
        var filter: Expression = this.parseFilter(group._filter);
        var groupComposition: GroupComposition = new GroupComposition(groupId, group._distinct, filter, grouping, sorting, isMain, isUngroup, hasParentGrouping);
        groupComposition.selection = this.parseSelection(select, groupComposition);
        groupComposition.expressions = this.allExpressions.filter((exp: Expression) => exp.groupIds.indexOf((<Query>group).id) > -1);
        return groupComposition;
    }

    private parseSelection(selection: any, groupComposition: GroupComposition): Selector {
        var selector = new Selector();
        var grouping: Grouping;

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
                var innerGroup: GroupComposition = this.createGroupComposition(selection, grouping, groupComposition.grouping);
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
            var startingLevel = groupComposition.isUngroup ? 1 : 0;
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

    private handleMeaninglessSelection(msgCode: number, selection: BaseGroup<Group | Ungroup>): Array<any> {
        this.logger.log(msgCode, selection._select);
        return [selection._select];
    }

    private parseGrouping(rawGrouping: Array<string>, parentGrouping: Grouping): Grouping {
        return utils.reduce<string, Grouping>(
            rawGrouping,
            (accGrouping, groupBy) => {
                var groupExp: GroupBy = new GroupBy(
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

    private parseSorting(rawSorting: Array<string>): Sorting {
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
            null
    }

    private createGroupingComposition(expressions: Array<Expression>): GroupingComposition {
        return expressions.reduce((groupingComposition, expression) => {
            if (expression.isSelectiveType()) {
                var groupComp: GroupingComposition = (<Field|Aggregate>expression).grouping.reduce((groupingComp, groupingExp) => {
                    var innerGrpComp: GroupingComposition = groupingComp.inner[groupingExp.id];
    
                    if (innerGrpComp === undefined) {
                        groupingComp.inner[groupingExp.id] = innerGrpComp = new GroupingComposition(groupingExp);
                    }
    
                    return innerGrpComp;
                }, groupingComposition);
    
                groupComp.expressions.push(expression);
            }

            return groupingComposition;
        }, new GroupingComposition(null));
    }

    private findGroupingComposition(groupingComposition: GroupingComposition, groupingId: string) {
        if (groupingComposition.id === groupingId) {
            return groupingComposition;
        }
        return utils.returnFound<GroupingComposition>(groupingComposition.inner, (inner) => this.findGroupingComposition(inner, groupingId))
    }

    private addFunction(fn: Function): boolean {
        var hasChangedContext: boolean;
        var fnName: string = fn['name'];

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

    private getGroupMap(groupComposition: GroupComposition, accumulator: GroupMap): GroupMap {
        var currGroupingIds: string = groupComposition.grouping.map((exp) => exp.id).join('');
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
        var groupingsDefinition: string = this.defineGroupings(
            '',
            [],
            this.groupingComposition,
            this.groupingComposition,
            true
        );

        var nonGroupedFields = this.allExpressions.filter((exp) => !exp.parentGroupingId && exp instanceof Field);

        return QueryFormatter.formatAggregationIterator(
            groupingsDefinition,
            '',
            this.defineResultSet(),
            '',
            this.isAnyUsingIndex(nonGroupedFields)
        );
    }

    private static GROUPING_VAR_DECLARATION = '    {0} = {1}[{2}];';
    private defineGroupedResultSet(
        parentGroupingComposition: GroupingComposition,
        postProcessingLvl: number,
        shouldFillResults: boolean,
        groupingIds: string = ''
    ): string {
        var isParentComplex = parentGroupingComposition.isComplex();
        
        return utils.reverseMap(parentGroupingComposition.inner, (groupingComp: GroupingComposition) => {
            var iteratorName: string = groupingComp.groupingExpression.iteratorId;
            var groupingId: string = groupingComp.id;
            var currentGroupingIds = groupingIds + groupingId;
            var currentGroupCompositions: Array<GroupComposition> = this.groupMap[currentGroupingIds];
            var groupingDeclarations: Array<string> = groupingComp.getGroupingDeclarations(
                isParentComplex,
                parentGroupingComposition.id
            );
            var innerGroupReference: string = groupingDeclarations[0];
            var innerGroupDeclaration: string = groupingDeclarations[1];

            var groupingsDeclaration: string = utils.format(Query.GROUPING_VAR_DECLARATION,
                groupingId,
                innerGroupReference || '',
                iteratorName
            );

            var innerLoops: string = this.defineGroupedResultSet(
                groupingComp,
                postProcessingLvl,
                shouldFillResults,
                currentGroupingIds
            );

            var fillingResults: string;
            if (shouldFillResults && currentGroupCompositions) {
                fillingResults = '';

                utils.forEach<GroupComposition>(currentGroupCompositions, (currentGroupComp) => {
                    if (!currentGroupComp.isUngroup) {
                        fillingResults += this.defineResultSet(currentGroupComp);
                    }
                    fillingResults += '\n';

                    var subSelectionCotainersDeclaration: string = utils.map(currentGroupComp.getSubGroups(), (innerGroup: GroupComposition) =>
                        innerGroup.getInitVariable() + ';'
                    ).join('\n');
    
                    groupingsDeclaration += '\n' + subSelectionCotainersDeclaration;
                });
            }

            var postProcessing: string = this.defineExpressionsPostProcessing(groupingComp.expressions, postProcessingLvl);

            if (postProcessing || innerLoops || fillingResults) {
                return QueryFormatter.formatGroupedResultSet(
                    innerGroupDeclaration,
                    innerGroupReference || '',
                    iteratorName,
                    groupingsDeclaration,
                    postProcessing,
                    innerLoops,
                    fillingResults
                );
            }
            else
                return '';
            
        }).join('\n');
    }

    private static RESULTS_PUSH_TEMPLATE = '{0}.push({1});';
    private static RESULTS_PREPROCESSED_PUSH_TEMPLATE =
`out = {1};
if ({2})
    {0}.push({1});`;
    private defineResultSet(groupComposition: GroupComposition = this.groupComposition): string {
        var containerReference: string = groupComposition.isMain ?
            '__results__' :
            (groupComposition.isUngroup ? groupComposition.getUngroupReference() : groupComposition.id);
        var preProcessing: Array<string> = [];
        
        if (groupComposition.filter) {
            preProcessing.push('(' + groupComposition.filter.code + ')');
        }

        if (groupComposition.distinct) {
            preProcessing.push(utils.format(
                '!{0}({1}, out)',
                QueryFormatter.DISTINCT_FN_NAME,
                containerReference
                ));
        }

        if (preProcessing.length) {
            return utils.format(Query.RESULTS_PREPROCESSED_PUSH_TEMPLATE,
                containerReference,
                this.defineSelection(groupComposition.selection),
                preProcessing.join(' && ')
            );
        }
        else {
            return utils.format(Query.RESULTS_PUSH_TEMPLATE,
                containerReference,
                this.defineSelection(groupComposition.selection)
            );
        }
    }

    private static PROPEERTY_DEFINITION: string = '"{0}": {1}';
    private defineSelection(selector: Selector): string {
        var subSelectors = selector.subSelectors;

        if (subSelectors instanceof Expression) {
            return (<Expression>subSelectors).code;
        }
        else if (typeof subSelectors === 'string') {
            return subSelectors;
        }
        else if (subSelectors instanceof Array) {
            var expProps: string = utils.map<Selector, string>(subSelectors, (subSelector) =>
                this.defineSelection(subSelector)
            ).join(', ');

            return utils.format('[ {0} ]', expProps);
        }
        else {
            var expProps: string = utils.map<Selector, string>(subSelectors, (subSelector, groupId: string) =>
                utils.format(Query.PROPEERTY_DEFINITION, groupId, this.defineSelection(subSelector))
            ).join(', ');

            return utils.format('{ {0} }', expProps);
        }
    }

    private defineExpressionsPostProcessing(expressions: Array<Expression>, processingLvl: number): string {
        return utils.reduce<Expression, string>(expressions, (acc, exp) => {
            if (processingLvl === exp.level && exp instanceof Aggregate) {
                acc += exp.definePostProcessing();
            }
            return acc;
        }, '');
    }

    private defineComparators(): string {
        return utils.reduce<Expression, Array<string>>(this.allExpressions, (comparators, exp) => {
            if (exp instanceof Aggregate) {
                var comparatorDef: string = exp.defineSortingComparator();
                if (comparatorDef) {
                    comparators.push(comparatorDef);
                }
            }
            return comparators;
        }, []).concat(
            utils.reduce<Array<GroupComposition>, Array<string>>(this.groupMap, (comparators, groups) => {
                utils.forEach(groups, (group: GroupComposition) => {
                    if (group.hasSorting()) {
                        comparators.push(this.defineGroupComparator(group));
                    }
                });
                return comparators;
            }, [])
        ).join('\n');
    }

    private defineGroupComparator(group: GroupComposition): string {
        return utils.format(
`function {0}(out, __outB__) {
{1}
}`,
            utils.addIdSuffix(group.id, 'Comparator'),
            OrderBy.defineComparator(group.sorting)
        );
    }

    private compareDatasourceType(datasource: any): boolean {
        return this.datasource instanceof Array ?
            (datasource instanceof Array) :
            !(datasource instanceof Array);
    }

    private logExpressions(): void {
        utils.forEach(this.allExpressions, (exp) =>
            this.logger.debugObject('Expression', exp)
        );
    }
}

type GroupMap = { string?: Array<GroupComposition> }

var PRIVATE_PROP_FLAGS = { enumerable: false, writable: true };
var QUERY_PRIVATE_PROPERTIES = {
    datasource: PRIVATE_PROP_FLAGS,
    changed: PRIVATE_PROP_FLAGS,
    logger: PRIVATE_PROP_FLAGS,
    allExpressions: PRIVATE_PROP_FLAGS,
    context: PRIVATE_PROP_FLAGS,
    debugLevel: PRIVATE_PROP_FLAGS,
    fn: PRIVATE_PROP_FLAGS,
    groupComposition: PRIVATE_PROP_FLAGS,
    groupMap: PRIVATE_PROP_FLAGS,
    groupingComposition: PRIVATE_PROP_FLAGS,
    quotes: PRIVATE_PROP_FLAGS,
    code: PRIVATE_PROP_FLAGS,
    preFiltering: PRIVATE_PROP_FLAGS
// TODO::
};
