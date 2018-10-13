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

interface IQuery {
    config(config: IConfig): IQuery;
    addContext(reference: Object | Function | string, value: any): IQuery;
    removeContext(reference?: Object | string): IQuery;
    preFilter(filter?: /* TODO:: Function | */ string): IQuery;
    // TODO:: preOrderBy(filter?: Function | Array<string> | string): IQuery;
    // TODO:: define(varName: string, definition: string): IQuery;
    select(): IQuery;
    from(datasource?: Array<any> | Object | IQuery): IQuery;
    groupBy(grouping?: string | Array<string>): IQuery;
    filter(filter?: /* TODO:: Function | */ string): IQuery;
    orderBy(sorting?: /* Function | */ Array<string> | string): IQuery;
    // TODO:: range(start: number, end?: number): IQuery;
    // TODO:: toObject(labelDef?: string): Object;
    toList(): Array<any>;
    // TODO:: toValue(): any;
    execute(datasource?: Array<any> | Object | IQuery): any;
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