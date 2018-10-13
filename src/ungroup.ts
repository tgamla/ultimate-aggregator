import { BaseGroup } from './prototypes/baseGroup';

export class Ungroup extends BaseGroup<Ungroup> implements IUngroup {
    constructor(...selections: Array<any>) {
        super('Ungroup', ...selections);
    }

    clone(): IUngroup {
        var copied: Ungroup = new Ungroup(this._select);

        super.copyTo(copied);

        return copied;
    }
}
