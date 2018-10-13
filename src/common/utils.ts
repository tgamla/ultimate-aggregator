interface Iterator<T> {
    (val: T, prop?: string): void;
}
export function forEach<El>(source: any, iterator: Iterator<El>): void {
    if (source instanceof Array || (typeof source === 'object' && source !== null)) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                iterator(source[prop], prop);
            }
        }
    }
    else if (source != null) {
        iterator(source, null);
    }
}

export function forEachRecursive<El>(source: any, inner: string, iterator: Iterator<El>): void {
    forEach<El>(source[inner], (elem: El, prop: string) => {
        iterator(elem, prop);
        if (elem != null && typeof elem == 'object' && elem[inner]) {
            forEachRecursive<El>(elem, inner, iterator);
        }
    });
}

interface Accumulator<El, Out> {
    (acc: Out, val: El, prop?: string): Out;
}
export function reduce<El, Out>(source: any, iterator: Accumulator<El, Out>, accumulator: Out): Out {
    forEach<El>(source, (val, prop) => {
        accumulator = iterator(accumulator, val, prop);
    });

    return accumulator;
}

interface MapIterator<El, Out> {
    (val: El, prop?: string): Out;
}
export function map<InEl, OutEl>(source: any, iterator: MapIterator<InEl, OutEl>): Array<OutEl> {
    var res: Array<OutEl> = [];

    forEach<InEl>(source, (val, prop) =>
        res.push(iterator(val, prop))
    );

    return res;
}

export function reverseMap<InEl, OutEl>(source: any, iterator: MapIterator<InEl, OutEl>): Array<OutEl> {
    var reversedProperties: Array<string> = Object.keys(source).reverse();
    var res: Array<OutEl> = [];

    forEach<string>(reversedProperties, (prop) => {
        res.push(iterator(source[prop], prop));
    });

    return res;
}

export function find<El>(source: any, predicate: Iterator<El>): El {
    if (!isEmpty(source)) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop) && predicate(source[prop], prop)) {
                return source[prop];
            }
        }
    }

    return null;
}

interface IteratorReturnFound<T> {
    (val: T, prop?: string): T;
}
export function returnFound<El>(source: any, predicate: IteratorReturnFound<El>): El {
    if (!isEmpty(source)) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                var val = predicate(source[prop], prop);
                if (val) {
                    return val;
                }
            }
        }
    }

    return null;
}

export function some<El>(source: any, predicate: Iterator<El>): boolean {
    if (!isEmpty(source)) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop) && predicate(source[prop], prop)) {
                return true;
            }
        }
    }

    return false;
}

export function deepCopy<T>(source: T): T {
    var res: T = copy<T>(source);

    forEach(res, (val, prop) => {
        if (val && typeof val === 'object') {
            res[prop] = deepCopy(val);
        }
    });

    return res;
}

export function copy<T>(source: any, output?: T): T {
    if (typeof source === 'object' && source !== null) {
        var copy: T;

        if (output) {
            copy = output;
        }
        else if (source instanceof Array) {
            copy = <T & Array<any>>[];
        }
        else {
            copy = <T>{};
        }

        copy["__proto__"] = Object.getPrototypeOf(source);

        return reduce<T, T>(source, (copied, val, prop) => {
            copied[prop] = val;
            return copied;
        }, copy);
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

var id = 0;
export function generateId(): string {
    return formatId(++id);
}

export function denormalizeId(id: string): string {
    return id.replace(/__(\d+)__/, '$1');
}

const ID_TEMPLATE: string = '__{0}__';
export function formatId(id: any) {
    return format(ID_TEMPLATE, id.toString());
}

export function format(text: String, ...args: Array<string>): string {
    return (text || '').replace(/\{\d+}/gm, function(match): string {
        return args[parseInt(match.substring(1, match.length - 1))];
    });
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