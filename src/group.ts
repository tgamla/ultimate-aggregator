import { BaseGroup } from './prototypes/baseGroup';

export class Group extends BaseGroup<Group> implements IGroup {

    constructor(...selections: Array<any>) {
        super('Group', ...selections);
    }
    
    by(grouping?: string | Array<string>): Group {
        this.applyList(grouping, '_groupBy');
        return this;
    }

    clone(): Group {
        var copied: Group = new Group(this._select);

        super.copyTo(copied);

        copied.by(this._groupBy);

        return copied;
    }
}
