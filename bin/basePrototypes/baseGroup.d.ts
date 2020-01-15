import { IBaseGroup } from '../interfaces/iBaseGroup';
import { IBaseGroupDefinition } from '../interfaces/IDefinition';
import { BaseQuery } from './baseQuery';
export declare class BaseGroup<T> extends BaseQuery<T> implements IBaseGroup<T> {
    protected _uniformed: boolean;
    constructor(type: string, ...selections: any[]);
    uniformed(apply?: boolean): BaseGroup<T>;
    copyTo(copy: BaseGroup<T>): void;
    getDefinition(): IBaseGroupDefinition;
}
