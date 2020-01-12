import { BaseGroup } from './prototypes/baseGroup';

export class Ungroup extends BaseGroup<Ungroup> implements IUngroup {
    constructor(...selections: any[]) {
        super('Ungroup', ...selections);
    }

    clone(): IUngroup {
        const copied: Ungroup = new Ungroup(this._select);

        super.copyTo(copied);

        return copied;
    }
}
