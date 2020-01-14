import { IBaseGroup } from '../types/iBaseGroup';
import { BaseQuery } from './baseQuery';
export declare class BaseGroup<T> extends BaseQuery<T> implements IBaseGroup<T> {
    _uniformed: boolean;
    constructor(type: string, ...selections: any[]);
    uniformed(apply?: boolean): BaseGroup<T>;
    copyTo(copy: BaseGroup<T>): void;
}
