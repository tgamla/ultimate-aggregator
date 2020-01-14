import { IConfig } from '../types/iConfig';
export declare class Logger {
    private readonly queryName;
    private readonly logLevel;
    private readonly throwingErrorsLevel;
    private readonly debugObjectToJSON;
    constructor(id: string, config: IConfig);
    debugObject(msg: string, obj: any): void;
    debug(msg: string): void;
    log(msgCode: string | number, refObj?: any): void;
    warning(msgCode: string | number, refObj?: any): void;
    error(msgCode: string | number | Error, refObj?: any): void;
    private getMessage(msg, refObj);
    private throwError(msg);
    private formatMessage(type, msg);
    private formatObject(obj);
}
export declare enum MessageCodes {
    UNGROUP_WITHIN_UNGROUP = 1,
    GROUP_WITHIN_UNGROUP = 2,
    GROUP_WITH_NO_GROUPING = 3,
    UNNECESSARY_GROUP_BY = 4,
    INDEX_USED_IN_GROUP = 5,
    EMPTY_CONFIG = 6,
    UNSUPPORTED_DATA_TYPE = 7,
    ANONYMOUS_FN_IN_CONTEXT = 8,
    ARRAY_IN_CONTEXT = 9,
    INCORRECT_REFERENCE_IN_CONTEXT = 10,
    EMPTY_REFERENCE_VALUE_IN_CONTEXT = 11,
    UNNECESSARY_OVERALL_GROUP_BY = 12,
}
