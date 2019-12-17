interface IBaseQuery<T> {
    distinct(apply?: boolean): IBaseQuery<T>;
    filter(filter?: /* TODO:: Function | */ string): IBaseQuery<T>;
    // TODO:: range(start: number, end?: number): IBaseQuery<T>;
    // TODO:: totals(selection: any): T;
    // TODO:: asObject(propExpression?: string): IBaseQuery<T>;
    // TODO:: asList(): IBaseQuery<T>;
    // TODO:: asValue(propName?: string): IBaseQuery<T>;
    // TODO:: toString(): string;
}

interface IBaseGroup<T> extends IBaseQuery<T> {
    uniformed(apply?: boolean): IBaseGroup<T>;
}

interface IQuery<T> {
    config(config: IConfig): IQuery<T>;
    addContext(reference: Object | Function | string, value: any): IQuery<T>;
    removeContext(reference?: Object | string): IQuery<T>;
    preFilter(filter?: /* TODO:: Function | */ string): IQuery<T>;
    // TODO:: preOrderBy(filter?: Function | Array<string> | string): IQuery;
    // TODO:: define(varName: string, definition: string): IQuery;
    select(): IQuery<T>;
    from(datasource?: Array<any> | Object | IQuery<any>): IQuery<T>;
    groupBy(grouping?: string | Array<string>): IQuery<T>;
    filter(filter?: /* TODO:: Function | */ string): IQuery<T>;
    orderBy(sorting?: /* Function | */ Array<string> | string): IQuery<T>;
    // TODO:: range(start: number, end?: number): IQuery;
    // TODO:: toObject(labelDef?: string): Object;
    toList(): T; // TODO:: Promise<T> | Observable<T>
    // TODO:: toValue(): any;
    execute(datasource?: Array<any> | Object | IQuery<any>): T; // TODO:: Promise<T> | Observable<T>
    // TODO:: clone(): IQuery;
    // TODO:: toString(): string;
}

interface IGroup extends IBaseGroup<IGroup> {
    by(grouping?: string | Array<string>): IGroup;
    // TODO:: clone(): IGroup;
}

interface IUngroup extends IBaseGroup<IUngroup> {
    // TODO:: clone(): IUngroup;
}

interface IAggregateFunction {
    distinct(apply?: boolean): IAggregateFunction;
    over(grouping?: string | Array<string>): IAggregateFunction;
    orderBy(sorting?: string | Array<string>): IAggregateFunction;
    toString(): string;
    valueOf(): string;
    // TODO:: clone
}

interface IConfig {
    queryName?: string;
    logLevel?: number;
    throwingErrorsLevel?: number;
    debugLevel?: number;
    debugObjectToJSON?: boolean;
}