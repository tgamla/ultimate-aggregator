import { BaseGroup } from './basePrototypes/baseGroup';
import { IUngroup } from './types/iUngroup';
export declare class Ungroup extends BaseGroup<Ungroup> implements IUngroup {
    constructor(...selections: any[]);
    clone(): IUngroup;
}
