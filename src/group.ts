import { BaseGroup } from './prototypes/baseGroup';

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
}
