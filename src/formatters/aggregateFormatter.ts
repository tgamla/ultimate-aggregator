import * as utils from '../common/utils';
import { AggregateTemplates } from './templates/aggregateTemplates';

export abstract class AggregateFormatter {
    static defineAggregation(aggrType: string, expCode: string, expObjDef: string, distinctRef: string = ''): string {
        return utils.format(
            AggregateTemplates[aggrType],
            expCode,
            expObjDef,
            distinctRef
        );
    }

    static definePostProcessingAvg(expObjRef: string): string {
        return `${expObjRef} = ${expObjRef}.val / (${expObjRef}.count || 1);`;
    }

    static definePostProcessingConcat(expObjRef: string, delimiter: string, sortedValuesObjRef: string): string {
        return `${sortedValuesObjRef}${expObjRef} = ${expObjRef}.join(${delimiter});`;
    }
}
