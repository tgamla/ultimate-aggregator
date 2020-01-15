import { IConfig } from './iConfig';
export interface IQuery<T> {
    config(config: IConfig): IQuery<T>;
    addContext(reference: Object | Function | string, value: any): IQuery<T>;
    removeContext(reference?: Object | string): IQuery<T>;
    preFilter(filter?: string): IQuery<T>;
    select(): IQuery<T>;
    from(dataSource?: any[] | Object | IQuery<any>): IQuery<T>;
    groupBy(grouping?: string | string[]): IQuery<T>;
    filter(filter?: string): IQuery<T>;
    orderBy(sorting?: /* Function | */ string[] | string): IQuery<T>;
    toList(): T;
    execute(dataSource?: any[] | Object | IQuery<T>): T;
}
