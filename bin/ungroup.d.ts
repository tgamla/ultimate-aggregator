import { BaseGroup } from './basePrototypes/baseGroup';
import { IBaseGroupDefinition as IUngroupDefinition } from './interfaces/IDefinition';
import { IUngroup } from './interfaces/iUngroup';
export declare class Ungroup extends BaseGroup<Ungroup> implements IUngroup {
    constructor(...selections: any[]);
    clone(): IUngroup;
    getDefinition(): IUngroupDefinition;
}
