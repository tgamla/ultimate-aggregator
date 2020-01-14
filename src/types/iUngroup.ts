import { IBaseGroup } from './iBaseGroup';

export interface IUngroup extends IBaseGroup<IUngroup> {
    clone(): IUngroup;
}
