export declare abstract class AggregateFormatter {
    static defineAggregation(aggrType: string, expCode: string, expObjDef: string, distinctRef?: string): string;
    static definePostProcessingAvg(expObjRef: string): string;
    static definePostProcessingConcat(expObjRef: string, delimiter: string, sortedValuesObjRef: string): string;
}
