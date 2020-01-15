
export interface IBaseQuery<T> {
    distinct(apply?: boolean): IBaseQuery<T>;
    filter(filter?: /* TODO:: Function | */ string): IBaseQuery<T>;
    // TODO:: range(start: number, end?: number): IBaseQuery<T>;
    // TODO:: totals(selection: any): T;
    // TODO:: asObject(propExpression?: string): IBaseQuery<T>;
    // TODO:: asList(): IBaseQuery<T>;
    // TODO:: asValue(propName?: string): IBaseQuery<T>;
    // TODO:: toString(): string;
}
