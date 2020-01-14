export interface IBaseQuery<T> {
    distinct(apply?: boolean): IBaseQuery<T>;
    filter(filter?: string): IBaseQuery<T>;
}
