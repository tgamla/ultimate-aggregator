import { BaseGroup } from './basePrototypes/baseGroup';
import { IGroup } from './types/iGroup';
export declare class Group extends BaseGroup<Group> implements IGroup {
    constructor(...selections: any[]);
    by(grouping?: string | string[]): Group;
    clone(): Group;
}
