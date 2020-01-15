import { BaseGroup } from './basePrototypes/baseGroup';
import { IBaseGroupDefinition as IUngroupDefinition } from './interfaces/IDefinition';
import { IUngroup } from './interfaces/iUngroup';

export class Ungroup extends BaseGroup<Ungroup> implements IUngroup {
    constructor(...selections: any[]) {
        super('Ungroup', ...selections);
    }

    clone(): IUngroup {
        const copied: Ungroup = new Ungroup(this._select);

        super.copyTo(copied);

        return copied;
    }

    getDefinition(): IUngroupDefinition {
        return super.getDefinition();
    }
}
