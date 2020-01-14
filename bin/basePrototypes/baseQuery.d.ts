export declare class BaseQuery<T> implements IBaseQuery<T> {
    id: string;
    type: string;
    _select: any;
    _filter: string;
    _distinct: boolean;
    _groupBy: string[];
    _orderBy: string[];
    _asList: boolean;
    constructor(type: string);
    distinct(apply?: boolean): BaseQuery<T>;
    filter(rawFilter?: string): BaseQuery<T>;
    range(length: number, start?: number): BaseQuery<T>;
    orderBy(rawSorting?: string | string[]): BaseQuery<T>;
    asObject(propertyExpression?: string): BaseQuery<T>;
    asList(): BaseQuery<T>;
    asValue(propName?: string): BaseQuery<T>;
    protected encapsulate(): void;
    protected applySelect(...args: any[]): void;
    protected applyList(rawList: string | string[], appliedListRef: string): boolean;
    protected applyDistinct(apply?: boolean): boolean;
    protected applyFilter(rawFilter: string): boolean;
    protected copyTo(copy: BaseQuery<T>): void;
    private copySelect(selection);
}
