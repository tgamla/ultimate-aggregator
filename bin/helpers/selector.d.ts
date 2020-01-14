import { Expression } from '../expressions/expression';
export declare type SubSelector = {
    string?: Selector;
} | Selector[] | Expression | string;
export declare class Selector {
    subSelectors: SubSelector;
    isLeaf: boolean;
    ungroupLabelDef: string;
    constructor();
}
