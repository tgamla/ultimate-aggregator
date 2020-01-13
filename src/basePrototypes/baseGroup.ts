import { BaseQuery } from './baseQuery';

export class BaseGroup<T> extends BaseQuery<T> implements IBaseGroup<T> {

    _uniformed: boolean;

    constructor(type: string, ...selections: any[]) {
        super(type);
        this._uniformed = false;
        this.applySelect.apply(this, selections);

        this.encapsulate();
    }

    uniformed(apply?: boolean): BaseGroup<T> {
        this._uniformed = !!(apply);
        return this;
    }

    copyTo(copy: BaseGroup<T>): void {
        super.copyTo(copy);

        copy.uniformed(this._uniformed);
    }
}
