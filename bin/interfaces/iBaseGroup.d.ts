import { IBaseQuery } from './iBaseQuery';
export interface IBaseGroup<T> extends IBaseQuery<T> {
    uniformed(apply?: boolean): IBaseGroup<T>;
}
