import { BaseGroup } from './basePrototypes/baseGroup';
export declare class Ungroup extends BaseGroup<Ungroup> implements IUngroup {
    constructor(...selections: any[]);
    clone(): IUngroup;
}
