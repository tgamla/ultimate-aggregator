import * as utils from '../common/utils';


export abstract class AggregateFromatter {
    static getAggrDefinition(aggrType: string, expCode: string, expObjDef: string, distinctRef: string = ''): string {
        return utils.format(
            AggregateTemplates[aggrType],
            expCode,
            expObjDef,
            distinctRef
        );
    }

    static getPostProcessingAvgDefinition(expObjRef: string): string {
        return `${expObjRef} = ${expObjRef}.val / (${expObjRef}.count || 1);`;
    }

    static getPostProcessingConcatDefinition(expObjRef: string, delimiter: string, sortedValuesObjRef: string): string {
        return `${sortedValuesObjRef}${expObjRef} = ${expObjRef}.join(${delimiter});`;
    }
}

// Typescript doesn't allow to assing multiline string to enums
export abstract class AggregateTemplates {
    static SUM =
`    __val__ = {0};
    if (__val__)
        {1} = ({1} || 0) + __val__;`;
    
    static DISTINCT_SUM =
`    __val__ = {0};
    if (__val__ && {2}[__val__] !== true) {
        {1} = ({1} || 0) + __val__;
        {2}[__val__] = true;
    }`;

    static MIN =
`    __val__ = {0};
    if (__val__ != null && ({1} > __val__ || {1} == null))
        {1} = __val__;`
    
    static MAX =
`    __val__ = {0};
    if (__val__ != null && ({1} < __val__ || {1} == null))
        {1} = __val__;`;
    
    static FIRST =
`    if ({2} === 1)
        {1} = {0};`;
    
    static FIRST_ORDER_BY =
`    __val__ = {2};
    if ({3} === 1 || {0}({1}, __val__) > 0)
        {1} = __val__;`;
    
    static LAST =
`    {1} = {0};`;

    static LAST_ORDER_BY =
`    __val__ = {2};
    if ({3} === 1 || {0}(__val__, {1}) > 0)
        {1} = __val__;`;
    
    static NTH =
`    if ({2} == {3})
        {1} = {0}`;
    
    static DISTINCT_NTH =
`    __val__ = {0};
    if ({3}[__val__] !== true) {
        if ({4} == {2})
            {1} = __val__;
        else {
            {3}[__val__] = true;
            {4}++;
        }
    }`;

    static NTH_ORDER_BY =
`    {0}.push({1});`;

    static DISTINCT_NTH_ORDER_BY =
`    __val__ = {1};
    if ({2}[__val__] !== true) {
        {0}.push(__val__);
        {2}[__val__] = true;
    }`;

    static COUNT =
`    if (({0}) != null)
        {1}++;`;
    
    static DISTINCT_COUNT =
`    __val__ = {0};
    if (__val__ != null && {2}[__val__] !== true) {
        {1}++;
        {2}[__val__] = true;
    }`;

    static AVG =
`    __val__ = {0}
    if (__val__ != null)
        { {1}.count++; {1}.val += __val__; };`;
    
    static DISTINCT_AVG =
`    __val__ = {0}
    if (__val__ != null && {2}[__val__] !== true) {
        {1}.count++;
        {1}.val += __val__;
        {2}[__val__] = true;
    };`;

    static CONCAT =
`    __val__ = {0};
    if (__val__ != null)
        {1}.push({2});`;
    
    static DISTINCT_CONCAT =
`    __val__ = {0};
    if (__val__ != null && {3}[__val__] !== true) {
        {1}.push({2});
        {3}[__val__] = true;
    }`;
}
