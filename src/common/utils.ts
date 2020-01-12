
type IIterator<T> = (val: T, prop?: string) => void;

export function forEach<El>(source: any, iterator: IIterator<El>): void {
    if (source instanceof Array || (typeof source === 'object' && source !== null)) {
        for (const prop in source) {
            if (source.hasOwnProperty(prop)) {
                iterator(source[prop], prop);
            }
        }
    }
    else if (source != null) {
        iterator(source, null);
    }
}

export function forEachRecursive<El>(source: any, inner: string, iterator: IIterator<El>): void {
    forEach<El>(source[inner], (elem: El, prop: string) => {
        iterator(elem, prop);
        if (elem != null && typeof elem === 'object' && elem[inner]) {
            forEachRecursive<El>(elem, inner, iterator);
        }
    });
}

type IAccumulator<El, Out> = (acc: Out, val: El, prop?: string) => Out;

export function reduce<El, Out>(source: any, iterator: IAccumulator<El, Out>, accumulator: Out): Out {
    forEach<El>(source, (val, prop) => {
        accumulator = iterator(accumulator, val, prop);
    });

    return accumulator;
}

type IMapIterator<El, Out> = (val: El, prop?: string) => Out;

export function map<InEl, OutEl>(source: any, iterator: IMapIterator<InEl, OutEl>): OutEl[] {
    const res: OutEl[] = [];

    forEach<InEl>(source, (val, prop) =>
        res.push(iterator(val, prop))
    );

    return res;
}

export function reverseMap<InEl, OutEl>(source: any, iterator: IMapIterator<InEl, OutEl>): OutEl[] {
    const reversedProperties: string[] = Object.keys(source).reverse();
    const res: OutEl[] = [];

    forEach<string>(reversedProperties, (prop) => {
        res.push(iterator(source[prop], prop));
    });

    return res;
}

export function find<El>(source: any, predicate: IIterator<El>): El {
    if (!isEmpty(source)) {
        for (const prop in source) {
            if (source.hasOwnProperty(prop) && predicate(source[prop], prop)) {
                return source[prop];
            }
        }
    }

    return null;
}

type IIteratorReturnFound<T> = (val: T, prop?: string) => T;

export function returnFound<El>(source: any, predicate: IIteratorReturnFound<El>): El {
    if (!isEmpty(source)) {
        for (const prop in source) {
            if (source.hasOwnProperty(prop)) {
                const val = predicate(source[prop], prop);
                if (val) {
                    return val;
                }
            }
        }
    }

    return null;
}

export function some<El>(source: any, predicate: IIterator<El>): boolean {
    if (!isEmpty(source)) {
        for (const prop in source) {
            if (source.hasOwnProperty(prop) && predicate(source[prop], prop)) {
                return true;
            }
        }
    }

    return false;
}

export function deepCopy<T>(source: T): T {
    const res: T = copy<T>(source);
// TODO:: filter
    forEach(res, (val, prop) => {
        if (val && typeof val === 'object') {
            res[prop] = deepCopy(val);
        }
    });

    return res;
}

export function copy<T>(source: any, output?: T): T {
    if (typeof source === 'object' && source !== null) {
        let copiedObj: T;

        if (output) {
            copiedObj = output;
        }
        else if (source instanceof Array) {
            copiedObj = <T & any[]>[];
        }
        else {
            copiedObj = <T>{};
        }

        // TODO:: Object.setPrototypeOf(copy, Object.getPrototypeOf(source));
        // tslint:disable-next-line
        copy['__proto__'] = Object.getPrototypeOf(source);

        return reduce<T, T>(source, (copied, val, prop) => {
            copied[prop] = val;
            return copied;
        }, copiedObj);
    }
    else {
        return <T>source;
    }
}

export function isEmpty(val: any): boolean {
    return val == null ||
        (typeof val === 'object' && Object.keys(val).length === 0);
}

export function keysLength(source: any): number {
    if (source !== null && typeof source === 'object') {
        return Object.keys(source).length;
    }
    else {
        return -1;
    }
}

let currentId = 0;
export function generateId(): string {
    return formatId(++currentId);
}

export function denormalizeId(id: string): string {
    return id.replace(/__(\d+)__/, '$1');
}

const ID_TEMPLATE: string = '__{0}__';
export function formatId(id: any) {
    return format(ID_TEMPLATE, id.toString());
}

export function format(text: String, ...args: string[]): string {
    return (text || '').replace(/\{\d+}/gm, (match): string =>
        args[parseInt(match.substring(1, match.length - 1))]
    );
}

export function addIdSuffix(id: string, suffix: string): string {
    return id.replace(/(__$)/, suffix + '$1');
}

const PROTO_PROP_FLAGS = { enumerable: false };
export function encapsulate(obj: Object): void {
    Object.defineProperties(
        obj,
        reduce<PropertyDescriptorMap, PropertyDescriptorMap>(obj, (def, val, prop) => {
            def[prop] = PROTO_PROP_FLAGS;
            return def;
        }, {})
    );
    Object.freeze(obj);
}
