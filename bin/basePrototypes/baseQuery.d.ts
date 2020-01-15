import { IBaseQuery } from '../interfaces/iBaseQuery';
import { IBaseQueryDefinition } from '../interfaces/IDefinition';
export declare class BaseQuery<T> implements IBaseQuery<T> {
    protected id: string;
    protected type: string;
    protected _select: any;
    protected _filter: string;
    protected _distinct: boolean;
    protected _groupBy: string[];
    protected _orderBy: string[];
    protected _asList: boolean;
    constructor(type: string);
    distinct(apply?: boolean): BaseQuery<T>;
    filter(rawFilter?: string): BaseQuery<T>;
    range(length: number, start?: number): BaseQuery<T>;
    orderBy(rawSorting?: string | string[]): BaseQuery<T>;
    asObject(propertyExpression?: string): BaseQuery<T>;
    asList(): BaseQuery<T>;
    asValue(propName?: string): BaseQuery<T>;
    getDefinition(): IBaseQueryDefinition;
    protected encapsulate(): void;
    protected applySelect(...args: any[]): void;
    protected applyList(rawList: string | string[], appliedListRef: string): boolean;
    protected applyDistinct(apply?: boolean): boolean;
    protected applyFilter(rawFilter: string): boolean;
    protected copyTo(copy: BaseQuery<T>): void;
    private copySelect;
}
