import { IConfig } from './iConfig';

export interface IQuery<T> {
    config(config: IConfig): IQuery<T>;
    addContext(reference: Object | Function | string, value: any): IQuery<T>;
    removeContext(reference?: Object | string): IQuery<T>;
    preFilter(filter?: /* TODO:: Function | */ string): IQuery<T>;
    // TODO:: preOrderBy(filter?: Function | Array<string> | string): IQuery;
    // TODO:: define(varName: string, definition: string): IQuery;
    select(): IQuery<T>;
    from(dataSource?: any[] | Object | IQuery<any>): IQuery<T>;
    groupBy(grouping?: string | string[]): IQuery<T>;
    filter(filter?: /* TODO:: Function | */ string): IQuery<T>;
    orderBy(sorting?: /* Function | */ string[] | string): IQuery<T>;
    // TODO:: range(start: number, end?: number): IQuery;
    // TODO:: toObject(labelDef?: string): Object;
    toList(): T; // TODO:: Promise<T> | Observable<T>
    // TODO:: toValue(): any;
    execute(dataSource?: any[] | Object | IQuery<T>): T; // TODO:: Promise<T> | Observable<T>
    // TODO:: clone(): IQuery;
    // TODO:: toString(): string;
}
