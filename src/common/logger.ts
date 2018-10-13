import * as utils from './utils';

export class Logger {
    private queryName: string;
    private logLevel: number;
    private throwingErrorsLevel: number;
    private debugObjectToJSON: boolean;

    constructor(id: string, config: IConfig) {
        this.queryName = config.queryName || utils.denormalizeId(id);
        this.logLevel = config.logLevel == null ? 2 : config.logLevel;
        this.throwingErrorsLevel = config.throwingErrorsLevel == null ? 0 : config.throwingErrorsLevel;
        this.debugObjectToJSON = config.debugObjectToJSON || false;
    }

    debugObject(msg: string, obj: any): void {
        console.log(this.formatMessage('DEBUG Object', msg + ':'));
        console.log(this.formatObject(obj));
    }

    debug(msg: string): void {
        console.log(this.formatMessage('DEBUG', msg));
    }

    log(msgCode: string|number, refObj: any = ''): void {
        if (this.throwingErrorsLevel >= 3) {
            this.throwError(this.getMessage(msgCode, refObj));
        }
        if (this.logLevel >= 3) {
            console.log(this.formatMessage('Log', this.getMessage(msgCode, refObj)));
        }
    }

    warning(msgCode: string|number, refObj: any = ''): void {
        if (this.throwingErrorsLevel >= 2) {
            this.throwError(this.getMessage(msgCode, refObj));
        }
        if (this.logLevel >= 2) {
            console.warn(this.formatMessage('Warning', this.getMessage(msgCode, refObj)));
        }
    }

    error(msgCode: string|number|Error, refObj: any = ''): void {
        if (this.throwingErrorsLevel >= 1) {
            this.throwError(this.getMessage(msgCode, refObj));
        }
        if (this.logLevel >= 1) {
            console.error(this.formatMessage('Error', this.getMessage(msgCode, refObj)));
        }
    }

    private getMessage(msg: string|number|Error, refObj: any): string {
        var message = msg instanceof Error ? msg.message : (
            typeof msg === 'string' ? msg : Messages[msg]
        );
        return refObj ? message + '\n' + this.formatObject(refObj) : message;
    }

    private throwError(msg: string) {
        throw new Error(utils.format('Query({0}): {1}', this.queryName, msg));
    }

    private formatMessage(type: string, msg: string): string {
        return utils.format(
            'Query({0}) {1}: {2}',
            this.queryName,
            type,
            msg
        );
    }

    private formatObject(obj: any): any {
        return obj === undefined ? '' :
            (this.debugObjectToJSON ? JSON.stringify(obj) : obj);
    }
}

export enum MessageCodes {
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
    UNNECESSARY_OVERALL_GROUP_BY = 12
}

const Messages: Object = {
    '1': 'Unnecessary Ungroup: Please consider replacing Ungroup with Array as selector, inasmuch Ungroups parent is Ungroup;',
    '2': 'Unnecessary Group: Please consider replacing Group with Array as selector, inasmuch Groups outer scope is Ungroup;',
    '3': 'Unnecessary Group: Please consider replacing Group with Array as selector, inasmuch Group doesn\'t have grouping;',
    '4': 'Unnecessary grouping expression: Please consider removing grouping expression, inasmuch it is already part of outser scope grouping;',
    '5': 'Field Expression that is being defined in grouped scope shouldn\'t use "index" variable!',
    '6': 'Configuration has NOT been applied! config parameter has to be an Object type!',
    '7': 'Unsupported data type passed to Query by "from" function!',
    '8': 'Anonymous function cannot be passed to context, please consider givin it a name!',
    '9': 'Array cannot be passed to conext as reference! Please pass it as second parameter and reference name as first.',
    '10': 'Wrong type of reference has been passed to context;',
    '11': 'Reference value passed to context is empty;',
    '12': 'Unnecessary overall grouping in expression;'
};