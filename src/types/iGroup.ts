import { IBaseGroup } from './iBaseGroup';

export interface IGroup extends IBaseGroup<IGroup> {
    by(grouping?: string | string[]): IGroup;
    clone(): IGroup;
}
