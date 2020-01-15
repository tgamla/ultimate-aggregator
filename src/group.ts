import { BaseGroup } from './basePrototypes/baseGroup';
import { IBaseGroupDefinition as IGroupDefinition } from './interfaces/IDefinition';
import { IGroup } from './interfaces/iGroup';

export class Group extends BaseGroup<Group> implements IGroup {

    constructor(...selections: any[]) {
        super('Group', ...selections);
    }

    by(grouping?: string | string[]): Group {
        this.applyList(grouping, '_groupBy');
        return this;
    }

    clone(): Group {
        const copied: Group = new Group(this._select);

        super.copyTo(copied);

        copied.by(this._groupBy);

        return copied;
    }

    getDefinition(): IGroupDefinition {
        return super.getDefinition();
    }
}
