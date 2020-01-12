import { Logger, MessageCodes } from '../common/logger';
import * as utils from '../common/utils';
import { Expression } from '../expressions/expression';
import { GroupBy, Grouping } from '../expressions/groupBy';
import { Sorting } from '../expressions/orderBy';
import { Selector } from './selector';

export class GroupComposition {
    id: string;
    selection: Selector;
    distinct: boolean;
    filter: Expression;
    grouping: Grouping;
    sorting: Sorting;
    expressions: Expression[];
    outputType: OutputType;
    isMain: boolean;
    isUngroup: boolean;
    hasParentGrouping: boolean;
    innerGroups: GroupComposition[];

    constructor(
        groupId: string,
        distinct: boolean,
        filter: Expression,
        grouping: Grouping,
        sorting: Sorting,
        isMain: boolean = false,
        isUngroup: boolean = false,
        hasParentGrouping = false
    ) {
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

    getInitVariable(): string {
        let initValue: string;

        switch(this.outputType) {
            case OutputType.AS_LIST: initValue = '[]'; break;
            case OutputType.AS_OBJECT: initValue = '{}'; break;
            default: initValue = 'null';
        }

        return `${this.id} = ${initValue}`;
    }

    getGroupVariableDeclarations(): string[] {
        return utils.reduce<GroupComposition, string[]>(this.innerGroups, (declarations, group) => {
            if (group.isSubSelectorGroup()) {
                if (group.hasParentGrouping) {
                    declarations.push(group.id);
                }
                else {
                    declarations.push(group.getInitVariable());
                }
            }
            return declarations.concat(group.getGroupVariableDeclarations());
        }, []);
    }

    isSubSelectorGroup(): boolean {
        return !this.isMain && !this.isUngroup;
    }

    hasSorting(): boolean {
        return this.sorting.length > 0;
    }

    getSubGroups(): GroupComposition[] {
        return this.innerGroups.filter((innerGroup) => !innerGroup.isUngroup);
    }

    getUngroupReference(): string {
        const directGrouping = this.grouping[this.grouping.length - 1];
        const groupingId = directGrouping ? directGrouping.id : '__groupings__';
        return groupingId + '.' + this.id;
    }

    extendChildGrouping(logger: Logger, grouping: Grouping): Grouping {
        const childGrouping: Grouping = utils.copy(this.grouping);

        utils.forEach(grouping, (groupBy: GroupBy) => {
            const matchParentsGroupBy = utils.some(this.grouping, (parentGroupBy: GroupBy) =>
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

    defineSorting(): string {
        return this.hasSorting() ?
            '.sort(' + utils.addIdSuffix(this.id, 'Comparator') + ')' :
            '';
    }
}

export interface IGroupMap {
    string?: GroupComposition[];
}

export enum OutputType {
    AS_LIST,
    AS_OBJECT,
    AS_VALUE
}
