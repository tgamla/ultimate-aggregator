import { Expression } from '../expressions/expression';

export type SubSelector = { string?: Selector } | Selector[] | Expression | string;

export class Selector {
    subSelectors: SubSelector;
    isLeaf: boolean;
    ungroupLabelDef: string; // TODO::

    constructor() {
        this.isLeaf = true;
        this.ungroupLabelDef = null;
        this.subSelectors = null;
    }
}
