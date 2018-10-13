import * as utils from '../common/utils';
import { Logger, MessageCodes } from '../common/logger';
import { Expression } from '../prototypes/expression';
import { GroupBy, Grouping } from '../expressions/groupBy';
import { Sorting } from '../expressions/orderBy';

export class GroupComposition {
    id: string;
    selection: Selector;
    distinct: boolean;
    filter: Expression;
    grouping: Grouping;
    sorting: Sorting;
    expressions: Array<Expression>;
    outputType: OutputType;
    isMain: boolean;
    isUngroup: boolean;
    hasParentGrouping: boolean;
    innerGroups: Array<GroupComposition>;

    constructor(groupId: string, distinct: boolean, filter: Expression, grouping: Grouping, sorting: Sorting, isMain: boolean = false, isUngroup: boolean = false, hasParentGrouping = false) {
        this.id = groupId;
        this.distinct = distinct;
        this.filter = filter;
        this.grouping = grouping;
        this.sorting = sorting;
        this.outputType = OutputType.AS_LIST;
        this.innerGroups = [];
        this.isMain = isMain;
        this.isUngroup = isUngroup;
        this.hasParentGrouping = hasParentGrouping;
    }

    public getInitVariable(): string {
        var initValue: string;
        switch(this.outputType) {
            case OutputType.AS_LIST: initValue = '[]'; break;
            case OutputType.AS_OBJECT: initValue = '{}'; break;
            default: initValue = 'null';
        };
        return utils.format('{0} = {1}',
            this.id,
            initValue
        );
    }

    public isSubSelectorGroup(): boolean {
        return !this.isMain && !this.isUngroup;
    }

    public hasSorting(): boolean {
        return this.sorting.length > 0;
    }

    public getSubGroups(): Array<GroupComposition> {
        return this.innerGroups.filter((innerGroup) => !innerGroup.isUngroup);
    }

    public getUngroupReference(): string {
        var directGrouping = this.grouping[this.grouping.length - 1];
        var groupingId = directGrouping ? directGrouping.id : '__groupings__';
        return groupingId + '.' + this.id;
    }

    public extendChildGrouping(logger: Logger, grouping: Grouping): Grouping {
        var childGrouping: Grouping = utils.copy(this.grouping);

        utils.forEach(grouping, (groupBy: GroupBy) => {
            var matchParentsGroupBy = utils.some(this.grouping, (parentGroupBy: GroupBy) =>
                parentGroupBy.equals(groupBy)
                );

            if (matchParentsGroupBy) {
                logger.log(MessageCodes.UNNECESSARY_GROUP_BY, groupBy.raw);
            }
            else {
                childGrouping.push(groupBy);
            }
        });
        return childGrouping;
    }

    public defineSorting(): string {
        return this.hasSorting() ?
            '.sort(' + utils.addIdSuffix(this.id, 'Comparator') + ')' :
            '';
    }
}

export type SubSelector = { string?: Selector } | Array<Selector> | Expression | string;

export class Selector {
    subSelectors: SubSelector;
    isLeaf: boolean;
    ungroupLabelDef: string; // TODO::

    constructor() {
        this.isLeaf = true;
        this.ungroupLabelDef = null;
        this.subSelectors = null;
    }
}

export enum OutputType {
    AS_LIST,
    AS_OBJECT,
    AS_VALUE
}